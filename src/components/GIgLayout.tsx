import React, { ReactNode } from 'react';

interface GigLayoutProps {
  children: ReactNode;
  onPrint?: () => void;
}

const GigLayout: React.FC<GigLayoutProps> = ({ children, onPrint = () => window.print() }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-200 p-6">
    <header className="bg-slate-800/90 backdrop-blur-xl mb-8 p-8 rounded-3xl border border-slate-700 shadow-2xl">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
          Gig Flow Real Book PRO
        </h1>
        <button 
          className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black px-8 py-3 rounded-2xl font-black text-lg shadow-xl"
          onClick={onPrint}
        >
          📄 PDF R$9
        </button>
      </div>
    </header>
    <div className="max-w-7xl mx-auto grid lg:grid-cols-[300px_1fr_1.3fr] gap-8">
      {children}
    </div>
  </div>
);

export default GigLayout;
