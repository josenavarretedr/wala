import React, { useState } from 'react';
import { useLibraryStore } from '../../store/libraryStore';
import { useToastStore } from '../../store/toastStore';
import { useConfiguratorStore } from '../../store/configuratorStore';
import ScriptCard from './ScriptCard';
import { FolderHeart, Search, Filter, ArrowUpDown, Sparkles } from 'lucide-react';

export default function ScriptLibrary() {
  const { scripts, removeScript } = useLibraryStore();
  const { addToast } = useToastStore();
  const activeConfig = useConfiguratorStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterFunnel, setFilterFunnel] = useState('ALL');
  const [filterArea, setFilterArea] = useState('ALL');
  const [filterRuta, setFilterRuta] = useState('ALL');
  const [filterVoz, setFilterVoz] = useState('ALL');
  const [onlyRelated, setOnlyRelated] = useState(false);
  const [sortBy, setSortBy] = useState('DATE_DESC');

  const handleRemove = async (id) => {
    try {
      addToast('Eliminando guión...', 'info');
      await removeScript(id);
      addToast('Guión eliminado con éxito de Firestore.', 'warning');
    } catch (err) {
      console.error(err);
      addToast('Error al eliminar el guión de la nube.', 'error');
    }
  };

  // Calcular score de parentesco de un guión con la configuración activa
  const getParentescoScore = (s) => {
    let score = 0;
    let activeParams = 0;
    if (activeConfig.selectedArea) {
      activeParams++;
      if (activeConfig.selectedArea === s.config.area) score++;
    }
    if (activeConfig.selectedIndicador) {
      activeParams++;
      if (activeConfig.selectedIndicador === s.config.indicador) score++;
    }
    if (activeConfig.selectedNivel) {
      activeParams++;
      if (activeConfig.selectedNivel === s.config.nivel) score++;
    }
    if (activeConfig.selectedFunnel) {
      activeParams++;
      if (activeConfig.selectedFunnel === s.config.funnel) score++;
    }
    if (activeConfig.selectedRuta) {
      activeParams++;
      if (activeConfig.selectedRuta === s.config.ruta) score++;
    }
    if (activeConfig.selectedVoz) {
      activeParams++;
      if (activeConfig.selectedVoz === s.config.voz) score++;
    }
    return { score, activeParams };
  };

  const filtered = scripts.filter((s) => {
    const matchSearch = 
      s.config.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.config.indicador.includes(searchTerm) ||
      s.script.guion.toLowerCase().includes(searchTerm.toLowerCase());

    const matchFunnel = filterFunnel === 'ALL' || s.config.funnel === filterFunnel;
    const matchArea = filterArea === 'ALL' || s.config.area === filterArea;
    const matchRuta = filterRuta === 'ALL' || s.config.ruta === filterRuta;
    const matchVoz = filterVoz === 'ALL' || s.config.voz === filterVoz;

    let matchRelated = true;
    if (onlyRelated) {
      const { score, activeParams } = getParentescoScore(s);
      matchRelated = activeParams > 0 && score > 0;
    }

    return matchSearch && matchFunnel && matchArea && matchRuta && matchVoz && matchRelated;
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'DATE_ASC':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'SECTOR_ASC':
        return a.config.sector.localeCompare(b.config.sector);
      case 'PARENTESCO_DESC':
        const scoreA = getParentescoScore(a).score;
        const scoreB = getParentescoScore(b).score;
        if (scoreA === scoreB) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return scoreB - scoreA;
      case 'DATE_DESC':
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  const activeSelectionsCount = [
    activeConfig.selectedArea, activeConfig.selectedIndicador, activeConfig.selectedNivel,
    activeConfig.selectedFunnel, activeConfig.selectedRuta, activeConfig.selectedVoz
  ].filter(Boolean).length;

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
      </div>

      {/* Controles de Búsqueda y Filtros */}
      {scripts.length > 0 && (
        <div className="space-y-4">
          {/* Fila principal */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-850">
            
            {/* Buscador */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 text-slate-500" size={14} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar guión, sector, indicador..."
                className="w-full bg-slate-950/60 border border-slate-850 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-wala-500 font-medium"
              />
            </div>

            {/* Ordenamiento */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="text-slate-500" size={14} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-950/60 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-wala-500 font-bold"
              >
                <option value="DATE_DESC">Más recientes primero</option>
                <option value="DATE_ASC">Más antiguos primero</option>
                <option value="PARENTESCO_DESC">Por Relevancia (Parentesco)</option>
                <option value="SECTOR_ASC">Por Sector (A-Z)</option>
              </select>
            </div>

            {/* Interruptor de Relacionados */}
            {activeSelectionsCount > 0 && (
              <label className="flex items-center gap-2 cursor-pointer select-none py-1.5 px-3 bg-wala-500/10 dark:bg-wala-500/5 hover:bg-wala-500/15 border border-wala-500/20 rounded-lg transition-all">
                <input
                  type="checkbox"
                  checked={onlyRelated}
                  onChange={(e) => setOnlyRelated(e.target.checked)}
                  className="rounded text-wala-500 focus:ring-wala-500/20 border-slate-850 bg-slate-950 cursor-pointer h-3.5 w-3.5"
                />
                <span className="text-xs font-extrabold text-wala-600 dark:text-wala-400 flex items-center gap-1">
                  <Sparkles size={12} className="animate-pulse text-wala-500" />
                  Sólo relacionados
                </span>
              </label>
            )}
          </div>

          {/* Fila secundaria: selectores de filtro */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-slate-950/20 rounded-xl border border-slate-850/50">
            
            {/* Filtro Área */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-450 block">Filtrar por Área</span>
              <select
                value={filterArea}
                onChange={(e) => setFilterArea(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-350 focus:outline-none focus:border-wala-500 font-semibold"
              >
                <option value="ALL">Todas las áreas</option>
                <option value="1">Área 1: Negocios</option>
                <option value="2">Área 2: Marketing</option>
                <option value="3">Área 3: Compras</option>
                <option value="4">Área 4: Stock</option>
                <option value="5">Área 5: Costeo</option>
                <option value="6">Área 6: Registros</option>
                <option value="7">Área 7: Planificación</option>
              </select>
            </div>

            {/* Filtro Funnel */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-450 block">Filtrar por Funnel</span>
              <select
                value={filterFunnel}
                onChange={(e) => setFilterFunnel(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-350 focus:outline-none focus:border-wala-500 font-semibold"
              >
                <option value="ALL">Todos los funnels</option>
                <option value="TOFU">TOFU (Atracción)</option>
                <option value="MOFU-A">MOFU-A (Consideración)</option>
                <option value="MOFU-B">MOFU-B (Activación)</option>
                <option value="BOFU">BOFU (Conversión)</option>
              </select>
            </div>

            {/* Filtro Ruta */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-450 block">Filtrar por Ruta</span>
              <select
                value={filterRuta}
                onChange={(e) => setFilterRuta(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-350 focus:outline-none focus:border-wala-500 font-semibold"
              >
                <option value="ALL">Todas las rutas</option>
                <option value="Diagnostico">Diagnóstico</option>
                <option value="Contraste">Contraste</option>
                <option value="Revelacion">Revelación</option>
                <option value="Activacion">Activación</option>
              </select>
            </div>

            {/* Filtro Voz */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-450 block">Filtrar por Voz</span>
              <select
                value={filterVoz}
                onChange={(e) => setFilterVoz(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-350 focus:outline-none focus:border-wala-500 font-semibold"
              >
                <option value="ALL">Todas las voces</option>
                <option value="Jose">José (Voz A)</option>
                <option value="WALA">WALA (Voz B)</option>
              </select>
            </div>

          </div>
        </div>
      )}

      {scripts.length === 0 ? (
        <div className="text-center py-10 text-slate-500 italic text-sm">
          No hay guiones guardados en la biblioteca todavía. Completa la configuración y guarda un guión válido.
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-10 text-slate-500 italic text-sm bg-slate-950/20 rounded-xl border border-dashed border-slate-850">
          No se encontraron guiones que coincidan con la búsqueda o filtros aplicados.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sorted.map((entry) => (
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
