import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', id, ...props }) => {
  const inputId = id || props.name || Math.random().toString(36).substr(2, 9);

  return (
    <div className="w-full group">
      {label && (
        <label htmlFor={inputId} className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
          {label}
        </label>
      )}
      <div className="relative transition-all duration-200 ease-in-out">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`
            w-full rounded-lg border border-slate-200 bg-slate-50/50 
            ${icon ? 'pl-10' : 'px-3'} py-2.5 text-sm text-slate-700 font-medium
            placeholder:text-slate-400/60 placeholder:font-normal
            focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 focus:outline-none focus:shadow-sm
            disabled:cursor-not-allowed disabled:opacity-50 
            transition-all duration-200
            ${error ? 'border-red-500 focus:ring-red-500' : ''} 
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};