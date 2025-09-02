#!/usr/bin/env node
import path from "path";
import fs from "fs";
import chalk from "chalk";
import { execa } from "execa";
import inquirer from "inquirer";
import { execSync } from "child_process";
import { appContent } from "./template/app.js";
import { mainJS } from "./template/main.js";

const run = (cmd: string, cwd = process.cwd()) => {
  console.log(`\n👉 Running: ${chalk.yellow(cmd)} in ${chalk.blue(cwd)}\n`);
  execSync(cmd, { stdio: "inherit", cwd });
};

async function main() {
  execa;
  console.log(chalk.cyan("🚀 Welcome to Create-Quick-React CLI"));

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "projectName",
      message: "Enter your project name:",
      default: "my-app",
      validate: (input: string) => {
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

  console.log(chalk.green("\n✨ Creating project...\n"));

  const template = answers.language === "TypeScript" ? "react-ts" : "react";
  const projectName = answers.projectName.trim() || "my-app";
  const projectPath = path.join(process.cwd(), projectName);

  // Create Vite project
  await execa(
    "npm",
    ["create", "vite@latest", projectName, "--", "--template", template],
    {
      stdio: "inherit",
    }
  );

  const deps: string[] = [];

  /** --- CSS Setup --- */
  // if (answers.css === "Tailwind") {
  console.log(chalk.blue("\n⚡ Setting up Tailwind...\n"));
  run(
    "npm install tailwindcss @tailwindcss/vite postcss autoprefixer",
    projectPath
  );

  const viteConfigPath = fs.existsSync(path.join(projectPath, "vite.config.ts"))
    ? path.join(projectPath, "vite.config.ts")
    : path.join(projectPath, "vite.config.js");
  if (fs.existsSync(viteConfigPath)) {
    let viteConfig = fs.readFileSync(viteConfigPath, "utf-8");
    if (!viteConfig.includes("@tailwindcss/vite")) {
      viteConfig =
        `import tailwindcss from '@tailwindcss/vite';\n` + viteConfig;
      viteConfig = viteConfig.replace(
        /plugins:\s*\[/,
        "plugins: [\n    tailwindcss(),"
      );
      fs.writeFileSync(viteConfigPath, viteConfig);
    }
  }

  // Add index.css
  fs.writeFileSync(
    path.join(projectPath, "src", "index.css"),
    '@import "tailwindcss";\n'
  );

  // Inject CSS import in main.tsx/jsx
  const mainFile = fs.existsSync(path.join(projectPath, "src/main.jsx"))
    ? "src/main.jsx"
    : "src/main.tsx";
  const mainPath = path.join(projectPath, mainFile);
  let mainContent = fs.readFileSync(mainPath, "utf-8");
  if (!mainContent.includes(`import './index.css'`)) {
    mainContent = `import './index.css';\n` + mainContent;
  }
  fs.writeFileSync(mainPath, mainContent);
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
  if (answers.routing) deps.push("react-router-dom");

  /** --- Extra Packages --- */
  if (answers.packages.length > 0) deps.push(...answers.packages);

  /** --- Install all dependencies --- */
  if (deps.length > 0) {
    console.log(chalk.blue("\n📦 Installing dependencies...\n"));
    run(`npm install ${deps.join(" ")}`, projectPath);
  }

  // delete app.css file
  const appCssPath = path.join(projectPath, "src", "App.css");
  if (fs.existsSync(appCssPath)) {
    fs.unlinkSync(appCssPath);
  }

  // inject simple App.tsx or App.jsx
  const appFile = fs.existsSync(path.join(projectPath, "src/App.jsx"))
    ? "src/App.jsx"
    : "src/App.tsx";
  const appPath = path.join(projectPath, appFile);
  fs.writeFileSync(appPath, appContent);

  // inject simple main.tsx or main.jsx
  const mainFilePath = fs.existsSync(path.join(projectPath , "src/main.jsx")) ? "src/main.jsx" : "main.tsx";
  const mainPathRoute = path.join(projectPath , mainFilePath)
  fs.writeFileSync(mainPathRoute , mainJS)



  const hasSrc = fs.existsSync(path.join(projectPath, "src"));
  const appRootPath = hasSrc
    ? path.join(projectPath, "src", "redux")
    : path.join(projectPath, "redux");
  
  if (answers.state.includes("Redux")) {
    if (answers.language == "JavaScript") {
      const templateDir = path.join(process.cwd(), "src" ,"ReduxJs");

      copyFolderRecursiveSync(templateDir, appRootPath);
      console.log(`✅ Redux files copied to ${appRootPath}`);
    } else {
      const templateDir = path.join(process.cwd(), "src" , "reduxTs");

      copyFolderRecursiveSync(templateDir, appRootPath);
      console.log(`✅ Redux files copied to ${appRootPath}`);
    }
  }

  if (answers.state.includes("Context API")) {
    const appRootPath = hasSrc
        ? path.join(projectPath, "src", "contextApi")
        : path.join(projectPath, "contextApi");

    fs.mkdirSync(appRootPath, { recursive: true });

    if (answers.language == "JavaScript") {
        const srcFile = path.join(process.cwd(), "src" ,"contextApi", "contextAPI.jsx");
        const destFile = path.join(appRootPath, "contextAPI.jsx");
        fs.copyFileSync(srcFile, destFile);
        console.log(`✅ ContextAPI file copied to ${destFile}`);
    } else {
        const srcFile = path.join(process.cwd(), "src", "contextApi", "context.tsx");
        const destFile = path.join(appRootPath, "context.tsx");
        fs.copyFileSync(srcFile, destFile);
        console.log(`✅ ContextAPI file copied to ${destFile}`);
    }




    // --- Create hooks folder and add private route hooks ---
const hooksDir = path.join(projectPath, "src", "hooks");
fs.mkdirSync(hooksDir, { recursive: true });

if (answers.language === "JavaScript") {
    const useAuthPath = path.join(hooksDir, "useAuth.js");
    const usePrivateRoutePath = path.join(hooksDir, "usePrivateRoute.jsx");

    fs.writeFileSync(useAuthPath, getUseAuthHook("js"));
    fs.writeFileSync(usePrivateRoutePath, getPrivateRouteHook("js"));
} else {
    const useAuthPath = path.join(hooksDir, "useAuth.ts");
    const usePrivateRoutePath = path.join(hooksDir, "usePrivateRoute.tsx");

    fs.writeFileSync(useAuthPath, getUseAuthHook("ts"));
    fs.writeFileSync(usePrivateRoutePath, getPrivateRouteHook("ts"));
}

console.log(`✅ Hooks created in ${hooksDir}`);




}


  console.log(
    chalk.green(`\n🎉 Project ${chalk.yellow(projectName)} is ready!`)
  );
  console.log(chalk.cyan(`👉 Next steps:`));
  console.log(chalk.white(`   cd ${projectName}`));
  console.log(chalk.white(`   npm run dev`));
}

main();

function copyFolderRecursiveSync(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  fs.readdirSync(src).forEach((file) => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);

    if (fs.lstatSync(srcPath).isDirectory()) {
      copyFolderRecursiveSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
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
  } else {
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
  } else {
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
