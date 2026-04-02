type AuthMode = "None" | "Demo Protected Route" | "JWT Starter";
type ApiClientChoice = "None" | "Fetch Client" | "Axios Client";
type StarterChoice = "Dashboard" | "Landing Page" | "Settings Page";

export interface AppTemplateOptions {
  language: "JavaScript" | "TypeScript";
  projectName: string;
  useRedux: boolean;
  useShadcn: boolean;
  useContext: boolean;
  useRouter: boolean;
  authMode: AuthMode;
  apiClient: ApiClientChoice;
  starter: StarterChoice[];
}

const getContextImport = (useContext: boolean) =>
  useContext ? 'import { useTheme } from "./contextApi/context";\n' : "";

const getReduxImport = (useRedux: boolean) => {
  if (!useRedux) return "";

  return `import { decrement, increment, reset, selectCounterValue } from "./redux/slices/counterSlice";\nimport { useAppDispatch, useAppSelector } from "./redux/hooks";\n`;
};

const getShadcnImport = (useShadcn: boolean) =>
  useShadcn
    ? 'import { Button } from "@/components/ui/button";\nimport { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";\n'
    : "";

const getApiClientImport = (
  language: "JavaScript" | "TypeScript",
  apiClient: ApiClientChoice
) => {
  if (apiClient === "None") return "";

  return language === "TypeScript"
    ? 'import { apiClient } from "./lib/api-client";\n'
    : 'import { apiClient } from "./lib/api-client";\n';
};

const getThemeHelpers = (useContext: boolean) =>
  useContext
    ? `
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle color theme"
      className="inline-flex items-center gap-3 rounded-full border border-current/20 bg-white/10 px-4 py-2 text-sm font-medium shadow-sm transition hover:scale-[1.02] hover:bg-white/15"
    >
      <span
        className={\`inline-flex h-6 w-11 items-center rounded-full transition \${theme === "dark" ? "bg-cyan-300/80 justify-end" : "bg-slate-400/70 justify-start"}\`}
      >
        <span className="mx-1 h-4 w-4 rounded-full bg-white" />
      </span>
      <span>{theme === "dark" ? "Dark mode" : "Light mode"}</span>
    </button>
  );
}
`
    : "";

const getReduxHelpers = (useRedux: boolean, useShadcn: boolean) =>
  useRedux
    ? `
function ReduxCounterCard() {
  const dispatch = useAppDispatch();
  const count = useAppSelector(selectCounterValue);

  return (
${useShadcn ? `    <Card className="border-slate-800 bg-slate-900/80 shadow-lg shadow-slate-950/20">
      <CardHeader>
        <CardTitle>Redux slice</CardTitle>
        <CardDescription>
          A modern Redux Toolkit starter with a slice, selector, and persisted state.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <h2 className="text-3xl font-black">{count}</h2>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => dispatch(decrement())}>
            Decrease
          </Button>
          <Button onClick={() => dispatch(increment())}>Increase</Button>
          <Button variant="secondary" onClick={() => dispatch(reset())}>
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>` : `    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/20">
      <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Redux slice</p>
      <h2 className="mt-3 text-3xl font-black">{count}</h2>
      <p className="mt-2 text-sm text-slate-400">
        A modern Redux Toolkit starter with a slice, selector, and persisted state.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={() => dispatch(decrement())}
          className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium transition hover:border-white/30 hover:text-white"
        >
          Decrease
        </button>
        <button
          onClick={() => dispatch(increment())}
          className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
        >
          Increase
        </button>
        <button
          onClick={() => dispatch(reset())}
          className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium transition hover:border-white/30 hover:text-white"
        >
          Reset
        </button>
      </div>
    </div>`}
  );
}
`
    : "";

const getApiHelpers = (apiClient: ApiClientChoice) =>
  apiClient !== "None"
    ? `
async function loadHealthcheck() {
  try {
${apiClient === "Axios Client" ? `    await apiClient.get("/health");` : `    await apiClient("/health");`}
  } catch (error) {
    console.info("Replace the demo API endpoint with your real backend.", error);
  }
}
`
    : "";

const getShellClassName = (useContext: boolean) =>
  useContext
    ? '{`min-h-screen transition-colors duration-300 ${theme === "dark" ? "bg-slate-950 text-slate-100" : "bg-stone-50 text-slate-900"}`}'
    : '"min-h-screen bg-slate-950 text-slate-100"';

const getHeroCards = (
  useContext: boolean,
  useRedux: boolean,
  appExtension: string,
  starter: StarterChoice[]
) => `        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
            <h2 className="text-lg font-semibold">Tailwind ready</h2>
            <p className="mt-2 text-sm text-slate-400">
              Start building UI immediately with a clean Vite + React foundation.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
            <h2 className="text-lg font-semibold">${useContext ? "Theme context" : useRedux ? "Redux Toolkit" : "Simple starter"}</h2>
            <p className="mt-2 text-sm text-slate-400">
              ${useContext ? "ThemeProvider and useTheme are already connected for you." : useRedux ? "Slices, persisted state, and store hooks are already connected for you." : "Keep the starter lightweight and add only the patterns you need."}
            </p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
            <h2 className="text-lg font-semibold">Next step</h2>
            <p className="mt-2 text-sm text-slate-400">
              Open App.${appExtension} and start turning this scaffold into your product.
            </p>
          </div>
        </div>
${starter.length > 0 ? `        <p className="text-sm text-slate-400">Starter presets enabled: ${starter.join(", ")}.</p>\n` : ""}`;

const getAppBody = ({
  projectName,
  language,
  useRedux,
  useShadcn,
  useContext,
  useRouter,
  authMode,
  apiClient,
  starter,
}: AppTemplateOptions) => {
  const themeHook = useContext ? '  const { theme } = useTheme();\n' : "";
  const toggleButton = useContext ? "          <ThemeToggle />\n" : "";
  const appExtension = language === "TypeScript" ? "tsx" : "jsx";
  const stateMessage = [
    useRouter ? "routing enabled" : "",
    useContext ? "theme context ready" : "",
    useRedux ? "Redux Toolkit slices ready" : "",
    apiClient !== "None" ? apiClient.toLowerCase() : "",
  ]
    .filter(Boolean)
    .join(", ");
  const featureIntro = `          <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            ${projectName} was created with Create Quick React. You already have Tailwind wired up${stateMessage ? `, ${stateMessage}` : ""}, and a starter structure that is easier to extend than a blank Vite app.
          </p>`;
  const githubLink = `          <a
            href="https://github.com/umar792/create-quick-react"
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/40 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:border-cyan-300 hover:text-cyan-200"
          >
            View the Create Quick React repository
          </a>`;
  const homeToggle = useContext ? "      <ThemeToggle />\n" : "";
  const reduxCard = useRedux ? "          <ReduxCounterCard />\n" : "";
  const shadcnNote = useShadcn
    ? '        <p className="text-sm text-slate-400">shadcn/ui starter components are installed too, so you can begin with open-code UI components instead of a locked component package.</p>\n'
    : "";
  const apiNote =
    apiClient !== "None"
      ? `        <p className="text-sm text-slate-400">A ${apiClient.toLowerCase()} starter was generated in <code>src/lib</code> and reads from your env files.</p>\n`
      : "";

  if (!useRouter) {
    return `
function App() {
${themeHook}${apiClient !== "None" ? "  void loadHealthcheck();\n" : ""}  return (
    <div className=${getShellClassName(useContext)}>
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center gap-8 px-6 py-16">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2 text-xs uppercase tracking-[0.3em] text-cyan-300">
          Quick start
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
            ${projectName}
          </h1>
${featureIntro}
${githubLink}
${homeToggle}
        </div>
${getHeroCards(useContext, useRedux, appExtension, starter)}
${reduxCard}${useContext && useRedux ? '        <p className="text-sm text-slate-400">Context handles app-wide UI concerns like theme, while Redux is ready for structured shared state.</p>\n' : ""}
${shadcnNote}${apiNote}
${toggleButton}      </main>
    </div>
  );
}
`;
  }

  return `
import {
  Navigate,
  NavLink,
  Outlet,
  RouterProvider,
  createBrowserRouter,
  useLocation,
  useNavigate,
} from "react-router-dom";
${authMode !== "None" ? 'import PrivateRoute from "./hooks/usePrivateRoute";\nimport useAuth from "./hooks/useAuth";\n' : ""}

function Home() {
  return (
    <section className="space-y-6">
      <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Starter home</p>
      <h1 className="text-4xl font-black tracking-tight sm:text-6xl">${projectName}</h1>
${featureIntro}
${githubLink}
${homeToggle}
${useRedux ? "      <ReduxCounterCard />\n" : ""}${useContext && useRedux ? '      <p className="max-w-2xl text-sm leading-7 text-slate-400">This starter uses Context API for UI state like theme and Redux Toolkit slices for shared app state.</p>\n' : ""}
${useShadcn ? '      <p className="max-w-2xl text-sm leading-7 text-slate-400">shadcn/ui is configured too, with starter components added so you can move quickly without giving up code ownership.</p>\n' : ""}
${apiClient !== "None" ? '      <p className="max-w-2xl text-sm leading-7 text-slate-400">An API client starter is ready in <code>src/lib</code> and reads from your env files.</p>\n' : ""}
    </section>
  );
}

function About() {
  return (
    <section className="space-y-4">
      <h2 className="text-3xl font-bold">About this starter</h2>
      <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
        This scaffold keeps the first commit small while still giving you routing, a modern structure, and a setup that is ready for real app code.
      </p>
    </section>
  );
}

function Dashboard() {
  return (
    <section className="space-y-4">
      <h2 className="text-3xl font-bold">Dashboard</h2>
      <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
        ${authMode === "JWT Starter" ? "This page sits behind the JWT-style demo auth starter. Replace the local token logic with your backend auth flow." : authMode === "Demo Protected Route" ? "This route is protected by the starter PrivateRoute wrapper. Replace the demo auth logic in hooks/useAuth with your real session flow." : "This is a standard routed page ready for your real app content."}
      </p>
    </section>
  );
}

function SettingsPage() {
  return (
    <section className="space-y-4">
      <h2 className="text-3xl font-bold">Settings</h2>
      <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
        A simple starter page for user preferences, app settings, or account options.
      </p>
    </section>
  );
}

function LandingPage() {
  return (
    <section className="space-y-4">
      <h2 className="text-3xl font-bold">Landing page</h2>
      <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
        Use this section as a clean product overview page with a hero, feature highlights, and onboarding-friendly content.
      </p>
    </section>
  );
}

function NotFoundPage() {
  return (
    <section className="space-y-4">
      <h2 className="text-3xl font-bold">Page not found</h2>
      <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
        The route you requested does not exist yet.
      </p>
    </section>
  );
}

${authMode !== "None" ? `function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const redirectPath = location.state?.from?.pathname ?? "/dashboard";

  if (isAuthenticated) {
    return <Navigate replace to={redirectPath} />;
  }

  const handleLogin = () => {
    login();
    navigate(redirectPath, { replace: true });
  };

  return (
    <section className="space-y-4">
      <h2 className="text-3xl font-bold">Login</h2>
      <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
        This demo button stores a fake token in localStorage so you can see the protected route flow immediately.
      </p>
      ${useShadcn ? `<Button onClick={handleLogin}>Continue to dashboard</Button>` : `<button
        onClick={handleLogin}
        className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
      >
        Continue to dashboard
      </button>`}
    </section>
  );
}` : ""}

function RootLayout() {
${themeHook}${authMode !== "None" ? "  const { isAuthenticated, logout } = useAuth();\n" : ""}  return (
    <div className=${getShellClassName(useContext)}>
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <NavLink to="/" end className="text-lg font-black tracking-wide text-cyan-300">
            ${projectName}
          </NavLink>
          <nav className="flex items-center gap-4 text-sm text-slate-300">
            <NavLink to="/" end className="transition hover:text-white">Home</NavLink>
            <NavLink to="/about" className="transition hover:text-white">About</NavLink>
            <NavLink to="/dashboard" className="transition hover:text-white">Dashboard</NavLink>
${starter.includes("Settings Page") ? '            <NavLink to="/settings" className="transition hover:text-white">Settings</NavLink>\n' : ""}${starter.includes("Landing Page") ? '            <NavLink to="/landing" className="transition hover:text-white">Landing</NavLink>\n' : ""}${authMode !== "None" ? '            <NavLink to="/login" className="transition hover:text-white">Login</NavLink>\n' : ""}${toggleButton}${authMode !== "None" ? useShadcn ? `            {isAuthenticated ? (
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            ) : null}` : `            {isAuthenticated ? (
              <button
                onClick={logout}
                className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium transition hover:border-white/30 hover:text-white"
              >
                Logout
              </button>
            ) : null}` : ""}
          </nav>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-6xl flex-1 px-6 py-16">
        <Outlet />
      </main>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "about",
        element: <About />,
      },
      ${authMode !== "None" ? `{
        element: <PrivateRoute />,
        children: [
          {
            path: "dashboard",
            element: <Dashboard />,
          },
        ],
      },` : `{
        path: "dashboard",
        element: <Dashboard />,
      },`}
      ${starter.includes("Settings Page") ? `{
        path: "settings",
        element: <SettingsPage />,
      },` : ""}
      ${starter.includes("Landing Page") ? `{
        path: "landing",
        element: <LandingPage />,
      },` : ""}
      ${authMode !== "None" ? `{
        path: "login",
        element: <Login />,
      },` : ""}
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}
`;
};

export const getAppTemplate = (options: AppTemplateOptions) => `import "./index.css";
${getContextImport(options.useContext)}${getReduxImport(options.useRedux)}${getShadcnImport(options.useShadcn)}${getApiClientImport(options.language, options.apiClient)}${getThemeHelpers(options.useContext)}${getReduxHelpers(options.useRedux, options.useShadcn)}${getApiHelpers(options.apiClient)}${getAppBody(options)}
export default App;
`;
