/**
 * Templates de actividades para la etapa CAPACITACIÓN / FORMACIÓN
 * Solo campo de asistencia
 */

export const capacitacionTemplates = [
  {
    id: 'capacitacion_asistencia',
    name: 'Registro de asistencia',
    description: 'Registro simple de asistencia a la sesión de capacitación',
    suggestedStage: 'Capacitación / Formación',
    fields: [
      {
        id: 'field_asistencia',
        type: 'attendance',
        title: 'Asistencia',
        description: '',
        required: false,
        order: 0,
      },
    ],
  },
]
