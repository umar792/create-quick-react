"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appContent = void 0;
exports.appContent = `import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import PrivateRoute from "./hooks/usePrivateRoute";

// --- Pages ---
function Home() {
  return (
    <div className="p-6 text-center">
      <h2 className="text-2xl font-bold mb-2">🏠 Home</h2>
      <p className="text-gray-200">Welcome to your new React app!</p>
    </div>
  );
}

function About() {
  return (
    <div className="p-6 text-center">
      <h2 className="text-2xl font-bold mb-2">ℹ️ About</h2>
      <p className="text-gray-200">This project was created with Create-Quick-React CLI 🚀</p>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="p-6 text-center">
      <h2 className="text-2xl font-bold mb-2">📊 Dashboard</h2>
      <p className="text-gray-200">You are logged in and can see this private page.</p>
    </div>
  );
}

function Login() {
  const handleLogin = () => {
    localStorage.setItem("token", "123"); // fake login
    window.location.href = "/dashboard";
  };

  return (
    <div className="p-6 text-center">
      <h2 className="text-2xl font-bold mb-4">🔐 Login</h2>
      <button
        onClick={handleLogin}
        className="px-6 py-2 bg-yellow-400 text-black rounded-lg font-semibold hover:bg-yellow-300 transition"
      >
        Login
      </button>
    </div>
  );
}

// --- Navbar ---
function Navbar() {
  return (
    <nav className="w-full bg-black/80 backdrop-blur-md shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-yellow-400">
          ⚡ QuickReact
        </Link>
        <div className="space-x-6">
          <Link to="/" className="text-gray-200 hover:text-yellow-400 transition">Home</Link>
          <Link to="/about" className="text-gray-200 hover:text-yellow-400 transition">About</Link>
          <Link to="/dashboard" className="text-gray-200 hover:text-yellow-400 transition">Dashboard</Link>
          <Link to="/login" className="text-gray-200 hover:text-yellow-400 transition">Login</Link>
        </div>
      </div>
    </nav>
  );
}

// --- App ---
function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-black text-white">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
        <footer className="py-4 text-center text-gray-400">
          Made with ❤️ using <span className="font-semibold text-yellow-400">Create-Quick-React</span>
        </footer>
      </div>
    </Router>
  );
}

export default App;
`;
