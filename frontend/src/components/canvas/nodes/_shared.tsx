import React, { ChangeEvent } from 'react';
import { Handle, Position, useNodes, useEdges } from '@xyflow/react';
import { useGetDatasetQuery } from '../../../store/api';
import { Trash2 } from 'lucide-react';

export interface CanvasNodeData extends Record<string, unknown> {
  onChange?: (id: string, key: string, value: string) => void;
  onDelete?: (id: string) => void;
  [key: string]: unknown;
}

export function useNodeUpdate(id: string, data: CanvasNodeData) {
  return (e: ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
    if (data.onChange) {
      data.onChange(id, e.target.name, e.target.value);
    }
  };
}

export function NodeShell({
  id,
  data,
  children,
  color,
  icon: Icon,
  title,
  hasInput = false,
  hasOutput = true,
  badge,
}: {
  id: string;
  data: CanvasNodeData;
  children: React.ReactNode;
  color: string;
  icon: React.ElementType;
  title: string;
  hasInput?: boolean;
  hasOutput?: boolean;
  badge?: string;
}) {
  return (
    <div
      className="relative group"
      style={{ minWidth: 260 }}
    >
      {hasInput && <Handle type="target" position={Position.Left} id="in" className="!w-3 !h-3 !bg-surface-300 !border-2 !border-surface-700 hover:!bg-accent-400 transition-colors" />}

      <div className="rounded-2xl overflow-hidden shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)] border border-white/[0.08] bg-surface-900/90 backdrop-blur-2xl transition-all duration-200 group-hover:shadow-[0_12px_50px_-8px_rgba(0,0,0,0.7)] group-hover:border-white/[0.12]">
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }} />

        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.06]">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
            style={{ background: `${color}20`, boxShadow: `0 0 20px ${color}15` }}
          >
            <Icon size={16} style={{ color }} />
          </div>
          <span className="font-bold text-[13px] text-surface-100 tracking-wide">{title}</span>
          <div className="ml-auto flex items-center gap-2">
            {badge && (
              <span className="text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full border" style={{ color, borderColor: `${color}40`, background: `${color}10` }}>
                {badge}
              </span>
            )}
            {data?.onDelete && (
              <button
                onClick={() => data.onDelete!(id)}
                className="text-surface-400 hover:text-red-400 hover:bg-red-400/10 p-1.5 rounded-md transition-colors"
                title="Supprimer ce bloc"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="px-4 py-3 space-y-3 text-[12px]">
          {children}
        </div>
      </div>

      {hasOutput && <Handle type="source" position={Position.Right} id="out" className="!w-3 !h-3 !bg-surface-300 !border-2 !border-surface-700 hover:!bg-accent-400 transition-colors" />}
    </div>
  );
}

export function NodeLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-surface-400 text-[11px] font-semibold uppercase tracking-wider mb-1">{children}</label>;
}

export function NodeSelect({ name, value, onChange, children }: { name: string; value?: string; onChange: (e: ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode }) {
  return (
    <select
      name={name}
      defaultValue={value}
      onChange={onChange}
      className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/[0.08] text-surface-100 text-[12px] font-medium focus:outline-none focus:border-accent-500/50 focus:ring-1 focus:ring-accent-500/20 transition-colors appearance-none cursor-pointer"
    >
      {children}
    </select>
  );
}

export function NodeInput({ name, placeholder, value, onChange }: { name: string; placeholder: string; value?: string; onChange: (e: ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <input
      type="text"
      name={name}
      placeholder={placeholder}
      defaultValue={value}
      onChange={onChange}
      className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/[0.08] text-surface-100 text-[12px] font-medium placeholder:text-surface-600 focus:outline-none focus:border-accent-500/50 focus:ring-1 focus:ring-accent-500/20 transition-colors"
    />
  );
}

export function useConnectedColumns(id: string) {
  const allNodes = useNodes();
  const allEdges = useEdges();

  const getDatasetId = (): string | null => {
    let currentId = id;
    const visited = new Set<string>();
    while (currentId) {
      if (visited.has(currentId)) return null;
      visited.add(currentId);
      const node = allNodes.find(n => n.id === currentId);
      if (node?.type === 'dataset' && node.data?.file) return node.data.file as string;
      const parentEdge = allEdges.find(e => e.target === currentId);
      if (!parentEdge) return null;
      currentId = parentEdge.source;
    }
    return null;
  };

  const dsId = getDatasetId();
  const { data: dataset } = useGetDatasetQuery(dsId!, { skip: !dsId });
  
  const columns: string[] = dataset?.profile?.dictionary?.map((c: any) => typeof c === 'string' ? c : (c.nom_brut || c.name || '')) || [];
  return { dsId, dataset, columns };
}

export function NodeColumnSelect({ name, value, onChange, columns, placeholder = "-- Sélectionner --" }: { name: string; value?: string; onChange: (e: ChangeEvent<HTMLSelectElement>) => void; columns: string[], placeholder?: string }) {
  if (columns.length === 0) {
    return <NodeInput name={name} value={value} onChange={onChange as any} placeholder={placeholder} />;
  }
  return (
    <select
      name={name}
      value={value || ''}
      onChange={onChange}
      className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/[0.08] text-surface-100 text-[12px] font-medium focus:outline-none focus:border-accent-500/50 focus:ring-1 focus:ring-accent-500/20 transition-colors appearance-none cursor-pointer"
    >
      <option value="">{placeholder}</option>
      {columns.map(c => <option key={c} value={c}>{c}</option>)}
    </select>
  );
}

export function NodeMultiColumnInput({ name, value, onChange, columns, placeholder }: { name: string; value?: string; onChange: (e: any) => void; columns: string[], placeholder?: string }) {
  const currentValues = (value || '').split(',').map(s => s.trim()).filter(Boolean);
  
  const toggleColumn = (col: string) => {
    let newValues;
    if (currentValues.includes(col)) {
      newValues = currentValues.filter(c => c !== col);
    } else {
      newValues = [...currentValues, col];
    }
    onChange({ target: { name, value: newValues.join(', ') } });
  };

  return (
    <div className="space-y-2">
      <input
        type="text"
        name={name}
        placeholder={placeholder}
        value={value || ''}
        onChange={onChange}
        className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/[0.08] text-surface-100 text-[12px] font-medium placeholder:text-surface-600 focus:outline-none focus:border-accent-500/50 focus:ring-1 focus:ring-accent-500/20 transition-colors"
      />
      {columns.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1 max-h-24 overflow-y-auto custom-scrollbar p-1">
          {columns.map(col => (
             <button
               key={col}
               type="button"
               onClick={() => toggleColumn(col)}
               className={`text-[9px] px-2 py-0.5 rounded-full border transition-colors ${currentValues.includes(col) ? 'bg-accent-500/20 border-accent-500/40 text-accent-300' : 'bg-white/5 border-white/10 text-surface-400 hover:bg-white/10 hover:text-surface-200'}`}
             >
               {col}
             </button>
          ))}
        </div>
      )}
    </div>
  );
}
