"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appContent = void 0;
exports.appContent = `import React from "react";

function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-6">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-10 text-center">
        <h1 className="text-4xl font-extrabold mb-4">
          🚀 Welcome to <span className="text-yellow-300">Create-Quick-React</span>
        </h1>
        <p className="text-lg mb-6 text-gray-200">
          Your React project is ready. Edit <code>App.tsx</code> (or <code>App.jsx</code>) and start building something amazing!
        </p>
        <a
          href="https://react.dev"
          target="_blank"
          rel="noreferrer"
          className="inline-block px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg shadow-md hover:bg-yellow-300 transition-all"
        >
          Learn React
        </a>
      </div>

      <footer className="mt-10 text-sm text-gray-200">
        Made with ❤️ <span className="font-semibold">Love</span>
      </footer>
    </div>
  );
}

export default App;
`;
