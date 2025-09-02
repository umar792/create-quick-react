# 🚀 Create Quick React

A **blazing fast CLI** to scaffold a React app with **prebuilt features** like routing, Redux, theme (dark/light mode), hooks, and a beautiful starter template.  
Stop wasting time setting up boilerplate — start coding right away!

---

## ✨ Features

- 📦 Zero-config React starter with Vite  
- 🎨 TailwindCSS pre-configured  
- 🔒 Private Route support (auth-ready)  
- 🌗 Dark / Light mode toggle with `ThemeContext`  
- 🗂 Prebuilt folder structure (hooks, contextApi, redux, routes)  
- ⚡ Fast, simple & customizable  

---

## 📥 Installation

You can run it directly with **NPX** (recommended):

```sh
npx create-quick-react my-app
```

Or install globally:

```sh
npm install -g create-quick-react
create-quick-react my-app
```

---

## 📂 Folder Structure

After creating your project, you’ll get:

```
my-app/
├── src/
│   ├── hooks/           # Custom hooks (useAuth, PrivateRoute, etc.)
│   ├── contextApi/      # ThemeContext (dark/light)
│   ├── redux/           # Redux store + persistor
│   ├── App.tsx          # Prebuilt app with Navbar, Routes
│   ├── main.tsx         # React root with Redux + ThemeProvider
│   └── index.css        # Tailwind styles
```

---

## 🔑 Usage

Once your project is created:

```sh
cd my-app
npm install
npm run dev
```

Open **http://localhost:5173** in your browser 🚀

---

## 🌗 Theme Toggle

A dark/light mode switch is already included in the Navbar.

```tsx
const { theme, toggleTheme } = useTheme();
<button onClick={toggleTheme}>
  {theme === "dark" ? "🌞 Light" : "🌙 Dark"}
</button>
```

---

## 🔒 Private Routes

The CLI includes a simple auth hook & `PrivateRoute` wrapper:

```tsx
<Route
  path="/dashboard"
  element={
    <PrivateRoute>
      <Dashboard />
    </PrivateRoute>
  }
/>
```

---

## 🛠 Technologies

- [React](https://react.dev/)  
- [Vite](https://vitejs.dev/)  
- [React Router](https://reactrouter.com/)  
- [Redux Toolkit + Persist](https://redux-toolkit.js.org/)  
- [TailwindCSS](https://tailwindcss.com/)  

---

## 📜 License

MIT © 2025 — Built with ❤️ by **Umar792**