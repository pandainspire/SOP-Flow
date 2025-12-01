import React from 'react';
import { Button } from './ui/Button';
import { ArrowRight, ClipboardCheck, Layers, LayoutTemplate } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      <nav className="p-6 flex justify-between items-center">
        <div className="flex items-center gap-2 text-blue-800 font-bold text-xl">
          <Layers size={28} />
          <span>SOP Flow</span>
        </div>
        <Button variant="ghost" onClick={onStart}>Sign In</Button>
      </nav>

      <main className="flex-grow flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto mb-20">
        <div className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-xs font-semibold mb-6 uppercase tracking-wider">
          v1.0 Public Beta
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 tracking-tight leading-tight">
          Standardize Your <br/>
          <span className="text-blue-600">Operations</span>
        </h1>
        <p className="text-lg text-slate-600 mb-10 max-w-2xl leading-relaxed">
          Create professional, visual Standard Operating Procedures in minutes. 
          Upload images, add steps, and export print-ready PDFs for your team.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Button size="lg" onClick={onStart} className="gap-2 shadow-lg shadow-blue-500/20">
            Create New SOP <ArrowRight size={18} />
          </Button>
          <Button size="lg" variant="outline" onClick={() => alert("This would open a demo or documentation.")}>
            View Examples
          </Button>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <FeatureCard 
            icon={<LayoutTemplate className="text-blue-500" />}
            title="Auto-Pagination"
            desc="Automatically formats your content into 6-panel A4 pages following industry standards."
          />
          <FeatureCard 
            icon={<ClipboardCheck className="text-blue-500" />}
            title="Standardized Layout"
            desc="Keep compliance with consistent headers, footers, and version control fields."
          />
           <FeatureCard 
            icon={<Layers className="text-blue-500" />}
            title="Print Ready"
            desc="Export high-resolution PDFs directly from your browser with no watermarks."
          />
        </div>
      </main>
      
      <footer className="text-center py-8 text-slate-400 text-sm">
        &copy; {new Date().getFullYear()} SOP Flow. All rights reserved.
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
    <div className="mb-4 p-2 bg-blue-50 w-fit rounded-lg">{icon}</div>
    <h3 className="font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
  </div>
);
