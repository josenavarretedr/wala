import { create } from 'zustand';

export const useConfiguratorStore = create((set, get) => ({
  // Selecciones del usuario
  selectedArea: null,       // "1" (número como string)
  selectedIndicador: null,  // "1.1"
  selectedNivel: null,      // "0_1"
  selectedFunnel: null,     // "TOFU" | "MOFU-A" | "MOFU-B" | "BOFU"
  selectedRuta: null,       // "Revelacion" | "Contraste" | "Diagnostico" | "Activacion"
  selectedVoz: null,        // "Jose" | "WALA"
  sector: '',               // texto libre

  // Output generado
  generatedScript: null,    // objeto JSON con guion y metadatos
  isGenerating: false,
  validationResults: null,

  // Acciones
  setArea: (area) => set({
    selectedArea: area,
    selectedIndicador: null,  // reset en cascada
    selectedNivel: null,
    selectedFunnel: null,
    selectedRuta: null,
    selectedVoz: null,
    generatedScript: null,
    validationResults: null
  }),

  setIndicador: (ind) => set({ 
    selectedIndicador: ind, 
    selectedNivel: null,
    selectedFunnel: null,
    selectedRuta: null,
    selectedVoz: null,
    generatedScript: null,
    validationResults: null
  }),
  
  setNivel: (nivel) => set({ 
    selectedNivel: nivel,
    selectedFunnel: null,
    selectedRuta: null,
    selectedVoz: null,
    generatedScript: null,
    validationResults: null
  }),

  setFunnel: (funnel) => {
    // Si es BOFU o MOFU-A, la voz de José se selecciona automáticamente
    let defaultVoz = null;
    if (funnel === 'BOFU' || funnel === 'MOFU-A') {
      defaultVoz = 'Jose';
    }
    
    set({
      selectedFunnel: funnel,
      selectedRuta: null,  // reset porque las rutas cambian por funnel
      selectedVoz: defaultVoz,
      generatedScript: null,
      validationResults: null
    });
  },

  setRuta: (ruta) => set({ selectedRuta: ruta, generatedScript: null, validationResults: null }),
  setVoz: (voz) => set({ selectedVoz: voz, generatedScript: null, validationResults: null }),
  setSector: (s) => set({ sector: s }),
  setGenerating: (v) => set({ isGenerating: v }),
  setGeneratedScript: (script) => set({ generatedScript: script }),
  setValidation: (v) => set({ validationResults: v }),

  // Reseteo completo
  resetAll: () => set({
    selectedArea: null, 
    selectedIndicador: null, 
    selectedNivel: null,
    selectedFunnel: null, 
    selectedRuta: null, 
    selectedVoz: null,
    sector: '', 
    generatedScript: null, 
    validationResults: null,
    isGenerating: false
  }),

  // Verifica si el form está completo para habilitar el botón generar
  isReadyToGenerate: () => {
    const s = get();
    return !!(
      s.selectedArea && 
      s.selectedIndicador && 
      s.selectedNivel &&
      s.selectedFunnel && 
      s.selectedRuta && 
      s.selectedVoz && 
      s.sector && 
      s.sector.trim().length > 0
    );
  }
}));
