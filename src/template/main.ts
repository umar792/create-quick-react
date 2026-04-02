export interface MainTemplateOptions {
  useContext: boolean;
  useRedux: boolean;
}

const getWrapperImports = ({ useContext, useRedux }: MainTemplateOptions) => {
  const imports = [
    'import { StrictMode } from "react";',
    'import { createRoot } from "react-dom/client";',
    'import App from "./App";',
  ];

  if (useRedux) {
    imports.push('import { Provider } from "react-redux";');
    imports.push('import { PersistGate } from "redux-persist/integration/react";');
    imports.push('import { reduxPersister, reduxStore } from "./redux/store";');
  }

  if (useContext) {
    imports.push('import { ThemeProvider } from "./contextApi/context";');
  }

  return imports.join("\n");
};

const wrapApp = ({ useContext, useRedux }: MainTemplateOptions) => {
  let app = "<App />";

  if (useContext) {
    app = `<ThemeProvider>\n        ${app}\n      </ThemeProvider>`;
  }

  if (useRedux) {
    app = `<Provider store={reduxStore}>\n      <PersistGate loading={null} persistor={reduxPersister}>\n        ${app}\n      </PersistGate>\n    </Provider>`;
  }

  return app;
};

export const getMainTemplate = (options: MainTemplateOptions) => `${getWrapperImports(options)}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    ${wrapApp(options)}
  </StrictMode>,
);
`;
