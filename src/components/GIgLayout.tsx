import React from 'react';

interface GigLayoutProps {
  children: React.ReactNode;
  headerTitle?: string;
  onNewSong?: () => void;
  onPrint?: () => void;
}

const GigLayout: React.FC<GigLayoutProps> = ({ children, onPrint }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-200 font-lato">
    {/* HEADER FIXO */}
    <header className="bg-slate-800/90 backdrop-blur-2xl sticky top-0 z-50 border-b border-slate-700 shadow-2xl">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="text-3xl font-serif text-amber-400 font-bold tracking-tight">
          Gig Flow Real Book PRO
        </div>
        <div className="flex items-center gap-4">
          <button 
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black px-8 py-3 rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl transition-all"
            onClick={onPrint}
          >
            📄 PDF R$9
          </button>
        </div>
      </div>
    </header>

    <div className="max-w-7xl mx-auto px-6 py-8 flex h-[calc(100vh-140px)] gap-6">
      {children}
    </div>
  </div>
);

export default GigLayout;
