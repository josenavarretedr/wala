import React, { useState } from 'react';
import { useLibraryStore } from '../../store/libraryStore';
import { useToastStore } from '../../store/toastStore';
import ScriptCard from './ScriptCard';
import { FolderHeart, Search, Filter } from 'lucide-react';

export default function ScriptLibrary() {
  const { scripts, removeScript } = useLibraryStore();
  const { addToast } = useToastStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFunnel, setFilterFunnel] = useState('ALL');

  const handleRemove = (id) => {
    removeScript(id);
    addToast('Guión eliminado con éxito de la biblioteca local.', 'warning');
  };

  const filtered = scripts.filter((s) => {
    const matchSearch = 
      s.config.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.config.indicador.includes(searchTerm) ||
      s.script.guion.toLowerCase().includes(searchTerm.toLowerCase());

    const matchFunnel = filterFunnel === 'ALL' || s.config.funnel === filterFunnel;

    return matchSearch && matchFunnel;
  });

  return (
    <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border border-slate-800/80 shadow-xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
          <FolderHeart className="text-wala-400" size={20} />
          Biblioteca de Guiones Guardados
          <span className="text-xs font-normal text-slate-400 px-2 py-0.5 bg-slate-950 rounded border border-slate-800">
            {scripts.length} totales
          </span>
        </h3>

        {/* Controles de Búsqueda y Filtro */}
        {scripts.length > 0 && (
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-500" size={14} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar guión o sector..."
                className="bg-slate-950/60 border border-slate-850 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-wala-500"
              />
            </div>

            <div className="flex items-center gap-1">
              <Filter className="text-slate-500" size={12} />
              <select
                value={filterFunnel}
                onChange={(e) => setFilterFunnel(e.target.value)}
                className="bg-slate-950/60 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-wala-500 font-bold"
              >
                <option value="ALL">Todos los funnels</option>
                <option value="TOFU">TOFU</option>
                <option value="MOFU-A">MOFU-A</option>
                <option value="MOFU-B">MOFU-B</option>
                <option value="BOFU">BOFU</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {scripts.length === 0 ? (
        <div className="text-center py-10 text-slate-500 italic text-sm">
          No hay guiones guardados en la biblioteca todavía. Completa la configuración y guarda un guión válido.
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-slate-500 italic text-sm">
          No se encontraron guiones que coincidan con la búsqueda o filtro aplicados.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((entry) => (
            <ScriptCard
              key={entry.id}
              entry={entry}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}
