<!-- 
  EJEMPLO DE USO - Autocomplete Components
  =========================================
  
  Este archivo muestra cómo usar ambos componentes de autocomplete
  en diferentes contextos de tu aplicación.
-->

<template>
  <div class="examples-container">
    <h1>Ejemplos de Uso - Autocomplete</h1>

    <!-- ============================================ -->
    <!-- EJEMPLO 1: SearchProductAsync (con Algolia) -->
    <!-- ============================================ -->
    <section class="example-section">
      <h2>📦 SearchProductAsync (Con Algolia)</h2>
      <p>Componente actual con Algolia, optimizado y con debounce</p>

      <div class="example-demo">
        <SearchProductAsync />
      </div>

      <details class="code-example">
        <summary>Ver código</summary>
        <pre><code>
&lt;script setup&gt;
import SearchProductAsync from '@/components/basicAccountingRecordsBook/SearchProductAsync.vue';
&lt;/script&gt;

&lt;template&gt;
  &lt;SearchProductAsync /&gt;
&lt;/template&gt;
        </code></pre>
      </details>
    </section>

    <!-- ============================================= -->
    <!-- EJEMPLO 2: AutocompleteLocal (sin Algolia)   -->
    <!-- ============================================= -->
    <section class="example-section">
      <h2>🎯 AutocompleteLocal (Sin Algolia)</h2>
      <p>Alternativa local con la misma funcionalidad</p>

      <div class="example-demo">
        <AutocompleteLocal
          placeholder="Buscar producto local..."
          :maxItems="5"
          :debounceMs="120"
        />
      </div>

      <details class="code-example">
        <summary>Ver código</summary>
        <pre><code>
&lt;script setup&gt;
import AutocompleteLocal from '@/components/basicAccountingRecordsBook/AutocompleteLocal.vue';
&lt;/script&gt;

&lt;template&gt;
  &lt;AutocompleteLocal
    placeholder="Buscar producto local..."
    :maxItems="5"
    :debounceMs="120"
  /&gt;
&lt;/template&gt;
        </code></pre>
      </details>
    </section>

    <!-- ============================================ -->
    <!-- EJEMPLO 3: Configuración Personalizada      -->
    <!-- ============================================ -->
    <section class="example-section">
      <h2>⚙️ Configuración Personalizada</h2>
      <p>AutocompleteLocal con diferentes settings</p>

      <div class="example-demo">
        <AutocompleteLocal
          placeholder="Búsqueda rápida (más items, menos delay)..."
          :maxItems="10"
          :debounceMs="50"
        />
      </div>

      <details class="code-example">
        <summary>Ver código</summary>
        <pre><code>
&lt;script setup&gt;
import AutocompleteLocal from '@/components/basicAccountingRecordsBook/AutocompleteLocal.vue';
&lt;/script&gt;

&lt;template&gt;
  &lt;AutocompleteLocal
    placeholder="Búsqueda rápida (más items, menos delay)..."
    :maxItems="10"
    :debounceMs="50"
  /&gt;
&lt;/template&gt;
        </code></pre>
      </details>
    </section>

    <!-- ============================================ -->
    <!-- EJEMPLO 4: Feature Flag / Conditional       -->
    <!-- ============================================ -->
    <section class="example-section">
      <h2>🚦 Con Feature Flag</h2>
      <p>Cambiar entre componentes según configuración</p>

      <div class="example-demo">
        <component :is="autocompleteComponent" />

        <button @click="toggleComponent" class="toggle-btn">
          Cambiar a {{ useLocal ? "Algolia" : "Local" }}
        </button>
      </div>

      <details class="code-example">
        <summary>Ver código</summary>
        <pre><code>
&lt;script setup&gt;
import { ref, computed } from 'vue';
import SearchProductAsync from '@/components/basicAccountingRecordsBook/SearchProductAsync.vue';
import AutocompleteLocal from '@/components/basicAccountingRecordsBook/AutocompleteLocal.vue';

const useLocal = ref(false);

const autocompleteComponent = computed(() =&gt; 
  useLocal.value ? AutocompleteLocal : SearchProductAsync
);

function toggleComponent() {
  useLocal.value = !useLocal.value;
}
&lt;/script&gt;

&lt;template&gt;
  &lt;component :is="autocompleteComponent" /&gt;
  
  &lt;button @click="toggleComponent"&gt;
    Cambiar a {{ useLocal ? 'Algolia' : 'Local' }}
  &lt;/button&gt;
&lt;/template&gt;
        </code></pre>
      </details>
    </section>

    <!-- ============================================ -->
    <!-- EJEMPLO 5: Con Environment Variable         -->
    <!-- ============================================ -->
    <section class="example-section">
      <h2>🌍 Con Variable de Entorno</h2>
      <p>Elegir componente según entorno (dev/prod)</p>

      <details class="code-example">
        <summary>Ver código</summary>
        <pre><code>
&lt;script setup&gt;
import SearchProductAsync from '@/components/basicAccountingRecordsBook/SearchProductAsync.vue';
import AutocompleteLocal from '@/components/basicAccountingRecordsBook/AutocompleteLocal.vue';

// En .env:
// VITE_USE_LOCAL_AUTOCOMPLETE=true  (para local)
// VITE_USE_LOCAL_AUTOCOMPLETE=false (para Algolia)

const component = import.meta.env.VITE_USE_LOCAL_AUTOCOMPLETE === 'true'
  ? AutocompleteLocal
  : SearchProductAsync;
&lt;/script&gt;

&lt;template&gt;
  &lt;component :is="component" /&gt;
&lt;/template&gt;
        </code></pre>
      </details>
    </section>

    <!-- ============================================ -->
    <!-- INFORMACIÓN TÉCNICA                         -->
    <!-- ============================================ -->
    <section class="info-section">
      <h2>ℹ️ Información Técnica</h2>

      <div class="info-grid">
        <div class="info-card">
          <h3>SearchProductAsync</h3>
          <ul>
            <li>✅ Usa Algolia Autocomplete</li>
            <li>✅ Índice precomputado</li>
            <li>✅ Debounce 120ms</li>
            <li>✅ Modo inline en móvil</li>
            <li>✅ onSelect nativo</li>
            <li>⚠️ Requiere @algolia/autocomplete-js</li>
          </ul>
        </div>

        <div class="info-card">
          <h3>AutocompleteLocal</h3>
          <ul>
            <li>✅ 100% Vue nativo</li>
            <li>✅ Índice precomputado</li>
            <li>✅ Debounce configurable</li>
            <li>✅ Props personalizables</li>
            <li>✅ Transiciones Vue</li>
            <li>✅ Sin dependencias externas</li>
          </ul>
        </div>
      </div>

      <div class="migration-tip">
        <strong>💡 Tip de Migración:</strong>
        <p>
          Ambos componentes tienen la misma API de salida (usan
          <code>transactionStore.modifyItemToAddInTransaction</code>). Puedes
          intercambiarlos sin cambios en el código que los consume.
        </p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import SearchProductAsync from "@/components/basicAccountingRecordsBook/SearchProductAsync.vue";
import AutocompleteLocal from "@/components/basicAccountingRecordsBook/AutocompleteLocal.vue";

// Estado para ejemplo 4
const useLocal = ref(false);

const autocompleteComponent = computed(() =>
  useLocal.value ? AutocompleteLocal : SearchProductAsync
);

function toggleComponent() {
  useLocal.value = !useLocal.value;
}
</script>

<style scoped>
.examples-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2rem;
  color: #111827;
}

.example-section {
  margin-bottom: 3rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.example-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.example-section p {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.example-demo {
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.code-example {
  margin-top: 1rem;
}

.code-example summary {
  cursor: pointer;
  padding: 0.75rem 1rem;
  background: #f3f4f6;
  border-radius: 6px;
  font-weight: 500;
  color: #374151;
  user-select: none;
}

.code-example summary:hover {
  background: #e5e7eb;
}

.code-example pre {
  margin-top: 0.5rem;
  padding: 1rem;
  background: #1f2937;
  border-radius: 6px;
  overflow-x: auto;
}

.code-example code {
  color: #e5e7eb;
  font-family: "Fira Code", "Courier New", monospace;
  font-size: 0.875rem;
  line-height: 1.5;
}

.toggle-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.toggle-btn:hover {
  background: #2563eb;
}

.info-section {
  margin-top: 3rem;
  padding: 2rem;
  background: #eff6ff;
  border-radius: 12px;
  border: 1px solid #bfdbfe;
}

.info-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #1e40af;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.info-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.info-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1f2937;
}

.info-card ul {
  list-style: none;
  padding: 0;
}

.info-card li {
  padding: 0.5rem 0;
  color: #4b5563;
  font-size: 0.875rem;
}

.migration-tip {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
}

.migration-tip strong {
  display: block;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.migration-tip p {
  color: #4b5563;
  margin: 0;
  line-height: 1.6;
}

.migration-tip code {
  background: #f3f4f6;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-family: "Courier New", monospace;
  font-size: 0.875rem;
  color: #dc2626;
}

@media (max-width: 768px) {
  .examples-container {
    padding: 1rem;
  }

  .example-section {
    padding: 1rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
