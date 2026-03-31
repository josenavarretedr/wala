<template>
  <div v-for="cycle in props.modelValue" :key="cycle.key" class="ciclo-section">
    <div class="ciclo-tab" :class="cycle.className">
      {{ cycle.title }}
      <span class="ciclo-dates">{{ cycle.subtitle }}</span>
    </div>

    <div class="ciclo-body">
      <div class="sesion-block">
        <div class="sesion-header">
          <div class="sesion-title">
            <span class="sesion-tag tag-educativa">Sesión educativa</span>
            <span class="sesion-name">{{ cycle.planSessionName }}</span>
          </div>
          <input v-model="cycle.planDate" class="sesion-date-input" type="date" />
        </div>

        <div class="sesion-content">
          <div class="field-block">
            <label>Resumen de explicación al emprendedor</label>
            <textarea
              v-model="cycle.educationSummary"
              placeholder="Describe cómo se explicó la relevancia de las áreas"
            />
          </div>
          <div class="field-block">
            <label>Acuerdos clave</label>
            <textarea
              v-model="cycle.agreements"
              placeholder="Acuerdos principales de la sesión"
            />
          </div>
        </div>

        <div class="plan-wrap">
          <div class="plan-title">Plan de acción — {{ cycle.title }}</div>
          <div class="plan-areas">
            <div
              v-for="(planArea, pIndex) in cycle.planAreas"
              :key="pIndex"
              class="plan-area"
            >
              <div class="plan-area-head" :class="cycle.className">Área {{ pIndex + 1 }}</div>
              <input
                v-model="planArea.areaName"
                class="plan-area-input"
                placeholder="Nombre del área"
              />
              <input v-model="planArea.action1" class="plan-area-input" placeholder="Acción 1" />
              <input v-model="planArea.action2" class="plan-area-input" placeholder="Acción 2" />
              <input v-model="planArea.action3" class="plan-area-input" placeholder="Acción 3" />
            </div>
          </div>
        </div>
      </div>

      <div class="sesion-block">
        <div class="sesion-header">
          <div class="sesion-title">
            <span class="sesion-tag tag-seguimiento">Sesión seguimiento</span>
            <span class="sesion-name">{{ cycle.followSessionName }}</span>
          </div>
          <input v-model="cycle.followDate" class="sesion-date-input" type="date" />
        </div>

        <div class="revision-wrap">
          <div class="plan-title">Revisión de acciones comprometidas</div>
          <table class="revision-table">
            <thead>
              <tr>
                <th>Acción</th>
                <th>Estado</th>
                <th>Observación</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in cycle.reviewRows" :key="idx">
                <td>
                  <input v-model="row.action" class="rev-input" placeholder="Acción" />
                </td>
                <td>
                  <select v-model="row.status" class="status-select">
                    <option value="">Seleccionar</option>
                    <option value="completed">Completada</option>
                    <option value="in_progress">En proceso</option>
                    <option value="not_done">No realizada</option>
                  </select>
                </td>
                <td>
                  <input
                    v-model="row.observation"
                    class="rev-input"
                    placeholder="Observación"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="sesion-content">
          <div class="field-block">
            <label>Conclusiones</label>
            <textarea
              v-model="cycle.conclusions"
              class="short"
              placeholder="Conclusiones de la sesión"
            />
          </div>
          <div class="field-block">
            <label>Compromisos siguientes</label>
            <textarea
              v-model="cycle.nextCommitments"
              class="short"
              placeholder="Compromisos para la siguiente sesión"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
  },
});
</script>
