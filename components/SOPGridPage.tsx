
import React, { useState } from 'react';
import { SOPMetaData, SOPStep, ImageFitMode } from '../types';
import { Upload, ImageIcon, Maximize, Minimize, RectangleHorizontal } from 'lucide-react';
import { COMPANY_LOGO } from '../constants';

interface SOPGridPageProps {
  meta: SOPMetaData;
  steps: SOPStep[];
  pageNumber: number;
  totalPages: number;
  onUpdateStep: (id: string, updates: Partial<SOPStep>) => void;
  onInputFocus?: () => void;
  onInputBlur?: () => void;
  isReadOnly?: boolean;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}-${month}-${year}`;
  }
  return dateStr;
};

export const SOPGridPage: React.FC<SOPGridPageProps> = ({ 
  meta, 
  steps, 
  pageNumber, 
  totalPages, 
  onUpdateStep,
  onInputFocus,
  onInputBlur,
  isReadOnly = false
}) => {
  
  // Ensure we always have 6 slots for the grid
  const gridSlots = Array.from({ length: 6 }).map((_, i) => steps[i] || null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, stepId: string) => {
    if (onInputFocus) onInputFocus(); 
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateStep(stepId, { image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const cycleImageFit = (step: SOPStep, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onInputFocus) onInputFocus();

    const modes: ImageFitMode[] = ['contain', 'cover', 'fill'];
    const currentIndex = modes.indexOf(step.imageFit || 'contain');
    const nextMode = modes[(currentIndex + 1) % modes.length];
    
    onUpdateStep(step.id, { imageFit: nextMode });
    
    if (onInputBlur) onInputBlur();
  };

  const handleTextFocus = () => {
    if (onInputFocus) onInputFocus();
  };

  const handleTextBlur = () => {
    if (onInputBlur) onInputBlur();
  };

  // Explicit pixel sizes help consistency between screen and PDF export
  const stepTextStyle = isReadOnly 
    ? "w-full h-full bg-transparent text-[11px] text-slate-800 leading-[1.4] p-1 resize-none overflow-hidden block font-medium"
    : "w-full h-full bg-transparent text-xs text-slate-800 leading-snug p-1 resize-none focus:outline-none placeholder:text-slate-300 block font-medium";

  return (
    <div 
      className={`sop-page-export bg-white w-full mx-auto shadow-2xl flex flex-col ${isReadOnly ? '' : 'transition-shadow duration-300'}`} 
      style={{ 
        width: '100%', 
        maxWidth: '297mm', 
        minWidth: '297mm', 
        aspectRatio: '297/210',
        minHeight: '210mm' 
      }}
    >
      
      {/* Header - Flexbox centering prevents clipping compared to hard padding */}
      <header className="bg-[#00529b] text-white px-8 flex justify-between items-center h-[16mm] shrink-0 overflow-hidden">
        <h1 className="text-lg font-bold tracking-wide w-full truncate leading-normal flex items-center h-full pt-1">
            Standard Operating Procedure: {meta.title || <span className="opacity-50 font-normal ml-1">[Title Here]</span>}
        </h1>
        <div className="shrink-0 ml-4 opacity-90 flex items-center justify-center h-full">
           {COMPANY_LOGO ? (
             <img src={COMPANY_LOGO} alt="Logo" className="h-8 w-auto object-contain filter brightness-0 invert" />
           ) : (
              <svg id="PANDA" width="32" height="32" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill="#fbfafa" d="M6.3,9.8c-.1-.3,0-.6.3-.7.3-.1.6,0,.7.3.2.5.6.8,1,1,.4.2,1,.2,1.4,0,.5-.2.8-.6,1-1,.2-.4.2-1,0-1.4-.2-.4-.4-.7-.8-.9-.3-.2-.8-.3-1.2-.2-.5,0-1,0-1.5-.2-.5-.2-.9-.5-1.2-1l-1.1-1.4c-.2-.2-.1-.6.1-.8.2-.2.6-.1.8.1l1.1,1.4c.2.3.5.5.8.6.3.1.6.2,1,.1.6,0,1.3,0,1.8.4.5.3,1,.8,1.2,1.4.3.8.3,1.6,0,2.3-.3.7-.8,1.3-1.6,1.6-.8.3-1.6.3-2.3,0-.7-.3-1.3-.8-1.6-1.6"/>
                <path fill="#fbfafa" d="M3.8,6.3c0,.3-.3.5-.6.5-.5,0-1,.1-1.4.4-.4.3-.6.8-.7,1.3,0,.5.1,1,.4,1.4.3.4.8.6,1.3.7.4,0,.8,0,1.1-.3.3-.2.6-.5.8-.9.2-.5.5-.9.9-1.2.4-.3.9-.5,1.4-.6l1.8-.2c.3,0,.6.2.6.5,0,.3-.2.6-.5.6l-1.8.2c-.3,0-.6.2-.9.4-.3.2-.5.5-.6.8-.2.6-.7,1.1-1.2,1.4-.5.3-1.2.5-1.8.4-.8,0-1.5-.5-2-1.1C.2,9.9,0,9.1,0,8.3c0-.8.5-1.5,1.1-2,.6-.5,1.4-.7,2.2-.7.3,0,.5.3.5.6"/>
                <path fill="#fbfafa" d="M7.6.9c.7.5,1.1,1.2,1.2,1.9.1.7,0,1.5-.5,2.2-.2.2-.5.3-.8.1-.2-.2-.3-.5-.1-.8.3-.4.4-.9.3-1.4,0-.5-.3-.9-.8-1.2-.4-.3-.9-.4-1.4-.3-.5,0-.9.3-1.2.8-.2.3-.4.7-.3,1.1,0,.4.1.8.4,1.1.3.4.5.9.6,1.4,0,.5,0,1-.2,1.5l-.7,1.6c-.1.3-.4.4-.7.3-.3-.1-.4-.4-.3-.7l.7-1.6c.1-.3.2-.6.1-1,0-.3-.2-.6-.4-.9-.4-.5-.6-1.1-.6-1.8,0-.6.2-1.2.5-1.8.5-.7,1.2-1.1,1.9-1.2.7-.1,1.5,0,2.2.5"/>
              </svg>
           )}
        </div>
      </header>

      {/* Main Grid Content */}
      <div className="flex-grow grid grid-cols-3 grid-rows-2 border-x border-b border-slate-200">
        {gridSlots.map((step, index) => {
           const stepNumber = ((pageNumber - 1) * 6) + (index + 1);
           const fitMode = step?.imageFit || 'contain';
           
           return (
            <div 
              key={index} 
              className={`
                flex flex-col h-full bg-white relative group
                border-slate-200 min-h-0 min-w-0
                ${(index + 1) % 3 !== 0 ? 'border-r' : ''}
                ${index < 3 ? 'border-b' : ''}
              `}
            >
              {/* Image Area */}
              <div className="relative flex-grow w-full bg-slate-50/30 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center p-0.5">
                    {step?.image ? (
                      isReadOnly ? (
                        // EXPORT MODE: High-res/Standard DOM structure
                        // We avoid object-fit in favor of max-width/height centering to please html2canvas
                        <div className="w-full h-full flex items-center justify-center bg-white overflow-hidden">
                           <img 
                             src={step.image}
                             className={`
                               block
                               ${fitMode === 'contain' ? 'max-w-full max-h-full w-auto h-auto' : ''}
                               ${fitMode === 'cover' ? 'w-full h-full object-cover' : ''}
                               ${fitMode === 'fill' ? 'w-full h-full' : ''}
                             `}
                             alt=""
                           />
                        </div>
                      ) : (
                        // EDITOR MODE: Standard CSS object-fit for immediate feedback
                        <img 
                          src={step.image} 
                          alt={`Step ${stepNumber}`} 
                          className={`w-full h-full object-${fitMode} drop-shadow-sm`} 
                        />
                      )
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-300">
                        <ImageIcon className="w-12 h-12 mb-2 opacity-20" strokeWidth={1.5} />
                        {!isReadOnly && <span className="text-[10px] font-bold text-slate-400/50 uppercase tracking-widest">Add Image</span>}
                      </div>
                    )}
                </div>
                
                {/* Image Controls Overlay */}
                {!isReadOnly && step && (
                  <>
                     {step.image && (
                         <div className="absolute top-2 right-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                             <button 
                                onClick={(e) => cycleImageFit(step, e)}
                                className="bg-white/90 p-1.5 rounded-md shadow-sm border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all"
                                title={`Current fit: ${fitMode.toUpperCase()} (Click to change)`}
                             >
                                {fitMode === 'contain' && <Minimize size={14} />}
                                {fitMode === 'cover' && <Maximize size={14} />}
                                {fitMode === 'fill' && <RectangleHorizontal size={14} />}
                             </button>
                         </div>
                     )}

                     <label className="absolute inset-0 cursor-pointer z-10">
                        <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        key={step.id + (step.image ? '-full' : '-empty')}
                        onClick={handleTextFocus} 
                        onChange={(e) => {
                            handleImageUpload(e, step.id);
                            setTimeout(handleTextBlur, 500);
                        }}
                        />
                        {!step.image && (
                          <div className="absolute inset-0 bg-transparent hover:bg-slate-50/50 transition-colors duration-200" />
                        )}
                         {step.image && (
                            <div className="absolute inset-0 bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center backdrop-blur-[1px]">
                                <div className="bg-white px-4 py-2 rounded-full shadow-lg border border-slate-100 flex items-center gap-2 text-xs font-bold uppercase text-slate-600 tracking-wide hover:text-blue-600 hover:border-blue-200 transform scale-95 group-hover:scale-100 transition-transform">
                                <Upload size={14} />
                                Replace
                                </div>
                            </div>
                         )}
                    </label>
                  </>
                )}
              </div>

              {/* Text Area */}
              <div className="h-[120px] shrink-0 w-full px-3 py-1.5 flex flex-col bg-white border-t border-slate-100 relative z-20">
                <div className="flex items-center justify-between mb-0.5">
                   <span className="text-[10px] font-bold text-blue-600/70 uppercase tracking-wider">Step {stepNumber}</span>
                </div>
                
                {isReadOnly ? (
                  <div 
                    className={`${stepTextStyle} whitespace-pre-wrap break-words overflow-hidden`}
                  >
                    {step ? step.description : ''}
                  </div>
                ) : (
                  step ? (
                    <textarea
                      className={stepTextStyle}
                      value={step.description}
                      onChange={(e) => onUpdateStep(step.id, { description: e.target.value })}
                      onFocus={handleTextFocus}
                      onBlur={handleTextBlur}
                      placeholder="Enter step description..."
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200 text-xs italic">
                      Empty Slot
                    </div>
                  )
                )}
              </div>
            </div>
           );
        })}
      </div>

      {/* Footer - Precise pixel control for exports */}
      <footer className="h-[12mm] border border-slate-200 border-t-0 bg-white text-slate-500 text-[9px] uppercase tracking-wide flex items-stretch divide-x divide-slate-200 shrink-0 overflow-hidden">
        <div className="px-4 flex flex-col justify-center w-1/5 py-1">
          <span className="text-[7px] text-slate-400 font-bold mb-px leading-none">SOP ID</span>
          <span className="font-medium text-slate-900 truncate leading-none pt-0.5">{meta.sopId}</span>
        </div>
        <div className="px-4 flex flex-col justify-center w-1/6 py-1">
          <span className="text-[7px] text-slate-400 font-bold mb-px leading-none">Date</span>
          <span className="font-medium text-slate-900 truncate leading-none pt-0.5">{formatDate(meta.date)}</span>
        </div>
        <div className="px-4 flex flex-col justify-center flex-grow py-1">
          <span className="text-[7px] text-slate-400 font-bold mb-px leading-none">Author</span>
          <span className="font-medium text-slate-900 truncate leading-none pt-0.5">{meta.author}</span>
        </div>
        <div className="px-4 flex flex-col justify-center w-1/6 py-1">
           <span className="text-[7px] text-slate-400 font-bold mb-px leading-none">Cycle Time</span>
           <span className="font-medium text-slate-900 truncate leading-none pt-0.5">{meta.cycleTime}</span>
        </div>
        <div className="px-4 flex flex-col justify-center w-1/6 py-1">
           <span className="text-[7px] text-slate-400 font-bold mb-px leading-none">Version</span>
           <span className="font-medium text-slate-900 truncate leading-none pt-0.5">{meta.version}</span>
        </div>
        <div className="px-4 flex items-center justify-end font-bold text-slate-400 w-[100px] bg-slate-50/50">
          Page {pageNumber} / {totalPages}
        </div>
      </footer>
    </div>
  );
};
