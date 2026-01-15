
import React, { memo } from 'react';

interface InputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
  description?: string;
}

export const TextInput = memo(({ label, value, onChange, placeholder, type = "text", multiline = false, description }: InputProps) => {
  const inputClass = "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 bg-white text-black text-base placeholder-gray-400";
  
  return (
    <div className="mb-5">
      <div className="flex justify-between items-baseline mb-1">
        <label className="block text-sm font-bold text-gray-800">{label}</label>
        {description && <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">{description}</span>}
      </div>
      {multiline ? (
        <textarea
          rows={5}
          className={inputClass}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          className={inputClass}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
});

export const SectionHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="mb-8 mt-12 border-b-2 border-gray-100 pb-3">
    <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
      <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
      {title}
    </h3>
    {subtitle && <p className="text-sm text-gray-500 mt-1 font-medium">{subtitle}</p>}
  </div>
);

export const RepeatableBlock = ({ 
  title, 
  onAdd, 
  children 
}: { 
  title: string; 
  onAdd: () => void; 
  children: React.ReactNode 
}) => (
  <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-200 mb-8">
    <div className="flex justify-between items-center mb-6">
      <h4 className="font-black text-gray-800 uppercase tracking-widest text-xs">{title}</h4>
      <button 
        type="button"
        onClick={onAdd}
        className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
      >
        + Add {title.replace(/List|s$/i, '')}
      </button>
    </div>
    <div className="space-y-6">
      {children}
    </div>
  </div>
);

export const SelectInput = memo(({ label, value, options, onChange }: { label: string, value: string, options: {label: string, value: string}[], onChange: (val: any) => void }) => (
  <div className="mb-5">
    <label className="block text-sm font-bold text-gray-800 mb-1">{label}</label>
    <select 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-black"
    >
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
));
