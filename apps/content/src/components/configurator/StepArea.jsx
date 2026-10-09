import React from 'react';
import { useConfiguratorStore } from '../../store/configuratorStore';
import { useLibraryStore } from '../../store/libraryStore';
import { Briefcase, Megaphone, ShoppingCart, Archive, DollarSign, FileText, Calendar } from 'lucide-react';

const AREAS = [
  { id: '1', name: 'Negocios y Familia', icon: Briefcase, color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-600 dark:text-amber-400', activeClass: 'bg-amber-50/80 border-amber-500 text-amber-900 ring-amber-500/20' },
  { id: '2', name: 'Marketing', icon: Megaphone, color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-600 dark:text-blue-400', activeClass: 'bg-blue-50/80 border-blue-500 text-blue-900 ring-blue-500/20' },
  { id: '3', name: 'Compras', icon: ShoppingCart, color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400', activeClass: 'bg-emerald-50/80 border-emerald-500 text-emerald-900 ring-emerald-500/20' },
  { id: '4', name: 'Control de Stock', icon: Archive, color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-600 dark:text-purple-400', activeClass: 'bg-purple-50/80 border-purple-500 text-purple-900 ring-purple-500/20' },
  { id: '5', name: 'Costeo', icon: DollarSign, color: 'from-red-500/20 to-rose-500/20 border-red-500/30 text-red-600 dark:text-red-400', activeClass: 'bg-red-50/80 border-red-500 text-red-900 ring-red-500/20' },
  { id: '6', name: 'Mantenimiento de Registros', icon: FileText, color: 'from-cyan-500/20 to-sky-500/20 border-cyan-500/30 text-cyan-600 dark:text-cyan-400', activeClass: 'bg-cyan-50/80 border-cyan-500 text-cyan-900 ring-cyan-500/20' },
  { id: '7', name: 'Planificación', icon: Calendar, color: 'from-violet-500/20 to-fuchsia-500/20 border-violet-500/30 text-violet-600 dark:text-violet-400', activeClass: 'bg-violet-50/80 border-violet-500 text-violet-900 ring-violet-500/20' }
];

export default function StepArea() {
  const { selectedArea, setArea } = useConfiguratorStore();
  const { scripts } = useLibraryStore();

  return (
    <div className="bg-white border border-slate-200 dark:bg-slate-900/60 dark:border-slate-800/80 backdrop-blur-md rounded-2xl p-5 shadow-sm dark:shadow-xl transition-all duration-300">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-wala-600 text-xs font-bold text-white">1</span>
        Selecciona el Área WALA
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {AREAS.map((a) => {
          const Icon = a.icon;
          const isSelected = selectedArea === a.id;
          const count = scripts.filter((s) => s.config.area === a.id).length;
          
          return (
            <button
              key={a.id}
              onClick={() => setArea(a.id)}
              className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all duration-300 cursor-pointer ${
                isSelected 
                  ? `${a.activeClass} dark:bg-slate-800/90 dark:border-wala-500 dark:text-slate-100 ring-2 shadow-lg scale-[1.02]` 
                  : 'bg-slate-50/40 border-slate-200/70 hover:bg-slate-100/50 hover:border-slate-300 dark:bg-slate-950/40 dark:border-slate-800/50 dark:hover:bg-slate-800/40 dark:hover:border-slate-700/60'
              }`}
            >
              <div className={`p-2 rounded-lg bg-gradient-to-br ${a.color} border border-slate-200 dark:border-slate-800`}>
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className={`text-[10px] font-bold ${isSelected ? 'text-inherit opacity-85' : 'text-slate-400 dark:text-slate-500'}`}>ÁREA {a.id}</span>
                  {count > 0 && (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-wala-500/10 dark:bg-wala-500/20 text-wala-600 dark:text-wala-400 border border-wala-500/10 dark:border-wala-500/25 flex items-center gap-0.5" title={`${count} guiones guardados`}>
                      📂 {count}
                    </span>
                  )}
                </div>
                <div className={`text-sm font-semibold truncate ${isSelected ? 'text-inherit' : 'text-slate-700 dark:text-slate-200'}`}>{a.name}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
