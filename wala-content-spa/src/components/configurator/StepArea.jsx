import React from 'react';
import { useConfiguratorStore } from '../../store/configuratorStore';
import { Briefcase, Megaphone, ShoppingCart, Archive, DollarSign, FileText, Calendar } from 'lucide-react';

const AREAS = [
  { id: '1', name: 'Negocios y Familia', icon: Briefcase, color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400' },
  { id: '2', name: 'Marketing', icon: Megaphone, color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-400' },
  { id: '3', name: 'Compras', icon: ShoppingCart, color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400' },
  { id: '4', name: 'Control de Stock', icon: Archive, color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400' },
  { id: '5', name: 'Costeo', icon: DollarSign, color: 'from-red-500/20 to-rose-500/20 border-red-500/30 text-red-400' },
  { id: '6', name: 'Mantenimiento de Registros', icon: FileText, color: 'from-cyan-500/20 to-sky-500/20 border-cyan-500/30 text-cyan-400' },
  { id: '7', name: 'Planificación', icon: Calendar, color: 'from-violet-500/20 to-fuchsia-500/20 border-violet-500/30 text-violet-400' }
];

export default function StepArea() {
  const { selectedArea, setArea } = useConfiguratorStore();

  return (
    <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-5 border border-slate-800/80 shadow-xl">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-wala-600 text-xs font-bold text-white">1</span>
        Selecciona el Área WALA
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {AREAS.map((a) => {
          const Icon = a.icon;
          const isSelected = selectedArea === a.id;
          return (
            <button
              key={a.id}
              onClick={() => setArea(a.id)}
              className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all duration-300 ${
                isSelected 
                  ? `bg-slate-800/90 border-wala-500 ring-2 ring-wala-500/20 shadow-lg shadow-wala-500/5 scale-[1.02]` 
                  : 'bg-slate-950/40 border-slate-800/50 hover:bg-slate-800/40 hover:border-slate-700/60'
              }`}
            >
              <div className={`p-2 rounded-lg bg-gradient-to-br ${a.color} border`}>
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-slate-500 font-medium">Área {a.id}</div>
                <div className="text-sm font-semibold text-slate-200 truncate">{a.name}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
