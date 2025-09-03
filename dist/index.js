#!/usr/bin/env node
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
const run = (cmd, cwd = process.cwd()) => {
    console.log(`\n👉 Running: ${chalk_1.default.yellow(cmd)} in ${chalk_1.default.blue(cwd)}\n`);
    (0, child_process_1.execSync)(cmd, { stdio: "inherit", cwd });
};
async function main() {
    execa_1.execa;
    console.log(chalk_1.default.cyan("🚀 Welcome to Create-Quick-React CLI"));
    const answers = await inquirer_1.default.prompt([
        {
            type: "input",
            name: "projectName",
            message: "Enter your project name:",
            default: "my-app",
            validate: (input) => {
                if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
                    return "❌ Project name must only contain letters, numbers, hyphens, or underscores.";
                }
                return true;
            },
        },
        {
            type: "list",
            name: "language",
            message: "Choose your language:",
            choices: ["JavaScript", "TypeScript"],
        },
        // {
        //   type: "list",
        //   name: "css",
        //   message: "Choose your CSS framework:",
        //   choices: ["None", "Tailwind", "Bootstrap (CDN)"],
        // },
        {
            type: "checkbox",
            name: "state",
            message: "State management:",
            choices: ["Redux", "Context API"],
        },
        {
            type: "checkbox",
            name: "packages",
            message: "Select optional packages:",
            choices: [
                { name: "Axios", value: "axios" },
                { name: "React Icons", value: "react-icons" },
                { name: "React Hook Form", value: "react-hook-form" },
                { name: "Yup", value: "yup" },
                { name: "Formik", value: "formik" },
                { name: "Moment.js", value: "moment" },
            ],
        },
        {
            type: "confirm",
            name: "routing",
            message: "Do you want React Router?",
            default: true,
        },
    ]);
    console.log(chalk_1.default.green("\n✨ Creating project...\n"));
    const template = answers.language === "TypeScript" ? "react-ts" : "react";
    const projectName = answers.projectName.trim() || "my-app";
    const projectPath = path_1.default.join(process.cwd(), projectName);
    // Create Vite project
    await (0, execa_1.execa)("npm", ["create", "vite@latest", projectName, "--", "--template", template], {
        stdio: "inherit",
    });
    const deps = [];
    /** --- CSS Setup --- */
    // if (answers.css === "Tailwind") {
    console.log(chalk_1.default.blue("\n⚡ Setting up Tailwind...\n"));
    run("npm install tailwindcss @tailwindcss/vite postcss autoprefixer", projectPath);
    const viteConfigPath = fs_1.default.existsSync(path_1.default.join(projectPath, "vite.config.ts"))
        ? path_1.default.join(projectPath, "vite.config.ts")
        : path_1.default.join(projectPath, "vite.config.js");
    if (fs_1.default.existsSync(viteConfigPath)) {
        let viteConfig = fs_1.default.readFileSync(viteConfigPath, "utf-8");
        if (!viteConfig.includes("@tailwindcss/vite")) {
            viteConfig =
                `import tailwindcss from '@tailwindcss/vite';\n` + viteConfig;
            viteConfig = viteConfig.replace(/plugins:\s*\[/, "plugins: [\n    tailwindcss(),");
            fs_1.default.writeFileSync(viteConfigPath, viteConfig);
        }
    }
    // Add index.css
    fs_1.default.writeFileSync(path_1.default.join(projectPath, "src", "index.css"), '@import "tailwindcss";\n');
    // Inject CSS import in main.tsx/jsx
    const mainFile = fs_1.default.existsSync(path_1.default.join(projectPath, "src/main.jsx"))
        ? "src/main.jsx"
        : "src/main.tsx";
    const mainPath = path_1.default.join(projectPath, mainFile);
    let mainContent = fs_1.default.readFileSync(mainPath, "utf-8");
    if (!mainContent.includes(`import './index.css'`)) {
        mainContent = `import './index.css';\n` + mainContent;
    }
    fs_1.default.writeFileSync(mainPath, mainContent);
    // }
    // if (answers.css.startsWith("Bootstrap")) {
    //   const indexHtmlPath = path.join(projectPath, "index.html");
    //   if (fs.existsSync(indexHtmlPath)) {
    //     let indexHtml = fs.readFileSync(indexHtmlPath, "utf-8");
    //     if (!indexHtml.includes("bootstrap.min.css")) {
    //       indexHtml = indexHtml.replace(
    //         "</head>",
    //         `  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">\n</head>`
    //       );
    //       fs.writeFileSync(indexHtmlPath, indexHtml);
    //     }
    //   }
    // }
    /** --- State Management --- */
    if (answers.state.includes("Redux"))
        deps.push("redux", "@reduxjs/toolkit", "react-redux");
    /** --- Routing --- */
    if (answers.routing)
        deps.push("react-router-dom");
    /** --- Extra Packages --- */
    if (answers.packages.length > 0)
        deps.push(...answers.packages);
    /** --- Install all dependencies --- */
    if (deps.length > 0) {
        console.log(chalk_1.default.blue("\n📦 Installing dependencies...\n"));
        run(`npm install ${deps.join(" ")}`, projectPath);
    }
    // delete app.css file
    const appCssPath = path_1.default.join(projectPath, "src", "App.css");
    if (fs_1.default.existsSync(appCssPath)) {
        fs_1.default.unlinkSync(appCssPath);
    }
    // inject simple App.tsx or App.jsx
    const appFile = fs_1.default.existsSync(path_1.default.join(projectPath, "src/App.jsx"))
        ? "src/App.jsx"
        : "src/App.tsx";
    const appPath = path_1.default.join(projectPath, appFile);
    fs_1.default.writeFileSync(appPath, app_js_1.appContent);

    const hasSrc = fs_1.default.existsSync(path_1.default.join(projectPath, "src"));
    const appRootPath = hasSrc
        ? path_1.default.join(projectPath, "src", "redux")
        : path_1.default.join(projectPath, "redux");
    if (answers.state.includes("Redux")) {
        if (answers.language == "JavaScript") {
            const templateDir = path_1.default.join(__dirname, "ReduxJs");
            copyFolderRecursiveSync(templateDir, appRootPath);
            console.log(`✅ Redux files copied to ${appRootPath}`);
        }
        else {
            const templateDir = path_1.default.join(__dirname, "reduxTs");
            copyFolderRecursiveSync(templateDir, appRootPath);
            console.log(`✅ Redux files copied to ${appRootPath}`);
        }
    }
    if (answers.state.includes("Context API")) {
        const appRootPath = hasSrc
            ? path_1.default.join(projectPath, "src", "contextApi")
            : path_1.default.join(projectPath, "contextApi");
        fs_1.default.mkdirSync(appRootPath, { recursive: true });
        if (answers.language == "JavaScript") {
            const srcFile = path_1.default.join(__dirname, "contextApi", "contextAPI.jsx");
            const destFile = path_1.default.join(appRootPath, "contextAPI.jsx");
            fs_1.default.copyFileSync(srcFile, destFile);
            console.log(`✅ ContextAPI file copied to ${destFile}`);
        }
        else {
            const srcFile = path_1.default.join(__dirname, "contextApi", "context.tsx");
            const destFile = path_1.default.join(appRootPath, "context.tsx");
            fs_1.default.copyFileSync(srcFile, destFile);
            console.log(`✅ ContextAPI file copied to ${destFile}`);
        }
        // --- Create hooks folder and add private route hooks ---
        const hooksDir = path_1.default.join(projectPath, "src", "hooks");
        fs_1.default.mkdirSync(hooksDir, { recursive: true });
        if (answers.language === "JavaScript") {
            const useAuthPath = path_1.default.join(hooksDir, "useAuth.js");
            const usePrivateRoutePath = path_1.default.join(hooksDir, "usePrivateRoute.jsx");
            fs_1.default.writeFileSync(useAuthPath, getUseAuthHook("js"));
            fs_1.default.writeFileSync(usePrivateRoutePath, getPrivateRouteHook("js"));
        }
        else {
            const useAuthPath = path_1.default.join(hooksDir, "useAuth.ts");
            const usePrivateRoutePath = path_1.default.join(hooksDir, "usePrivateRoute.tsx");
            fs_1.default.writeFileSync(useAuthPath, getUseAuthHook("ts"));
            fs_1.default.writeFileSync(usePrivateRoutePath, getPrivateRouteHook("ts"));
        }
        console.log(`✅ Hooks created in ${hooksDir}`);
    }
    console.log(chalk_1.default.green(`\n🎉 Project ${chalk_1.default.yellow(projectName)} is ready!`));
    console.log(chalk_1.default.cyan(`👉 Next steps:`));
    console.log(chalk_1.default.white(`   cd ${projectName}`));
    console.log(chalk_1.default.white(`   npm run dev`));
}
main();
function copyFolderRecursiveSync(src, dest) {
    if (!fs_1.default.existsSync(dest)) {
        fs_1.default.mkdirSync(dest, { recursive: true });
    }
    fs_1.default.readdirSync(src).forEach((file) => {
        const srcPath = path_1.default.join(src, file);
        const destPath = path_1.default.join(dest, file);
        if (fs_1.default.lstatSync(srcPath).isDirectory()) {
            copyFolderRecursiveSync(srcPath, destPath);
        }
        else {
            fs_1.default.copyFileSync(srcPath, destPath);
        }
    });
}
function getUseAuthHook(lang) {
    if (lang === "js") {
        return `
import { useState, useEffect } from "react";

// Fake auth hook, replace with real auth logic
export default function useAuth() {
const [isAuthenticated, setIsAuthenticated] = useState(false);

useEffect(() => {
  // Example: check token in localStorage
  const token = localStorage.getItem("token");
  setIsAuthenticated(!!token);
}, []);

return { isAuthenticated };
}
`;
    }
    else {
        return `
import { useState, useEffect } from "react";

export default function useAuth() {
const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

useEffect(() => {
  // Example: check token in localStorage
  const token = localStorage.getItem("token");
  setIsAuthenticated(!!token);
}, []);

return { isAuthenticated };
}
`;
    }
}
function getPrivateRouteHook(lang) {
    if (lang === "js") {
        return `
import { Navigate } from "react-router-dom";
import useAuth from "./useAuth";

// Usage: <PrivateRoute><Dashboard /></PrivateRoute>
export default function PrivateRoute({ children }) {
const { isAuthenticated } = useAuth();

if (!isAuthenticated) {
  return <Navigate to="/login" replace />;
}

return children;
}
`;
    }
    else {
        return `
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import useAuth from "./useAuth";

interface PrivateRouteProps {
children: ReactNode;
}

// Usage: <PrivateRoute><Dashboard /></PrivateRoute>
export default function PrivateRoute({ children }: PrivateRouteProps) {
const { isAuthenticated } = useAuth();

if (!isAuthenticated) {
  return <Navigate to="/login" replace />;
}

return children;
}
`;
    }
}
