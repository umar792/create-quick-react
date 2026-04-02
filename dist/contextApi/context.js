"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTheme = exports.ThemeProvider = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const ThemeContext = (0, react_1.createContext)(undefined);
const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = (0, react_1.useState)("light");
    const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));
    return ((0, jsx_runtime_1.jsx)(ThemeContext.Provider, { value: { theme, toggleTheme }, children: children }));
};
exports.ThemeProvider = ThemeProvider;
const useTheme = () => {
    const context = (0, react_1.useContext)(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within ThemeProvider");
    }
    return context;
};
exports.useTheme = useTheme;
