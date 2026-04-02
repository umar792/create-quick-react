#!/usr/bin/env node
import path from "path";
import fs from "fs";
import chalk from "chalk";
import { execa } from "execa";
import inquirer from "inquirer";
import { execSync } from "child_process";
import { getAppTemplate } from "./template/app.js";
import { getMainTemplate } from "./template/main.js";

type LanguageChoice = "JavaScript" | "TypeScript";
type StateChoice = "Redux" | "Context API";
type StateMode = "None" | "Redux" | "Context API" | "Both";
type StylingChoice = "Tailwind" | "Tailwind + shadcn/ui";
type RouterMode = "None" | "React Router";
type AuthMode = "None" | "Demo Protected Route" | "JWT Starter";
type ApiClientChoice = "None" | "Fetch Client" | "Axios Client";
type StructureChoice = "Simple" | "Feature-based" | "Scalable";
type StarterChoice = "Dashboard" | "Landing Page" | "Settings Page";
type TestingChoice =
  | "None"
  | "Vitest"
  | "Vitest + React Testing Library"
  | "Playwright";
type LintingChoice = "None" | "Prettier" | "ESLint + Prettier";
type EnvChoice = "None" | "Basic";

interface Answers {
  projectName: string;
  language: LanguageChoice;
  state: StateChoice[];
  styling: StylingChoice;
  routing: boolean;
  authMode: AuthMode;
  apiClient: ApiClientChoice;
  testing: TestingChoice;
  linting: LintingChoice;
  envMode: EnvChoice;
  structure: StructureChoice;
  starter: StarterChoice[];
  packages: string[];
  uiPackages: string[];
  formPackages: string[];
  utilityPackages: string[];
  shadcnComponents: string[];
  quickMode: boolean;
}

interface PromptAnswers {
  projectName: string;
  language: LanguageChoice;
  stateMode: StateMode;
  styling: StylingChoice;
  routerMode: RouterMode;
  authMode: AuthMode;
  apiClient: ApiClientChoice;
  testing: TestingChoice;
  linting: LintingChoice;
  envMode: EnvChoice;
  structure: StructureChoice;
  starter: StarterChoice[];
  networking: string[];
  uiPackages: string[];
  formPackages: string[];
  utilityPackages: string[];
  shadcnComponents: string[];
}

interface CliOptions {
  projectName?: string;
  language?: LanguageChoice;
  stateMode?: StateMode;
  styling?: StylingChoice;
  routerMode?: RouterMode;
  authMode?: AuthMode;
  apiClient?: ApiClientChoice;
  testing?: TestingChoice;
  linting?: LintingChoice;
  envMode?: EnvChoice;
  structure?: StructureChoice;
  yes: boolean;
}

const DEFAULTS = {
  language: "TypeScript" as LanguageChoice,
  stateMode: "Both" as StateMode,
  styling: "Tailwind + shadcn/ui" as StylingChoice,
  routerMode: "React Router" as RouterMode,
  authMode: "Demo Protected Route" as AuthMode,
  apiClient: "Axios Client" as ApiClientChoice,
  testing: "Vitest + React Testing Library" as TestingChoice,
  linting: "ESLint + Prettier" as LintingChoice,
  envMode: "Basic" as EnvChoice,
  structure: "Feature-based" as StructureChoice,
  starter: ["Dashboard"] as StarterChoice[],
  networking: [] as string[],
  uiPackages: ["react-icons"] as string[],
  formPackages: [] as string[],
  utilityPackages: [] as string[],
  shadcnComponents: ["button", "card", "input"] as string[],
};

const LANGUAGE_CHOICES = [
  { name: "JavaScript - lighter setup with no TypeScript types", value: "JavaScript" as LanguageChoice },
  { name: "TypeScript - typed setup for better editor support and safer refactors", value: "TypeScript" as LanguageChoice },
];

const STATE_MODE_CHOICES = [
  { name: "None - no global state layer, keep the project minimal", value: "None" as StateMode },
  { name: "Redux - Redux Toolkit slices for structured shared app state", value: "Redux" as StateMode },
  { name: "Context API - simple app-wide state like theme and preferences", value: "Context API" as StateMode },
  { name: "Both - Context API for UI state and Redux for structured data", value: "Both" as StateMode },
];

const STYLING_CHOICES = [
  { name: "Tailwind - utility-first styling only", value: "Tailwind" as StylingChoice },
  { name: "Tailwind + shadcn/ui - Tailwind plus copyable UI components", value: "Tailwind + shadcn/ui" as StylingChoice },
];

const ROUTER_CHOICES = [
  { name: "None - single-page starter without route setup", value: "None" as RouterMode },
  { name: "React Router - modern data-router starter with route objects", value: "React Router" as RouterMode },
];

const AUTH_CHOICES = [
  { name: "None - no auth or protected route starter", value: "None" as AuthMode },
  { name: "Demo Protected Route - simple localStorage-based route protection", value: "Demo Protected Route" as AuthMode },
  { name: "JWT Starter - starter auth flow shaped for token-based backends", value: "JWT Starter" as AuthMode },
];

const API_CLIENT_CHOICES = [
  { name: "None - do not generate an API utility", value: "None" as ApiClientChoice },
  { name: "Fetch Client - lightweight browser-native request helper", value: "Fetch Client" as ApiClientChoice },
  { name: "Axios Client - axios instance with base URL starter", value: "Axios Client" as ApiClientChoice },
];

const TESTING_CHOICES = [
  { name: "None - skip testing setup", value: "None" as TestingChoice },
  { name: "Vitest - fast unit test runner", value: "Vitest" as TestingChoice },
  { name: "Vitest + React Testing Library - component testing starter", value: "Vitest + React Testing Library" as TestingChoice },
  { name: "Playwright - browser end-to-end testing starter", value: "Playwright" as TestingChoice },
];

const LINTING_CHOICES = [
  { name: "None - no formatter or lint helper", value: "None" as LintingChoice },
  { name: "Prettier - formatting only", value: "Prettier" as LintingChoice },
  { name: "ESLint + Prettier - formatting plus lint compatibility starter", value: "ESLint + Prettier" as LintingChoice },
];

const ENV_CHOICES = [
  { name: "None - no env files", value: "None" as EnvChoice },
  { name: "Basic - .env, .env.example, and env helper file", value: "Basic" as EnvChoice },
];

const STRUCTURE_CHOICES = [
  { name: "Simple - small app structure with only the basics", value: "Simple" as StructureChoice },
  { name: "Feature-based - good balance for growing apps", value: "Feature-based" as StructureChoice },
  { name: "Scalable - more folders for larger app organization", value: "Scalable" as StructureChoice },
];

const STARTER_PAGE_CHOICES = [
  { name: "Dashboard - starter internal app page", value: "Dashboard" as StarterChoice },
  { name: "Landing Page - simple marketing or hero page starter", value: "Landing Page" as StarterChoice },
  { name: "Settings Page - preferences or account settings starter", value: "Settings Page" as StarterChoice },
];

const run = (cmd: string, cwd = process.cwd()) => {
  console.log(`\n👉 Running: ${chalk.yellow(cmd)} in ${chalk.blue(cwd)}\n`);
  execSync(cmd, { stdio: "inherit", cwd });
};

const parseArgs = (): CliOptions => {
  const args = process.argv.slice(2);
  const options: CliOptions = { yes: false };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const next = args[index + 1];

    if (!arg.startsWith("--") && !options.projectName) {
      options.projectName = arg;
      continue;
    }

    switch (arg) {
      case "--yes":
      case "-y":
        options.yes = true;
        break;
      case "--lang":
        options.language = next === "js" ? "JavaScript" : "TypeScript";
        index += 1;
        break;
      case "--state":
        if (next === "none") options.stateMode = "None";
        if (next === "redux") options.stateMode = "Redux";
        if (next === "context") options.stateMode = "Context API";
        if (next === "both") options.stateMode = "Both";
        index += 1;
        break;
      case "--ui":
        options.styling =
          next === "shadcn" ? "Tailwind + shadcn/ui" : "Tailwind";
        index += 1;
        break;
      case "--router":
        options.routerMode = next === "none" ? "None" : "React Router";
        index += 1;
        break;
      case "--auth":
        if (next === "none") options.authMode = "None";
        if (next === "demo") options.authMode = "Demo Protected Route";
        if (next === "jwt") options.authMode = "JWT Starter";
        index += 1;
        break;
      case "--api":
        if (next === "none") options.apiClient = "None";
        if (next === "fetch") options.apiClient = "Fetch Client";
        if (next === "axios") options.apiClient = "Axios Client";
        index += 1;
        break;
      default:
        break;
    }
  }

  return options;
};

const getStateChoices = (stateMode: StateMode): StateChoice[] => {
  if (stateMode === "Both") {
    return ["Redux", "Context API"];
  }

  if (stateMode === "None") {
    return [];
  }

  return [stateMode];
};

const resolveAssetPath = (...segments: string[]) => {
  const candidates = [
    path.resolve(__dirname, "..", "src", ...segments),
    path.resolve(__dirname, ...segments),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(`Unable to locate asset path: ${segments.join("/")}`);
};

const updateViteConfigForTailwind = (projectPath: string) => {
  const viteConfigPath = fs.existsSync(path.join(projectPath, "vite.config.ts"))
    ? path.join(projectPath, "vite.config.ts")
    : path.join(projectPath, "vite.config.js");

  if (!fs.existsSync(viteConfigPath)) return;

  let viteConfig = fs.readFileSync(viteConfigPath, "utf-8");

  if (!viteConfig.includes("@tailwindcss/vite")) {
    viteConfig = `import tailwindcss from "@tailwindcss/vite";\n${viteConfig}`;
  }

  if (!viteConfig.includes("tailwindcss()")) {
    viteConfig = viteConfig.replace(
      /plugins:\s*\[/,
      "plugins: [\n    tailwindcss(),"
    );
  }

  fs.writeFileSync(viteConfigPath, viteConfig);
};

const updateViteConfigAlias = (projectPath: string) => {
  const viteConfigPath = fs.existsSync(path.join(projectPath, "vite.config.ts"))
    ? path.join(projectPath, "vite.config.ts")
    : path.join(projectPath, "vite.config.js");

  if (!fs.existsSync(viteConfigPath)) return;

  let viteConfig = fs.readFileSync(viteConfigPath, "utf-8");

  if (!viteConfig.includes('import path from "path";')) {
    viteConfig = `import path from "path";\n${viteConfig}`;
  }

  if (!viteConfig.includes("resolve:")) {
    viteConfig = viteConfig.replace(
      /export default defineConfig\(\{/,
      `export default defineConfig({\n  resolve: {\n    alias: {\n      "@": path.resolve(__dirname, "./src"),\n    },\n  },`
    );
  }

  fs.writeFileSync(viteConfigPath, viteConfig);
};

const updateJsonFile = (
  filePath: string,
  updater: (json: Record<string, any>) => Record<string, any>
) => {
  if (!fs.existsSync(filePath)) return;

  const current = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  fs.writeFileSync(filePath, `${JSON.stringify(updater(current), null, 2)}\n`);
};

const updateAliasConfig = (projectPath: string, language: LanguageChoice) => {
  if (language === "TypeScript") {
    for (const file of ["tsconfig.json", "tsconfig.app.json"]) {
      updateJsonFile(path.join(projectPath, file), (json) => ({
        ...json,
        compilerOptions: {
          ...(json.compilerOptions ?? {}),
          baseUrl: ".",
          paths: {
            ...(json.compilerOptions?.paths ?? {}),
            "@/*": ["./src/*"],
          },
        },
      }));
    }
    return;
  }

  updateJsonFile(path.join(projectPath, "jsconfig.json"), (json) => ({
    ...json,
    compilerOptions: {
      ...(json.compilerOptions ?? {}),
      baseUrl: ".",
      paths: {
        ...(json.compilerOptions?.paths ?? {}),
        "@/*": ["./src/*"],
      },
    },
  }));
};

const setupShadcn = (projectPath: string, language: LanguageChoice, components: string[]) => {
  console.log(chalk.blue("\n🎨 Setting up shadcn/ui...\n"));
  updateAliasConfig(projectPath, language);
  updateViteConfigAlias(projectPath);
  run("npx shadcn@latest init -d", projectPath);

  if (components.length > 0) {
    run(`npx shadcn@latest add ${components.join(" ")} -y`, projectPath);
  }
};

const ensureDir = (dirPath: string) => {
  fs.mkdirSync(dirPath, { recursive: true });
};

const writeText = (filePath: string, content: string) => {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content);
};

const getEnvFileContent = () =>
  `VITE_API_BASE_URL=http://localhost:5000/api/v1\nVITE_APP_NAME=Create Quick React App\n`;

const getEnvExampleContent = () =>
  `VITE_API_BASE_URL=\nVITE_APP_NAME=\n`;

const getEnvHelper = (language: LanguageChoice) =>
  language === "TypeScript"
    ? `export const env = {\n  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api/v1",\n  appName: import.meta.env.VITE_APP_NAME ?? "Create Quick React App",\n};\n`
    : `export const env = {\n  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api/v1",\n  appName: import.meta.env.VITE_APP_NAME ?? "Create Quick React App",\n};\n`;

const getApiClientTemplate = (language: LanguageChoice, apiClient: ApiClientChoice) => {
  if (apiClient === "None") return null;

  if (apiClient === "Axios Client") {
    return language === "TypeScript"
      ? `import axios from "axios";\nimport { env } from "../config/env";\n\nexport const apiClient = axios.create({\n  baseURL: env.apiBaseUrl,\n  headers: {\n    "Content-Type": "application/json",\n  },\n});\n`
      : `import axios from "axios";\nimport { env } from "../config/env";\n\nexport const apiClient = axios.create({\n  baseURL: env.apiBaseUrl,\n  headers: {\n    "Content-Type": "application/json",\n  },\n});\n`;
  }

  return language === "TypeScript"
    ? `import { env } from "../config/env";\n\nexport async function apiClient<T>(endpoint: string, init?: RequestInit): Promise<T> {\n  const response = await fetch(\`\${env.apiBaseUrl}\${endpoint}\`, {\n    headers: {\n      "Content-Type": "application/json",\n      ...(init?.headers ?? {}),\n    },\n    ...init,\n  });\n\n  if (!response.ok) {\n    throw new Error(\`Request failed with status \${response.status}\`);\n  }\n\n  return response.json() as Promise<T>;\n}\n`
    : `import { env } from "../config/env";\n\nexport async function apiClient(endpoint, init) {\n  const response = await fetch(\`\${env.apiBaseUrl}\${endpoint}\`, {\n    headers: {\n      "Content-Type": "application/json",\n      ...(init?.headers ?? {}),\n    },\n    ...init,\n  });\n\n  if (!response.ok) {\n    throw new Error(\`Request failed with status \${response.status}\`);\n  }\n\n  return response.json();\n}\n`;
};

const getFeatureReadme = (answers: Answers) => {
  const features = [
    `Language: ${answers.language}`,
    `State: ${answers.state.length > 0 ? answers.state.join(" + ") : "None"}`,
    `Styling: ${answers.styling}`,
    `Routing: ${answers.routing ? answers.authMode : "None"}`,
    `API client: ${answers.apiClient}`,
    `Testing: ${answers.testing}`,
    `Linting: ${answers.linting}`,
    `Environment files: ${answers.envMode}`,
    `Structure: ${answers.structure}`,
  ];
  const stackLines = features.map((item) => `- ${item}`).join("\n");
  const extraCommands = [
    answers.testing !== "None" ? "- `npm run test`" : "",
    answers.testing === "Playwright" ? "- `npm run test:e2e`" : "",
  ]
    .filter(Boolean)
    .join("\n");

  return `# ${answers.projectName}

Generated with [create-quick-react](https://github.com/umar792/create-quick-react).

## Selected stack

${stackLines}

## Available commands

- \`npm run dev\`
- \`npm run build\`
- \`npm run preview\`
${extraCommands}

## Next steps

- Update the starter content in \`src/\`
- Replace demo auth logic if you enabled protected routes
- Add real API endpoints in your env files
`;
};

const updatePackageJson = (
  projectPath: string,
  updater: (json: Record<string, any>) => Record<string, any>
) => {
  updateJsonFile(path.join(projectPath, "package.json"), updater);
};

const setupTesting = (projectPath: string, answers: Answers) => {
  if (answers.testing === "None") return;

  if (answers.testing === "Vitest") {
    run("npm install -D vitest", projectPath);
    updatePackageJson(projectPath, (json) => ({
      ...json,
      scripts: {
        ...(json.scripts ?? {}),
        test: "vitest",
      },
    }));
    return;
  }

  if (answers.testing === "Vitest + React Testing Library") {
    run(
      "npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom",
      projectPath
    );
    updatePackageJson(projectPath, (json) => ({
      ...json,
      scripts: {
        ...(json.scripts ?? {}),
        test: "vitest",
      },
    }));
    writeText(
      path.join(
        projectPath,
        "src",
        answers.language === "TypeScript" ? "App.test.tsx" : "App.test.jsx"
      ),
      answers.language === "TypeScript"
        ? `import { render, screen } from "@testing-library/react";\nimport App from "./App";\n\ntest("renders starter heading", () => {\n  render(<App />);\n  expect(screen.getByText(/starter/i)).toBeTruthy();\n});\n`
        : `import { render, screen } from "@testing-library/react";\nimport App from "./App";\n\ntest("renders starter heading", () => {\n  render(<App />);\n  expect(screen.getByText(/starter/i)).toBeTruthy();\n});\n`
    );
    return;
  }

  run("npm install -D @playwright/test", projectPath);
  updatePackageJson(projectPath, (json) => ({
    ...json,
    scripts: {
      ...(json.scripts ?? {}),
      "test:e2e": "playwright test",
    },
  }));
};

const setupLinting = (projectPath: string, linting: LintingChoice) => {
  if (linting === "None") return;

  run("npm install -D prettier", projectPath);
  writeText(path.join(projectPath, ".prettierrc"), '{\n  "semi": true,\n  "singleQuote": false\n}\n');

  if (linting === "ESLint + Prettier") {
    run("npm install -D eslint-config-prettier", projectPath);
    updatePackageJson(projectPath, (json) => ({
      ...json,
      scripts: {
        ...(json.scripts ?? {}),
        format: 'prettier --write "."',
      },
    }));
    return;
  }

  updatePackageJson(projectPath, (json) => ({
    ...json,
    scripts: {
      ...(json.scripts ?? {}),
      format: 'prettier --write "."',
    },
  }));
};

const applyProjectStructure = (projectPath: string, structure: StructureChoice) => {
  const srcRoot = path.join(projectPath, "src");
  const commonDirs = ["components", "lib"];

  if (structure === "Simple") {
    commonDirs.forEach((dir) => ensureDir(path.join(srcRoot, dir)));
    return;
  }

  if (structure === "Feature-based") {
    ["components", "features", "lib", "pages", "services"].forEach((dir) =>
      ensureDir(path.join(srcRoot, dir))
    );
    return;
  }

  ["components", "features", "hooks", "layouts", "lib", "services", "types"].forEach(
    (dir) => ensureDir(path.join(srcRoot, dir))
  );
};

const setupEnvFiles = (projectPath: string, language: LanguageChoice, envMode: EnvChoice) => {
  if (envMode === "None") return;

  writeText(path.join(projectPath, ".env"), getEnvFileContent());
  writeText(path.join(projectPath, ".env.example"), getEnvExampleContent());
  writeText(
    path.join(
      projectPath,
      "src",
      "config",
      language === "TypeScript" ? "env.ts" : "env.js"
    ),
    getEnvHelper(language)
  );
};

const setupApiClient = (projectPath: string, answers: Answers) => {
  const template = getApiClientTemplate(answers.language, answers.apiClient);
  if (!template) return;

  if (answers.apiClient === "Axios Client") {
    run("npm install axios", projectPath);
  }

  writeText(
    path.join(
      projectPath,
      "src",
      "lib",
      answers.language === "TypeScript" ? "api-client.ts" : "api-client.js"
    ),
    template
  );
};

const writeBaseFiles = (projectPath: string, answers: Answers) => {
  const useRedux = answers.state.includes("Redux");
  const useContext = answers.state.includes("Context API");
  const useShadcn = answers.styling === "Tailwind + shadcn/ui";
  const appFile = answers.language === "TypeScript" ? "App.tsx" : "App.jsx";
  const mainFile = answers.language === "TypeScript" ? "main.tsx" : "main.jsx";

  writeText(path.join(projectPath, "src", "index.css"), '@import "tailwindcss";\n');
  writeText(
    path.join(projectPath, "src", appFile),
    getAppTemplate({
      language: answers.language,
      projectName: answers.projectName,
      useRedux,
      useShadcn,
      useContext,
      useRouter: answers.routing,
      authMode: answers.authMode,
      starter: answers.starter,
      apiClient: answers.apiClient,
    })
  );
  writeText(
    path.join(projectPath, "src", mainFile),
    getMainTemplate({
      useContext,
      useRedux,
    })
  );
  writeText(path.join(projectPath, "README.md"), getFeatureReadme(answers));
};

const copyFolderRecursiveSync = (src: string, dest: string) => {
  ensureDir(dest);

  fs.readdirSync(src).forEach((file) => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);

    if (fs.lstatSync(srcPath).isDirectory()) {
      copyFolderRecursiveSync(srcPath, destPath);
      return;
    }

    fs.copyFileSync(srcPath, destPath);
  });
};

const copyReduxTemplate = (projectPath: string, answers: Answers) => {
  if (!answers.state.includes("Redux")) return;

  const templateDir =
    answers.language === "TypeScript"
      ? resolveAssetPath("reduxTs")
      : resolveAssetPath("ReduxJs");

  copyFolderRecursiveSync(templateDir, path.join(projectPath, "src", "redux"));
};

const copyContextTemplate = (projectPath: string, answers: Answers) => {
  if (!answers.state.includes("Context API")) return;

  const contextDir = path.join(projectPath, "src", "contextApi");
  ensureDir(contextDir);

  const sourceFile =
    answers.language === "TypeScript"
      ? resolveAssetPath("contextApi", "context.tsx")
      : resolveAssetPath("contextApi", "context.jsx");
  const destinationFile =
    answers.language === "TypeScript"
      ? path.join(contextDir, "context.tsx")
      : path.join(contextDir, "context.jsx");

  fs.copyFileSync(sourceFile, destinationFile);
};

const getUseAuthHook = (language: LanguageChoice, authMode: AuthMode) => {
  if (authMode === "None") {
    return language === "TypeScript"
      ? `export default function useAuth() {\n  return { isAuthenticated: true, login: () => {}, logout: () => {} };\n}\n`
      : `export default function useAuth() {\n  return { isAuthenticated: true, login: () => {}, logout: () => {} };\n}\n`;
  }

  const loginToken = authMode === "JWT Starter" ? "jwt-demo-token" : "demo-token";

  if (language === "TypeScript") {
    return `import { useSyncExternalStore } from "react";\n\nconst AUTH_TOKEN_KEY = "token";\nconst AUTH_EVENT = "quick-react-auth-change";\n\nconst emitAuthChange = () => {\n  window.dispatchEvent(new Event(AUTH_EVENT));\n};\n\nconst subscribe = (callback: () => void) => {\n  window.addEventListener("storage", callback);\n  window.addEventListener(AUTH_EVENT, callback);\n\n  return () => {\n    window.removeEventListener("storage", callback);\n    window.removeEventListener(AUTH_EVENT, callback);\n  };\n};\n\nconst getSnapshot = () => Boolean(localStorage.getItem(AUTH_TOKEN_KEY));\n\nexport default function useAuth() {\n  const isAuthenticated = useSyncExternalStore(subscribe, getSnapshot, () => false);\n\n  const login = () => {\n    localStorage.setItem(AUTH_TOKEN_KEY, "${loginToken}");\n    emitAuthChange();\n  };\n\n  const logout = () => {\n    localStorage.removeItem(AUTH_TOKEN_KEY);\n    emitAuthChange();\n  };\n\n  return { isAuthenticated, login, logout };\n}\n`;
  }

  return `import { useSyncExternalStore } from "react";\n\nconst AUTH_TOKEN_KEY = "token";\nconst AUTH_EVENT = "quick-react-auth-change";\n\nconst emitAuthChange = () => {\n  window.dispatchEvent(new Event(AUTH_EVENT));\n};\n\nconst subscribe = (callback) => {\n  window.addEventListener("storage", callback);\n  window.addEventListener(AUTH_EVENT, callback);\n\n  return () => {\n    window.removeEventListener("storage", callback);\n    window.removeEventListener(AUTH_EVENT, callback);\n  };\n};\n\nconst getSnapshot = () => Boolean(localStorage.getItem(AUTH_TOKEN_KEY));\n\nexport default function useAuth() {\n  const isAuthenticated = useSyncExternalStore(subscribe, getSnapshot, () => false);\n\n  const login = () => {\n    localStorage.setItem(AUTH_TOKEN_KEY, "${loginToken}");\n    emitAuthChange();\n  };\n\n  const logout = () => {\n    localStorage.removeItem(AUTH_TOKEN_KEY);\n    emitAuthChange();\n  };\n\n  return { isAuthenticated, login, logout };\n}\n`;
};

const getPrivateRouteHook = (language: LanguageChoice) => {
  if (language === "TypeScript") {
    return `import { Navigate, Outlet, useLocation } from "react-router-dom";\nimport useAuth from "./useAuth";\n\nexport default function PrivateRoute() {\n  const { isAuthenticated } = useAuth();\n  const location = useLocation();\n\n  if (!isAuthenticated) {\n    return <Navigate replace to="/login" state={{ from: location }} />;\n  }\n\n  return <Outlet />;\n}\n`;
  }

  return `import { Navigate, Outlet, useLocation } from "react-router-dom";\nimport useAuth from "./useAuth";\n\nexport default function PrivateRoute() {\n  const { isAuthenticated } = useAuth();\n  const location = useLocation();\n\n  if (!isAuthenticated) {\n    return <Navigate replace to="/login" state={{ from: location }} />;\n  }\n\n  return <Outlet />;\n}\n`;
};

const createRoutingHooks = (projectPath: string, answers: Answers) => {
  if (!answers.routing) return;

  const hooksDir = path.join(projectPath, "src", "hooks");
  ensureDir(hooksDir);

  writeText(
    path.join(
      hooksDir,
      answers.language === "TypeScript" ? "useAuth.ts" : "useAuth.js"
    ),
    getUseAuthHook(answers.language, answers.authMode)
  );

  if (answers.authMode !== "None") {
    writeText(
      path.join(
        hooksDir,
        answers.language === "TypeScript"
          ? "usePrivateRoute.tsx"
          : "usePrivateRoute.jsx"
      ),
      getPrivateRouteHook(answers.language)
    );
  }
};

const getAnswersFromPrompts = async (cliOptions: CliOptions): Promise<Answers> => {
  if (cliOptions.yes) {
    return {
      projectName: cliOptions.projectName ?? "my-app",
      language: cliOptions.language ?? DEFAULTS.language,
      state: getStateChoices(cliOptions.stateMode ?? DEFAULTS.stateMode),
      styling: cliOptions.styling ?? DEFAULTS.styling,
      routing: (cliOptions.routerMode ?? DEFAULTS.routerMode) === "React Router",
      authMode: cliOptions.authMode ?? DEFAULTS.authMode,
      apiClient: cliOptions.apiClient ?? DEFAULTS.apiClient,
      testing: cliOptions.testing ?? DEFAULTS.testing,
      linting: cliOptions.linting ?? DEFAULTS.linting,
      envMode: cliOptions.envMode ?? DEFAULTS.envMode,
      structure: cliOptions.structure ?? DEFAULTS.structure,
      starter: DEFAULTS.starter,
      packages: [
        ...DEFAULTS.networking,
        ...DEFAULTS.uiPackages,
        ...DEFAULTS.formPackages,
        ...DEFAULTS.utilityPackages,
      ],
      uiPackages: DEFAULTS.uiPackages,
      formPackages: DEFAULTS.formPackages,
      utilityPackages: DEFAULTS.utilityPackages,
      shadcnComponents: DEFAULTS.shadcnComponents,
      quickMode: true,
    };
  }

  const promptAnswers = await inquirer.prompt<PromptAnswers>(
    [
      {
        type: "input",
        name: "projectName",
        message: "Enter your project name:",
        default: cliOptions.projectName ?? "my-app",
        validate: (input: string) =>
          /^[a-zA-Z0-9-_]+$/.test(input)
            ? true
            : "Project name must only contain letters, numbers, hyphens, or underscores.",
      },
      {
        type: "list",
        name: "language",
        message: "Choose your language:",
        default: cliOptions.language ?? DEFAULTS.language,
        choices: LANGUAGE_CHOICES,
      },
      {
        type: "list",
        name: "stateMode",
        message: "Choose state management:",
        default: cliOptions.stateMode ?? DEFAULTS.stateMode,
        choices: STATE_MODE_CHOICES,
      },
      {
        type: "list",
        name: "styling",
        message: "Choose styling setup:",
        default: cliOptions.styling ?? DEFAULTS.styling,
        choices: STYLING_CHOICES,
      },
      {
        type: "list",
        name: "routerMode",
        message: "Choose routing:",
        default: cliOptions.routerMode ?? DEFAULTS.routerMode,
        choices: ROUTER_CHOICES,
      },
      {
        type: "list",
        name: "authMode",
        message: "Choose auth starter:",
        default: cliOptions.authMode ?? DEFAULTS.authMode,
        when: (answers) => answers.routerMode === "React Router",
        choices: AUTH_CHOICES,
      },
      {
        type: "list",
        name: "apiClient",
        message: "Choose API client starter:",
        default: cliOptions.apiClient ?? DEFAULTS.apiClient,
        choices: API_CLIENT_CHOICES,
      },
      {
        type: "list",
        name: "testing",
        message: "Choose testing setup:",
        default: cliOptions.testing ?? DEFAULTS.testing,
        choices: TESTING_CHOICES,
      },
      {
        type: "list",
        name: "linting",
        message: "Choose formatting and linting:",
        default: cliOptions.linting ?? DEFAULTS.linting,
        choices: LINTING_CHOICES,
      },
      {
        type: "list",
        name: "envMode",
        message: "Environment files:",
        default: cliOptions.envMode ?? DEFAULTS.envMode,
        choices: ENV_CHOICES,
      },
      {
        type: "list",
        name: "structure",
        message: "Choose project structure:",
        default: cliOptions.structure ?? DEFAULTS.structure,
        choices: STRUCTURE_CHOICES,
      },
      {
        type: "checkbox",
        name: "starter",
        message: "Starter page presets (select any):",
        default: DEFAULTS.starter,
        choices: STARTER_PAGE_CHOICES,
      },
      {
        type: "checkbox",
        name: "networking",
        message: "Networking packages (select any):",
        choices: [
          {
            name: "Axios - promise-based HTTP client for APIs",
            value: "axios",
          },
        ],
      },
      {
        type: "checkbox",
        name: "uiPackages",
        message: "UI packages (select any):",
        default: DEFAULTS.uiPackages,
        choices: [
          { name: "React Icons - icon library for common app icons", value: "react-icons" },
          { name: "Sonner - toast notifications", value: "sonner" },
        ],
      },
      {
        type: "checkbox",
        name: "formPackages",
        message: "Forms packages (select any):",
        choices: [
          { name: "React Hook Form - lightweight modern form state library", value: "react-hook-form" },
          { name: "Formik - classic form state management library", value: "formik" },
          { name: "Yup - schema validation for forms", value: "yup" },
        ],
      },
      {
        type: "checkbox",
        name: "utilityPackages",
        message: "Utility packages (select any):",
        choices: [
          { name: "Moment.js - date formatting and manipulation", value: "moment" },
          { name: "Day.js - lighter date utility alternative", value: "dayjs" },
          { name: "clsx - conditional className helper", value: "clsx" },
        ],
      },
      {
        type: "checkbox",
        name: "shadcnComponents",
        message: "shadcn/ui starter components (select any):",
        default: DEFAULTS.shadcnComponents,
        when: (answers) => answers.styling === "Tailwind + shadcn/ui",
        choices: [
          { name: "button - reusable primary and secondary buttons", value: "button" },
          { name: "card - layout blocks for dashboards and content", value: "card" },
          { name: "input - text input fields", value: "input" },
          { name: "form - form primitives and helpers", value: "form" },
          { name: "dialog - modal dialog starter", value: "dialog" },
          { name: "table - data table building block", value: "table" },
          { name: "dropdown-menu - menus for actions and navigation", value: "dropdown-menu" },
        ],
      },
    ] as any
  );

  return {
    projectName: promptAnswers.projectName,
    language: promptAnswers.language,
    state: getStateChoices(promptAnswers.stateMode),
    styling: promptAnswers.styling,
    routing: promptAnswers.routerMode === "React Router",
    authMode:
      promptAnswers.routerMode === "React Router"
        ? promptAnswers.authMode ?? "None"
        : "None",
    apiClient: promptAnswers.apiClient,
    testing: promptAnswers.testing,
    linting: promptAnswers.linting,
    envMode: promptAnswers.envMode,
    structure: promptAnswers.structure,
    starter: promptAnswers.starter ?? [],
    packages: [
      ...(promptAnswers.networking ?? []),
      ...(promptAnswers.uiPackages ?? []),
      ...(promptAnswers.formPackages ?? []),
      ...(promptAnswers.utilityPackages ?? []),
    ],
    uiPackages: promptAnswers.uiPackages ?? [],
    formPackages: promptAnswers.formPackages ?? [],
    utilityPackages: promptAnswers.utilityPackages ?? [],
    shadcnComponents: promptAnswers.shadcnComponents ?? [],
    quickMode: false,
  };
};

const printSuccessSummary = (answers: Answers, projectName: string) => {
  console.log(chalk.green(`\n🎉 Project ${chalk.yellow(projectName)} is ready!`));
  console.log(chalk.cyan("Selected stack:"));
  console.log(chalk.white(`  Language: ${answers.language}`));
  console.log(
    chalk.white(
      `  State: ${answers.state.length > 0 ? answers.state.join(" + ") : "None"}`
    )
  );
  console.log(chalk.white(`  Styling: ${answers.styling}`));
  console.log(chalk.white(`  Routing: ${answers.routing ? answers.authMode : "None"}`));
  console.log(chalk.white(`  API client: ${answers.apiClient}`));
  console.log(chalk.white(`  Testing: ${answers.testing}`));
  console.log(chalk.white(`  Linting: ${answers.linting}`));
  console.log(chalk.white(`  Structure: ${answers.structure}`));
  console.log(chalk.cyan("\nNext steps:"));
  console.log(chalk.white(`  cd ${projectName}`));
  console.log(chalk.white("  npm run dev"));
  if (answers.testing !== "None") {
    console.log(
      chalk.white(
        `  ${answers.testing === "Playwright" ? "npm run test:e2e" : "npm run test"}`
      )
    );
  }
};

async function main() {
  const cliOptions = parseArgs();

  console.log(chalk.cyan("🚀 Welcome to Create-Quick-React CLI"));

  const promptAnswers = await getAnswersFromPrompts(cliOptions);
  const answers: Answers = {
    ...promptAnswers,
    projectName: promptAnswers.projectName.trim() || "my-app",
  };

  console.log(chalk.green("\n✨ Creating project...\n"));

  const template = answers.language === "TypeScript" ? "react-ts" : "react";
  const projectPath = path.join(process.cwd(), answers.projectName);

  await execa(
    "npm",
    ["create", "vite@latest", answers.projectName, "--", "--template", template],
    { stdio: "inherit" }
  );

  console.log(chalk.blue("\n⚡ Setting up Tailwind...\n"));
  run(
    "npm install -D tailwindcss @tailwindcss/vite postcss autoprefixer",
    projectPath
  );
  updateViteConfigForTailwind(projectPath);

  const deps = new Set<string>(answers.packages);

  if (answers.state.includes("Redux")) {
    ["redux", "@reduxjs/toolkit", "react-redux", "redux-persist"].forEach((dep) =>
      deps.add(dep)
    );
  }

  if (answers.routing) {
    deps.add("react-router-dom");
  }

  if (deps.size > 0) {
    console.log(chalk.blue("\n📦 Installing dependencies...\n"));
    run(`npm install ${Array.from(deps).join(" ")}`, projectPath);
  }

  const appCssPath = path.join(projectPath, "src", "App.css");
  if (fs.existsSync(appCssPath)) {
    fs.unlinkSync(appCssPath);
  }

  applyProjectStructure(projectPath, answers.structure);
  setupEnvFiles(projectPath, answers.language, answers.envMode);
  setupApiClient(projectPath, answers);
  writeBaseFiles(projectPath, answers);
  copyReduxTemplate(projectPath, answers);
  copyContextTemplate(projectPath, answers);
  createRoutingHooks(projectPath, answers);

  if (answers.styling === "Tailwind + shadcn/ui") {
    setupShadcn(projectPath, answers.language, answers.shadcnComponents);
  }

  setupTesting(projectPath, answers);
  setupLinting(projectPath, answers.linting);
  printSuccessSummary(answers, answers.projectName);
}

main();
