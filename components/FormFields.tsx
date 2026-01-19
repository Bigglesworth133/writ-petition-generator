
import React, { memo, useState } from 'react';
import { MessageSquare, Trash2, Edit, CheckCircle2, CornerUpRight, ChevronDown, CheckCircle } from 'lucide-react';

interface InputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
  description?: string;
  reviewMode?: boolean;
  onAddAnnotation?: (text: string) => void;
  onRemoveAnnotation?: (id: string) => void;
  onEditAnnotation?: (id: string) => void;
  onToggleResolve?: (id: string) => void;
  onAddReply?: (id: string) => void;
  annotations?: any[];
  elementId?: string;
}

const FieldComments = ({ annotations, onRemove, onEdit, onToggleResolve, onAddReply }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  if (!annotations || annotations.length === 0) return null;

  const resolvedCount = annotations.filter((a: any) => a.isResolved).length;
  const activeCount = annotations.length - resolvedCount;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black transition-all ${activeCount > 0 ? 'bg-amber-100 text-amber-700 animate-pulse' : 'bg-green-100 text-green-700'}`}
      >
        <MessageSquare className="w-3 h-3" />
        {annotations.length} {isOpen ? <ChevronDown className="w-2 h-2 rotate-180" /> : <ChevronDown className="w-2 h-2" />}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-8 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[100] p-4 animate-in fade-in zoom-in duration-200">
          <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 flex justify-between">
            Field Feedback
            <span className="text-gray-300">{resolvedCount}/{annotations.length} resolved</span>
          </h5>
          <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
            {annotations.map((anno: any) => (
              <div key={anno.id} className={`p-3 rounded-xl border transition-all ${anno.isResolved ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-blue-50/30 border-blue-100'}`}>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-black text-gray-900">{anno.author}</span>
                  <div className="flex items-center gap-1.5 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all">
                    <button onClick={() => onEdit(anno.id)}><Edit className="w-2.5 h-2.5" /></button>
                    <button onClick={() => onToggleResolve(anno.id)} className={anno.isResolved ? 'text-green-600' : ''}><CheckCircle2 className="w-2.5 h-2.5" /></button>
                    <button onClick={() => onRemove(anno.id)}><Trash2 className="w-2.5 h-2.5" /></button>
                  </div>
                </div>
                <p className="text-[11px] text-gray-700 leading-tight mb-2">"{anno.text}"</p>

                {anno.replies?.map((r: any) => (
                  <div key={r.id} className="mt-2 pl-2 border-l border-gray-200 text-[10px]">
                    <span className="font-bold text-gray-600">{r.author}:</span> {r.text}
                  </div>
                ))}

                <button onClick={() => onAddReply(anno.id)} className="text-[9px] font-bold text-blue-600 uppercase mt-2 hover:underline flex items-center gap-1">
                  <CornerUpRight className="w-2 h-2" /> Reply
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const TextInput = memo(({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  multiline = false,
  description,
  reviewMode,
  onAddAnnotation,
  onRemoveAnnotation,
  onEditAnnotation,
  onToggleResolve,
  onAddReply,
  annotations
}: InputProps) => {
  const inputClass = "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 bg-white text-black text-base placeholder-gray-400";

  return (
    <div className="mb-5 relative group">
      <div className="flex justify-between items-baseline mb-1">
        <label className="block text-sm font-bold text-gray-800">{label}</label>
        <div className="flex items-center gap-2">
          {description && <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">{description}</span>}
          {reviewMode && annotations && (
            <FieldComments
              annotations={annotations}
              onRemove={onRemoveAnnotation}
              onEdit={onEditAnnotation}
              onToggleResolve={onToggleResolve}
              onAddReply={onAddReply}
            />
          )}
          {reviewMode && onAddAnnotation && (
            <button
              onClick={() => {
                const text = prompt(`Comment on ${label}:`);
                if (text) onAddAnnotation(text);
              }}
              className="p-1 hover:bg-blue-50 text-blue-400 hover:text-blue-600 rounded transition-colors"
              title="Comment on this field"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      {multiline ? (
        <div className="relative group">
          <textarea
            rows={5}
            className={inputClass}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
          />
          <div className="absolute bottom-2 right-2 flex gap-2 opacity-10 group-focus-within:opacity-100 transition-opacity pointer-events-none">
            <span className="text-[10px] font-black text-gray-400 bg-white/80 px-1 rounded border border-gray-100 italic">Formatting: **bold** *italic*</span>
          </div>
        </div>
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

export const SelectInput = memo(({
  label,
  value,
  options,
  onChange,
  reviewMode,
  onAddAnnotation,
  onRemoveAnnotation,
  onEditAnnotation,
  onToggleResolve,
  onAddReply,
  annotations
}: {
  label: string,
  value: string,
  options: { label: string, value: string }[],
  onChange: (val: any) => void,
  reviewMode?: boolean,
  onAddAnnotation?: (text: string) => void,
  onRemoveAnnotation?: (id: string) => void,
  onEditAnnotation?: (id: string) => void,
  onToggleResolve?: (id: string) => void,
  onAddReply?: (id: string) => void,
  annotations?: any[]
}) => (
  <div className="mb-5 relative group">
    <div className="flex justify-between items-center mb-1">
      <label className="block text-sm font-bold text-gray-800">{label}</label>
      <div className="flex items-center gap-2">
        {reviewMode && annotations && (
          <FieldComments
            annotations={annotations}
            onRemove={onRemoveAnnotation}
            onEdit={onEditAnnotation}
            onToggleResolve={onToggleResolve}
            onAddReply={onAddReply}
          />
        )}
        {reviewMode && onAddAnnotation && (
          <button
            onClick={() => {
              const text = prompt(`Comment on ${label}:`);
              if (text) onAddAnnotation(text);
            }}
            className="p-1 hover:bg-blue-50 text-blue-400 hover:text-blue-600 rounded transition-colors"
            title="Comment on this field"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-black"
    >
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
));
