// src/components/DashboardLayout.tsx
import React from "react";
import Header from "@/components/Header.tsx";
import Sidebar from "@/components/Sidebar.tsx";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  );
}