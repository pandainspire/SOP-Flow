import React, { useState, useEffect, useRef } from 'react';
import { createDefaultSOP, ITEMS_PER_PAGE } from '../constants';
import { SOPDocument, SOPStep } from '../types';
import { SOPGridPage } from './SOPGridPage';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { ConfirmationModal } from './ui/ConfirmationModal';
import { generatePDF } from '../services/pdfService';
import { generateSOPSteps } from '../services/geminiService';
import { 
  Save, 
  Download, 
  Plus, 
  Trash2, 
  ChevronLeft, 
  Settings, 
  Sparkles,
  Layout,
  Undo,
  Redo,
  FolderOpen,
  CheckCircle,
  Loader2,
  RotateCcw,
  Lock
} from 'lucide-react';

interface SOPEditorProps {
  onBack: () => void;
}

export const SOPEditor: React.FC<SOPEditorProps> = ({ onBack }) => {
  // Initialize with a fresh copy using the factory function
  const [doc, setDoc] = useState<SOPDocument>(createDefaultSOP());
  const [history, setHistory] = useState<SOPDocument[]>([]);
  const [future, setFuture] = useState<SOPDocument[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  
  // Modal State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  
  // Save status for visual feedback - now only for manual saves
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  
  // Hidden file input ref for loading projects
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Ref to hold the state before editing started (onFocus)
  const snapshotRef = useRef<SOPDocument | null>(null);

  // Load from local storage on mount (Auto-recovery)
  useEffect(() => {
    const saved = localStorage.getItem('sop_draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setDoc(parsed);
      } catch (e) {
        console.error("Failed to parse saved draft");
      }
    }
  }, []);

  // Silent Auto-save to local storage whenever doc changes
  useEffect(() => {
    const saveToLocal = () => {
      localStorage.setItem('sop_draft', JSON.stringify(doc));
    };

    // Debounce save slightly to avoid thrashing
    const timeoutId = setTimeout(saveToLocal, 500);
    return () => clearTimeout(timeoutId);
  }, [doc]);

  // Undo / Redo Operations
  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setFuture(prev => [doc, ...prev]);
    setDoc(previous);
    setHistory(prev => prev.slice(0, -1));
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setHistory(prev => [...prev, doc]);
    setDoc(next);
    setFuture(prev => prev.slice(1));
  };

  // Records a history state. Call this BEFORE making a state change for atomic actions (buttons).
  const pushToHistory = () => {
    setHistory(prev => [...prev, JSON.parse(JSON.stringify(doc))]);
    setFuture([]);
  };

  // Input Focus/Blur Handling for Text Fields
  const handleInputFocus = () => {
    snapshotRef.current = JSON.parse(JSON.stringify(doc));
  };

  const handleInputBlur = () => {
    if (!snapshotRef.current) return;
    
    // Compare current doc with snapshot
    if (JSON.stringify(doc) !== JSON.stringify(snapshotRef.current)) {
       setHistory(prev => [...prev, snapshotRef.current!]);
       setFuture([]);
    }
    snapshotRef.current = null;
  };

  // "Save" to File (Backend simulation)
  const handleSaveProject = () => {
    setSaveStatus('saving');
    
    // Simulate a small network delay for better UX feel before download
    setTimeout(() => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(doc));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        const fileName = doc.meta.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || "sop_project";
        downloadAnchorNode.setAttribute("download", `${fileName}.json`);
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
    }, 600);
  };

  // "Load" from File
  const handleLoadProject = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedDoc = JSON.parse(content);
        
        // Basic validation
        if (parsedDoc.meta && Array.isArray(parsedDoc.steps)) {
          // Clear history when loading a new project to start fresh
          setHistory([]);
          setFuture([]);
          setDoc(parsedDoc);
          alert("Project loaded successfully!");
        } else {
          alert("Invalid project file.");
        }
      } catch (err) {
        console.error(err);
        alert("Failed to parse project file.");
      }
    };
    reader.readAsText(file);
    // Reset input value so same file can be selected again
    event.target.value = '';
  };

  const executeReset = () => {
      console.log("Resetting document...");
      
      // Hard reset: clear history/future so you can't undo into a dirty state
      setHistory([]);
      setFuture([]);
      
      // Use factory function to get a fresh instance with a new ID
      const newDoc = createDefaultSOP();
      setDoc(newDoc); 
      
      // Force clear local storage immediately
      localStorage.removeItem('sop_draft');
  };

  const handleDownloadPDF = () => {
    generatePDF('sop-container', doc.meta.title.replace(/[^a-z0-9]/gi, '_').toLowerCase());
  };

  const handleGenerateAI = async () => {
    // Disabled functionality as per request (Coming Soon)
    if (!process.env.API_KEY) {
        alert("API Key is missing in environment variables.");
        return;
    }
  };

  const addStep = () => {
    pushToHistory();
    setDoc(prev => ({
      ...prev,
      steps: [
        ...prev.steps,
        {
          id: Math.random().toString(36).substr(2, 9), // Use simple random for safety
          order: prev.steps.length + 1,
          description: "[Enter step description here]",
          image: null
        }
      ]
    }));
  };

  const removeLastStep = () => {
    if (doc.steps.length === 0) return;
    pushToHistory();
    setDoc(prev => {
        return {
            ...prev,
            steps: prev.steps.slice(0, -1)
        };
    });
  };

  const updateStep = (id: string, updates: Partial<SOPStep>) => {
    setDoc(prev => ({
      ...prev,
      steps: prev.steps.map(s => s.id === id ? { ...s, ...updates } : s)
    }));
  };

  const updateMeta = (field: keyof typeof doc.meta, value: string) => {
    setDoc(prev => ({
      ...prev,
      meta: { ...prev.meta, [field]: value }
    }));
  };

  // Pagination Logic
  const pages = [];
  for (let i = 0; i < doc.steps.length; i += ITEMS_PER_PAGE) {
    pages.push(doc.steps.slice(i, i + ITEMS_PER_PAGE));
  }
  if (pages.length === 0) pages.push([]); 

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      
      <ConfirmationModal 
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={executeReset}
        title="Reset All Data?"
        message="This will completely clear your current SOP, removing all images, text, and metadata. This action cannot be undone."
        confirmLabel="Reset Everything"
        isDangerous={true}
      />

      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} type="button">
            <ChevronLeft size={16} className="mr-1" /> Back
          </Button>
          <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
          <div className="flex items-center gap-1">
             <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleUndo} 
                disabled={history.length === 0}
                title="Undo (Ctrl+Z)"
                type="button"
             >
                <Undo size={16} />
             </Button>
             <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRedo} 
                disabled={future.length === 0}
                title="Redo (Ctrl+Y)"
                type="button"
             >
                <Redo size={16} />
             </Button>
          </div>
          
          <Button 
             variant="ghost" 
             size="sm" 
             onClick={() => setIsResetModalOpen(true)}
             className="text-red-600 hover:bg-red-50 hover:text-red-700"
             title="Reset all data to default"
             type="button"
          >
             <RotateCcw size={16} className="mr-2" /> Reset
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
            {/* Save Status Indicator */}
            <div className={`flex items-center text-xs font-medium mr-4 transition-all duration-300 ${saveStatus === 'idle' ? 'opacity-0' : 'opacity-100'}`}>
                {saveStatus === 'saving' ? (
                   <span className="text-slate-400 flex items-center"><Loader2 size={12} className="animate-spin mr-1.5" /> Saving Project...</span>
                ) : (
                   <span className="text-emerald-600 flex items-center"><CheckCircle size={14} className="mr-1.5" /> Project Saved</span>
                )}
            </div>

            <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)} className={showSettings ? 'bg-slate-100' : ''} type="button">
                <Settings size={16} className="mr-2" /> <span className="hidden sm:inline">Properties</span>
            </Button>
            
            <div className="h-6 w-px bg-slate-200 hidden sm:block mx-1"></div>

            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleLoadProject} 
                accept=".json" 
                className="hidden" 
            />
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} title="Load saved .json project" type="button">
                <FolderOpen size={16} className="mr-2" /> <span className="hidden sm:inline">Load Project</span>
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleSaveProject} title="Save project as .json" type="button">
                <Save size={16} className="mr-2" /> <span className="hidden sm:inline">Save Project</span>
            </Button>
            
            <Button variant="primary" size="sm" onClick={handleDownloadPDF} className="ml-2" type="button">
                <Download size={16} className="mr-2" /> Export PDF
            </Button>
        </div>
      </header>

      <div className="flex flex-grow overflow-hidden relative">
        
        {/* Sidebar Settings */}
        <aside 
            // Key added here to force re-render of inputs on Reset
            key={doc.meta.id + '-sidebar'}
            className={`
                fixed md:relative inset-y-0 left-0 z-10 w-80 bg-white border-r border-slate-200 
                transform transition-transform duration-300 ease-in-out flex flex-col
                ${showSettings ? 'translate-x-0' : '-translate-x-full md:hidden'}
            `}
        >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Settings size={18} className="text-slate-400" />
                  SOP Properties
                </h3>
                <button onClick={() => setShowSettings(false)} className="md:hidden text-slate-400 p-1 hover:bg-slate-200 rounded" type="button">
                    <ChevronLeft size={20}/>
                </button>
            </div>
            
            <div className="overflow-y-auto p-6 flex flex-col h-full">
                <div className="space-y-5 flex-grow">
                    <Input 
                        label="SOP Title" 
                        value={doc.meta.title} 
                        onChange={e => updateMeta('title', e.target.value)}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        placeholder="e.g. Job Imposition - RICOH"
                    />
                    <div className="space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                          <Input 
                              label="SOP ID" 
                              value={doc.meta.sopId} 
                              onChange={e => updateMeta('sopId', e.target.value)}
                              onFocus={handleInputFocus}
                              onBlur={handleInputBlur}
                              placeholder="e.g. ID-001"
                          />
                          <Input 
                              label="Version" 
                              value={doc.meta.version} 
                              onChange={e => updateMeta('version', e.target.value)}
                              onFocus={handleInputFocus}
                              onBlur={handleInputBlur}
                              placeholder="e.g. 1.0"
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <Input 
                              label="Date" 
                              type="date"
                              value={doc.meta.date} 
                              onChange={e => updateMeta('date', e.target.value)}
                              onFocus={handleInputFocus}
                              onBlur={handleInputBlur}
                          />
                          <Input 
                              label="Cycle Time" 
                              value={doc.meta.cycleTime} 
                              onChange={e => updateMeta('cycleTime', e.target.value)}
                              onFocus={handleInputFocus}
                              onBlur={handleInputBlur}
                              placeholder="e.g. 30min"
                          />
                      </div>
                      <Input 
                          label="Author" 
                          value={doc.meta.author} 
                          onChange={e => updateMeta('author', e.target.value)}
                          onFocus={handleInputFocus}
                          onBlur={handleInputBlur}
                          placeholder="Enter Author Name"
                      />
                    </div>
                </div>
                
                <div className="space-y-3 py-6 border-t border-slate-100">
                    <Button variant="outline" className="w-full justify-start text-slate-600 bg-white hover:bg-slate-50" onClick={addStep} type="button">
                        <Plus size={16} className="mr-2" /> Add New Step
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700" onClick={removeLastStep} disabled={doc.steps.length === 0} type="button">
                        <Trash2 size={16} className="mr-2" /> Remove Last Step
                    </Button>
                </div>

                <div className="mt-auto pt-2">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 border-dashed relative overflow-hidden group select-none opacity-80">
                        <div className="absolute top-3 right-3 bg-slate-700 text-white text-[9px] font-bold px-2 py-0.5 rounded-full z-20 tracking-wider">
                           COMING SOON
                        </div>
                        <h4 className="font-semibold text-slate-400 mb-2 flex items-center gap-2 text-sm relative z-10">
                            <Sparkles size={14} /> AI Generator
                        </h4>
                        <p className="text-xs text-slate-400/80 mb-4 leading-relaxed relative z-10">
                            Enter a title and let Gemini AI write the steps for you automatically.
                        </p>
                        <Button 
                            variant="secondary" 
                            size="sm" 
                            className="w-full bg-slate-200 text-slate-400 cursor-not-allowed shadow-none relative z-10" 
                            disabled
                            type="button"
                        >
                            <Lock size={12} className="mr-2" /> Auto-Generate Steps
                        </Button>
                    </div>
                </div>

            </div>
        </aside>

        {/* Main Canvas Area */}
        <main className={`flex-grow overflow-auto bg-slate-100/50 p-4 md:p-8 relative transition-all ${showSettings ? 'md:pl-0' : ''}`}>
            {/* 
                We use doc.meta.id as the key here. 
                When a reset happens, a new ID is generated, forcing React to discard 
                the entire DOM subtree and recreate it. This ensures all state, 
                including uncontrolled inputs (like file pickers) and scrolling, is reset.
            */}
            <div key={doc.meta.id} id="sop-container" className="flex flex-col items-center gap-8 pb-20 origin-top">
                {pages.map((pageSteps, index) => (
                    <SOPGridPage 
                        key={index}
                        meta={doc.meta}
                        steps={pageSteps}
                        pageNumber={index + 1}
                        totalPages={pages.length}
                        onUpdateStep={updateStep}
                        onInputFocus={handleInputFocus}
                        onInputBlur={handleInputBlur}
                    />
                ))}
            </div>

            {doc.steps.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 pointer-events-none">
                    <Layout size={64} className="mb-4 opacity-10" />
                    <p className="text-lg font-medium opacity-50">Document is empty</p>
                </div>
            )}
        </main>
      </div>
    </div>
  );
};