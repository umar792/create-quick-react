#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const chalk_1 = __importDefault(require("chalk"));
const execa_1 = require("execa");
const inquirer_1 = __importDefault(require("inquirer"));
const child_process_1 = require("child_process");
const app_js_1 = require("./template/app.js");
const main_js_1 = require("./template/main.js");
const DEFAULTS = {
    language: "TypeScript",
    stateMode: "Both",
    styling: "Tailwind + shadcn/ui",
    routerMode: "React Router",
    authMode: "Demo Protected Route",
    apiClient: "Axios Client",
    testing: "Vitest + React Testing Library",
    linting: "ESLint + Prettier",
    envMode: "Basic",
    structure: "Feature-based",
    starter: ["Dashboard"],
    networking: [],
    uiPackages: ["react-icons"],
    formPackages: [],
    utilityPackages: [],
    shadcnComponents: ["button", "card", "input"],
};
const LANGUAGE_CHOICES = [
    { name: "JavaScript - lighter setup with no TypeScript types", value: "JavaScript" },
    { name: "TypeScript - typed setup for better editor support and safer refactors", value: "TypeScript" },
];
const STATE_MODE_CHOICES = [
    { name: "None - no global state layer, keep the project minimal", value: "None" },
    { name: "Redux - Redux Toolkit slices for structured shared app state", value: "Redux" },
    { name: "Context API - simple app-wide state like theme and preferences", value: "Context API" },
    { name: "Both - Context API for UI state and Redux for structured data", value: "Both" },
];
const STYLING_CHOICES = [
    { name: "Tailwind - utility-first styling only", value: "Tailwind" },
    { name: "Tailwind + shadcn/ui - Tailwind plus copyable UI components", value: "Tailwind + shadcn/ui" },
];
const ROUTER_CHOICES = [
    { name: "None - single-page starter without route setup", value: "None" },
    { name: "React Router - modern data-router starter with route objects", value: "React Router" },
];
const AUTH_CHOICES = [
    { name: "None - no auth or protected route starter", value: "None" },
    { name: "Demo Protected Route - simple localStorage-based route protection", value: "Demo Protected Route" },
    { name: "JWT Starter - starter auth flow shaped for token-based backends", value: "JWT Starter" },
];
const API_CLIENT_CHOICES = [
    { name: "None - do not generate an API utility", value: "None" },
    { name: "Fetch Client - lightweight browser-native request helper", value: "Fetch Client" },
    { name: "Axios Client - axios instance with base URL starter", value: "Axios Client" },
];
const TESTING_CHOICES = [
    { name: "None - skip testing setup", value: "None" },
    { name: "Vitest - fast unit test runner", value: "Vitest" },
    { name: "Vitest + React Testing Library - component testing starter", value: "Vitest + React Testing Library" },
    { name: "Playwright - browser end-to-end testing starter", value: "Playwright" },
];
const LINTING_CHOICES = [
    { name: "None - no formatter or lint helper", value: "None" },
    { name: "Prettier - formatting only", value: "Prettier" },
    { name: "ESLint + Prettier - formatting plus lint compatibility starter", value: "ESLint + Prettier" },
];
const ENV_CHOICES = [
    { name: "None - no env files", value: "None" },
    { name: "Basic - .env, .env.example, and env helper file", value: "Basic" },
];
const STRUCTURE_CHOICES = [
    { name: "Simple - small app structure with only the basics", value: "Simple" },
    { name: "Feature-based - good balance for growing apps", value: "Feature-based" },
    { name: "Scalable - more folders for larger app organization", value: "Scalable" },
];
const STARTER_PAGE_CHOICES = [
    { name: "Dashboard - starter internal app page", value: "Dashboard" },
    { name: "Landing Page - simple marketing or hero page starter", value: "Landing Page" },
    { name: "Settings Page - preferences or account settings starter", value: "Settings Page" },
];
const run = (cmd, cwd = process.cwd()) => {
    console.log(`\n👉 Running: ${chalk_1.default.yellow(cmd)} in ${chalk_1.default.blue(cwd)}\n`);
    (0, child_process_1.execSync)(cmd, { stdio: "inherit", cwd });
};
const parseArgs = () => {
    const args = process.argv.slice(2);
    const options = { yes: false };
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
                if (next === "none")
                    options.stateMode = "None";
                if (next === "redux")
                    options.stateMode = "Redux";
                if (next === "context")
                    options.stateMode = "Context API";
                if (next === "both")
                    options.stateMode = "Both";
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
                if (next === "none")
                    options.authMode = "None";
                if (next === "demo")
                    options.authMode = "Demo Protected Route";
                if (next === "jwt")
                    options.authMode = "JWT Starter";
                index += 1;
                break;
            case "--api":
                if (next === "none")
                    options.apiClient = "None";
                if (next === "fetch")
                    options.apiClient = "Fetch Client";
                if (next === "axios")
                    options.apiClient = "Axios Client";
                index += 1;
                break;
            default:
                break;
        }
    }
    return options;
};
const getStateChoices = (stateMode) => {
    if (stateMode === "Both") {
        return ["Redux", "Context API"];
    }
    if (stateMode === "None") {
        return [];
    }
    return [stateMode];
};
const resolveAssetPath = (...segments) => {
    const candidates = [
        path_1.default.resolve(__dirname, "..", "src", ...segments),
        path_1.default.resolve(__dirname, ...segments),
    ];
    for (const candidate of candidates) {
        if (fs_1.default.existsSync(candidate)) {
            return candidate;
        }
    }
    throw new Error(`Unable to locate asset path: ${segments.join("/")}`);
};
const updateViteConfigForTailwind = (projectPath) => {
    const viteConfigPath = fs_1.default.existsSync(path_1.default.join(projectPath, "vite.config.ts"))
        ? path_1.default.join(projectPath, "vite.config.ts")
        : path_1.default.join(projectPath, "vite.config.js");
    if (!fs_1.default.existsSync(viteConfigPath))
        return;
    let viteConfig = fs_1.default.readFileSync(viteConfigPath, "utf-8");
    if (!viteConfig.includes("@tailwindcss/vite")) {
        viteConfig = `import tailwindcss from "@tailwindcss/vite";\n${viteConfig}`;
    }
    if (!viteConfig.includes("tailwindcss()")) {
        viteConfig = viteConfig.replace(/plugins:\s*\[/, "plugins: [\n    tailwindcss(),");
    }
    fs_1.default.writeFileSync(viteConfigPath, viteConfig);
};
const updateViteConfigAlias = (projectPath) => {
    const viteConfigPath = fs_1.default.existsSync(path_1.default.join(projectPath, "vite.config.ts"))
        ? path_1.default.join(projectPath, "vite.config.ts")
        : path_1.default.join(projectPath, "vite.config.js");
    if (!fs_1.default.existsSync(viteConfigPath))
        return;
    let viteConfig = fs_1.default.readFileSync(viteConfigPath, "utf-8");
    if (!viteConfig.includes('import path from "path";')) {
        viteConfig = `import path from "path";\n${viteConfig}`;
    }
    if (!viteConfig.includes("resolve:")) {
        viteConfig = viteConfig.replace(/export default defineConfig\(\{/, `export default defineConfig({\n  resolve: {\n    alias: {\n      "@": path.resolve(__dirname, "./src"),\n    },\n  },`);
    }
    fs_1.default.writeFileSync(viteConfigPath, viteConfig);
};
const updateJsonFile = (filePath, updater) => {
    if (!fs_1.default.existsSync(filePath))
        return;
    const current = JSON.parse(fs_1.default.readFileSync(filePath, "utf-8"));
    fs_1.default.writeFileSync(filePath, `${JSON.stringify(updater(current), null, 2)}\n`);
};
const updateAliasConfig = (projectPath, language) => {
    if (language === "TypeScript") {
        for (const file of ["tsconfig.json", "tsconfig.app.json"]) {
            updateJsonFile(path_1.default.join(projectPath, file), (json) => ({
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
    updateJsonFile(path_1.default.join(projectPath, "jsconfig.json"), (json) => ({
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
const setupShadcn = (projectPath, language, components) => {
    console.log(chalk_1.default.blue("\n🎨 Setting up shadcn/ui...\n"));
    updateAliasConfig(projectPath, language);
    updateViteConfigAlias(projectPath);
    run("npx shadcn@latest init -d", projectPath);
    if (components.length > 0) {
        run(`npx shadcn@latest add ${components.join(" ")} -y`, projectPath);
    }
};
const ensureDir = (dirPath) => {
    fs_1.default.mkdirSync(dirPath, { recursive: true });
};
const writeText = (filePath, content) => {
    ensureDir(path_1.default.dirname(filePath));
    fs_1.default.writeFileSync(filePath, content);
};
const getEnvFileContent = () => `VITE_API_BASE_URL=http://localhost:5000/api/v1\nVITE_APP_NAME=Create Quick React App\n`;
const getEnvExampleContent = () => `VITE_API_BASE_URL=\nVITE_APP_NAME=\n`;
const getEnvHelper = (language) => language === "TypeScript"
    ? `export const env = {\n  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api/v1",\n  appName: import.meta.env.VITE_APP_NAME ?? "Create Quick React App",\n};\n`
    : `export const env = {\n  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api/v1",\n  appName: import.meta.env.VITE_APP_NAME ?? "Create Quick React App",\n};\n`;
const getApiClientTemplate = (language, apiClient) => {
    if (apiClient === "None")
        return null;
    if (apiClient === "Axios Client") {
        return language === "TypeScript"
            ? `import axios from "axios";\nimport { env } from "../config/env";\n\nexport const apiClient = axios.create({\n  baseURL: env.apiBaseUrl,\n  headers: {\n    "Content-Type": "application/json",\n  },\n});\n`
            : `import axios from "axios";\nimport { env } from "../config/env";\n\nexport const apiClient = axios.create({\n  baseURL: env.apiBaseUrl,\n  headers: {\n    "Content-Type": "application/json",\n  },\n});\n`;
    }
    return language === "TypeScript"
        ? `import { env } from "../config/env";\n\nexport async function apiClient<T>(endpoint: string, init?: RequestInit): Promise<T> {\n  const response = await fetch(\`\${env.apiBaseUrl}\${endpoint}\`, {\n    headers: {\n      "Content-Type": "application/json",\n      ...(init?.headers ?? {}),\n    },\n    ...init,\n  });\n\n  if (!response.ok) {\n    throw new Error(\`Request failed with status \${response.status}\`);\n  }\n\n  return response.json() as Promise<T>;\n}\n`
        : `import { env } from "../config/env";\n\nexport async function apiClient(endpoint, init) {\n  const response = await fetch(\`\${env.apiBaseUrl}\${endpoint}\`, {\n    headers: {\n      "Content-Type": "application/json",\n      ...(init?.headers ?? {}),\n    },\n    ...init,\n  });\n\n  if (!response.ok) {\n    throw new Error(\`Request failed with status \${response.status}\`);\n  }\n\n  return response.json();\n}\n`;
};
const getFeatureReadme = (answers) => {
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
const updatePackageJson = (projectPath, updater) => {
    updateJsonFile(path_1.default.join(projectPath, "package.json"), updater);
};
const setupTesting = (projectPath, answers) => {
    if (answers.testing === "None")
        return;
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
        run("npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom", projectPath);
        updatePackageJson(projectPath, (json) => ({
            ...json,
            scripts: {
                ...(json.scripts ?? {}),
                test: "vitest",
            },
        }));
        writeText(path_1.default.join(projectPath, "src", answers.language === "TypeScript" ? "App.test.tsx" : "App.test.jsx"), answers.language === "TypeScript"
            ? `import { render, screen } from "@testing-library/react";\nimport App from "./App";\n\ntest("renders starter heading", () => {\n  render(<App />);\n  expect(screen.getByText(/starter/i)).toBeTruthy();\n});\n`
            : `import { render, screen } from "@testing-library/react";\nimport App from "./App";\n\ntest("renders starter heading", () => {\n  render(<App />);\n  expect(screen.getByText(/starter/i)).toBeTruthy();\n});\n`);
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
const setupLinting = (projectPath, linting) => {
    if (linting === "None")
        return;
    run("npm install -D prettier", projectPath);
    writeText(path_1.default.join(projectPath, ".prettierrc"), '{\n  "semi": true,\n  "singleQuote": false\n}\n');
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
const applyProjectStructure = (projectPath, structure) => {
    const srcRoot = path_1.default.join(projectPath, "src");
    const commonDirs = ["components", "lib"];
    if (structure === "Simple") {
        commonDirs.forEach((dir) => ensureDir(path_1.default.join(srcRoot, dir)));
        return;
    }
    if (structure === "Feature-based") {
        ["components", "features", "lib", "pages", "services"].forEach((dir) => ensureDir(path_1.default.join(srcRoot, dir)));
        return;
    }
    ["components", "features", "hooks", "layouts", "lib", "services", "types"].forEach((dir) => ensureDir(path_1.default.join(srcRoot, dir)));
};
const setupEnvFiles = (projectPath, language, envMode) => {
    if (envMode === "None")
        return;
    writeText(path_1.default.join(projectPath, ".env"), getEnvFileContent());
    writeText(path_1.default.join(projectPath, ".env.example"), getEnvExampleContent());
    writeText(path_1.default.join(projectPath, "src", "config", language === "TypeScript" ? "env.ts" : "env.js"), getEnvHelper(language));
};
const setupApiClient = (projectPath, answers) => {
    const template = getApiClientTemplate(answers.language, answers.apiClient);
    if (!template)
        return;
    if (answers.apiClient === "Axios Client") {
        run("npm install axios", projectPath);
    }
    writeText(path_1.default.join(projectPath, "src", "lib", answers.language === "TypeScript" ? "api-client.ts" : "api-client.js"), template);
};
const writeBaseFiles = (projectPath, answers) => {
    const useRedux = answers.state.includes("Redux");
    const useContext = answers.state.includes("Context API");
    const useShadcn = answers.styling === "Tailwind + shadcn/ui";
    const appFile = answers.language === "TypeScript" ? "App.tsx" : "App.jsx";
    const mainFile = answers.language === "TypeScript" ? "main.tsx" : "main.jsx";
    writeText(path_1.default.join(projectPath, "src", "index.css"), '@import "tailwindcss";\n');
    writeText(path_1.default.join(projectPath, "src", appFile), (0, app_js_1.getAppTemplate)({
        language: answers.language,
        projectName: answers.projectName,
        useRedux,
        useShadcn,
        useContext,
        useRouter: answers.routing,
        authMode: answers.authMode,
        starter: answers.starter,
        apiClient: answers.apiClient,
    }));
    writeText(path_1.default.join(projectPath, "src", mainFile), (0, main_js_1.getMainTemplate)({
        useContext,
        useRedux,
    }));
    writeText(path_1.default.join(projectPath, "README.md"), getFeatureReadme(answers));
};
const copyFolderRecursiveSync = (src, dest) => {
    ensureDir(dest);
    fs_1.default.readdirSync(src).forEach((file) => {
        const srcPath = path_1.default.join(src, file);
        const destPath = path_1.default.join(dest, file);
        if (fs_1.default.lstatSync(srcPath).isDirectory()) {
            copyFolderRecursiveSync(srcPath, destPath);
            return;
        }
        fs_1.default.copyFileSync(srcPath, destPath);
    });
};
const copyReduxTemplate = (projectPath, answers) => {
    if (!answers.state.includes("Redux"))
        return;
    const templateDir = answers.language === "TypeScript"
        ? resolveAssetPath("reduxTs")
        : resolveAssetPath("ReduxJs");
    copyFolderRecursiveSync(templateDir, path_1.default.join(projectPath, "src", "redux"));
};
const copyContextTemplate = (projectPath, answers) => {
    if (!answers.state.includes("Context API"))
        return;
    const contextDir = path_1.default.join(projectPath, "src", "contextApi");
    ensureDir(contextDir);
    const sourceFile = answers.language === "TypeScript"
        ? resolveAssetPath("contextApi", "context.tsx")
        : resolveAssetPath("contextApi", "context.jsx");
    const destinationFile = answers.language === "TypeScript"
        ? path_1.default.join(contextDir, "context.tsx")
        : path_1.default.join(contextDir, "context.jsx");
    fs_1.default.copyFileSync(sourceFile, destinationFile);
};
const getUseAuthHook = (language, authMode) => {
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
const getPrivateRouteHook = (language) => {
    if (language === "TypeScript") {
        return `import { Navigate, Outlet, useLocation } from "react-router-dom";\nimport useAuth from "./useAuth";\n\nexport default function PrivateRoute() {\n  const { isAuthenticated } = useAuth();\n  const location = useLocation();\n\n  if (!isAuthenticated) {\n    return <Navigate replace to="/login" state={{ from: location }} />;\n  }\n\n  return <Outlet />;\n}\n`;
    }
    return `import { Navigate, Outlet, useLocation } from "react-router-dom";\nimport useAuth from "./useAuth";\n\nexport default function PrivateRoute() {\n  const { isAuthenticated } = useAuth();\n  const location = useLocation();\n\n  if (!isAuthenticated) {\n    return <Navigate replace to="/login" state={{ from: location }} />;\n  }\n\n  return <Outlet />;\n}\n`;
};
const createRoutingHooks = (projectPath, answers) => {
    if (!answers.routing)
        return;
    const hooksDir = path_1.default.join(projectPath, "src", "hooks");
    ensureDir(hooksDir);
    writeText(path_1.default.join(hooksDir, answers.language === "TypeScript" ? "useAuth.ts" : "useAuth.js"), getUseAuthHook(answers.language, answers.authMode));
    if (answers.authMode !== "None") {
        writeText(path_1.default.join(hooksDir, answers.language === "TypeScript"
            ? "usePrivateRoute.tsx"
            : "usePrivateRoute.jsx"), getPrivateRouteHook(answers.language));
    }
};
const getAnswersFromPrompts = async (cliOptions) => {
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
    const promptAnswers = await inquirer_1.default.prompt([
        {
            type: "input",
            name: "projectName",
            message: "Enter your project name:",
            default: cliOptions.projectName ?? "my-app",
            validate: (input) => /^[a-zA-Z0-9-_]+$/.test(input)
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
    ]);
    return {
        projectName: promptAnswers.projectName,
        language: promptAnswers.language,
        state: getStateChoices(promptAnswers.stateMode),
        styling: promptAnswers.styling,
        routing: promptAnswers.routerMode === "React Router",
        authMode: promptAnswers.routerMode === "React Router"
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
const printSuccessSummary = (answers, projectName) => {
    console.log(chalk_1.default.green(`\n🎉 Project ${chalk_1.default.yellow(projectName)} is ready!`));
    console.log(chalk_1.default.cyan("Selected stack:"));
    console.log(chalk_1.default.white(`  Language: ${answers.language}`));
    console.log(chalk_1.default.white(`  State: ${answers.state.length > 0 ? answers.state.join(" + ") : "None"}`));
    console.log(chalk_1.default.white(`  Styling: ${answers.styling}`));
    console.log(chalk_1.default.white(`  Routing: ${answers.routing ? answers.authMode : "None"}`));
    console.log(chalk_1.default.white(`  API client: ${answers.apiClient}`));
    console.log(chalk_1.default.white(`  Testing: ${answers.testing}`));
    console.log(chalk_1.default.white(`  Linting: ${answers.linting}`));
    console.log(chalk_1.default.white(`  Structure: ${answers.structure}`));
    console.log(chalk_1.default.cyan("\nNext steps:"));
    console.log(chalk_1.default.white(`  cd ${projectName}`));
    console.log(chalk_1.default.white("  npm run dev"));
    if (answers.testing !== "None") {
        console.log(chalk_1.default.white(`  ${answers.testing === "Playwright" ? "npm run test:e2e" : "npm run test"}`));
    }
};
async function main() {
    const cliOptions = parseArgs();
    console.log(chalk_1.default.cyan("🚀 Welcome to Create-Quick-React CLI"));
    const promptAnswers = await getAnswersFromPrompts(cliOptions);
    const answers = {
        ...promptAnswers,
        projectName: promptAnswers.projectName.trim() || "my-app",
    };
    console.log(chalk_1.default.green("\n✨ Creating project...\n"));
    const template = answers.language === "TypeScript" ? "react-ts" : "react";
    const projectPath = path_1.default.join(process.cwd(), answers.projectName);
    await (0, execa_1.execa)("npm", ["create", "vite@latest", answers.projectName, "--", "--template", template], { stdio: "inherit" });
    console.log(chalk_1.default.blue("\n⚡ Setting up Tailwind...\n"));
    run("npm install -D tailwindcss @tailwindcss/vite postcss autoprefixer", projectPath);
    updateViteConfigForTailwind(projectPath);
    const deps = new Set(answers.packages);
    if (answers.state.includes("Redux")) {
        ["redux", "@reduxjs/toolkit", "react-redux", "redux-persist"].forEach((dep) => deps.add(dep));
    }
    if (answers.routing) {
        deps.add("react-router-dom");
    }
    if (deps.size > 0) {
        console.log(chalk_1.default.blue("\n📦 Installing dependencies...\n"));
        run(`npm install ${Array.from(deps).join(" ")}`, projectPath);
    }
    const appCssPath = path_1.default.join(projectPath, "src", "App.css");
    if (fs_1.default.existsSync(appCssPath)) {
        fs_1.default.unlinkSync(appCssPath);
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
