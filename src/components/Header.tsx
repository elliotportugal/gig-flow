// src/components/Header.tsx
import React from "react";

export default function Header() {
  return (
    <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold text-amber-300">
          Gig Flow PRO
        </h1>
      </div>
    </header>
  );
}