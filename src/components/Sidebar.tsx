// src/components/Sidebar.tsx
import React from "react";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-700 p-4">
      <nav className="space-y-2">
        <a href="/" className="block text-gray-300 hover:text-amber-300">
          Dashboard
        </a>
        <a href="/editor" className="block text-gray-300 hover:text-amber-300">
          Editor de Setlist
        </a>
        <a href="/cifras" className="block text-gray-300 hover:text-amber-300">
          Cifras
        </a>
      </nav>
    </aside>
  );
}