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
const run = (cmd, cwd = process.cwd()) => {
    console.log(`\n👉 Running: ${chalk_1.default.yellow(cmd)} in ${chalk_1.default.blue(cwd)}\n`);
    (0, child_process_1.execSync)(cmd, { stdio: "inherit", cwd });
};
async function main() {
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
        {
            type: "list",
            name: "css",
            message: "Choose your CSS framework:",
            choices: ["None", "Tailwind", "Bootstrap (CDN)"],
        },
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
    if (answers.css === "Tailwind") {
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
    }
    if (answers.css.startsWith("Bootstrap")) {
        const indexHtmlPath = path_1.default.join(projectPath, "index.html");
        if (fs_1.default.existsSync(indexHtmlPath)) {
            let indexHtml = fs_1.default.readFileSync(indexHtmlPath, "utf-8");
            if (!indexHtml.includes("bootstrap.min.css")) {
                indexHtml = indexHtml.replace("</head>", `  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">\n</head>`);
                fs_1.default.writeFileSync(indexHtmlPath, indexHtml);
            }
        }
    }
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
    console.log(chalk_1.default.green(`\n🎉 Project ${chalk_1.default.yellow(projectName)} is ready!`));
    console.log(chalk_1.default.cyan(`👉 Next steps:`));
    console.log(chalk_1.default.white(`   cd ${projectName}`));
    console.log(chalk_1.default.white(`   npm run dev`));
}
main();
