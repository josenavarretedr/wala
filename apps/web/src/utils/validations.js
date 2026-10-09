/**
 * Validation utilities for commercial dashboard forms
 */

export const validations = {
  /**
   * Valida nombre (min 3 chars, solo letras y espacios)
   */
  isValidName(name) {
    if (!name || typeof name !== 'string') return false
    const trimmed = name.trim()
    return trimmed.length >= 3 && /^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/.test(trimmed)
  },

  /**
   * Valida teléfono peruano (9 dígitos)
   */
  isValidPhone(phone) {
    if (!phone || typeof phone !== 'string') return false
    const cleaned = phone.replace(/\D/g, '')
    return cleaned.length === 9 && /^9\d{8}$/.test(cleaned)
  },

  /**
   * Valida fecha no en el futuro
   */
  isValidDate(dateStr) {
    if (!dateStr) return true // opcional
    const date = new Date(dateStr)
    return date <= new Date()
  },

  /**
   * Valida monto (número positivo)
   */
  isValidAmount(amount) {
    const num = Number(amount)
    return !isNaN(num) && num > 0
  },

  /**
   * Valida porcentaje (0-100)
   */
  isValidPercentage(percent) {
    const num = Number(percent)
    return !isNaN(num) && num >= 0 && num <= 100
  },

  /**
   * Limpia y formatea nombre
   */
  formatName(name) {
    return name
      .trim()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  },

  /**
   * Limpia teléfono (solo dígitos)
   */
  formatPhone(phone) {
    return phone.replace(/\D/g, '').slice(-9)
  },

  /**
   * Valida formulario de lead
   */
  validateLeadForm(data) {
    const errors = {}

    if (!validations.isValidName(data.name)) {
      errors.name = 'Nombre debe tener al menos 3 caracteres'
    }

    if (!validations.isValidPhone(data.phone)) {
      errors.phone = 'Teléfono debe ser 9 dígitos válidos'
    }

    if (!data.zona) {
      errors.zona = 'Zona es requerida'
    }

    if (!data.sector) {
      errors.sector = 'Sector es requerido'
    }

    return { isValid: Object.keys(errors).length === 0, errors }
  },

  /**
   * Valida formulario de visita
   */
  validateVisitForm(data) {
    const errors = {}

    if (!data.resultado) {
      errors.resultado = 'Resultado es requerido'
    }

    if (data.resultado === 'agendado' && !data.fechaAgendada) {
      errors.fechaAgendada = 'Fecha agendada es requerida'
    }

    if (data.resultado === 'agendado' && !validations.isValidDate(data.fechaAgendada)) {
      errors.fechaAgendada = 'Fecha no puede ser en el futuro'
    }

    return { isValid: Object.keys(errors).length === 0, errors }
  },

  /**
   * Valida formulario de diagnóstico
   */
  validateDiagnosticForm(data) {
    const errors = {}

    if (!data.resultado) {
      errors.resultado = 'Resultado es requerido'
    }

    if (data.montoEstimado && !validations.isValidAmount(data.montoEstimado)) {
      errors.montoEstimado = 'Monto debe ser un número positivo'
    }

    return { isValid: Object.keys(errors).length === 0, errors }
  },

  /**
   * Valida formulario de cierre
   */
  validateClosureForm(data) {
    const errors = {}

    if (!data.tipoCierre) {
      errors.tipoCierre = 'Tipo de cierre es requerido'
    }

    if (!data.fechaInicio) {
      errors.fechaInicio = 'Fecha de inicio es requerida'
    }

    if (data.fechaInicio && !validations.isValidDate(data.fechaInicio)) {
      errors.fechaInicio = 'Fecha no puede ser en el futuro'
    }

    if (!validations.isValidAmount(data.montoFinal)) {
      errors.montoFinal = 'Monto debe ser un número positivo'
    }

    return { isValid: Object.keys(errors).length === 0, errors }
  },

  /**
   * Valida metas semanales
   */
  validateMetas(metas) {
    const errors = {}

    if (!validations.isValidAmount(metas.visitasTarget)) {
      errors.visitasTarget = 'Debe ser un número positivo'
    }

    if (!validations.isValidAmount(metas.cierresTarget)) {
      errors.cierresTarget = 'Debe ser un número positivo'
    }

    if (!validations.isValidPercentage(metas.tasaAgendamientoMin)) {
      errors.tasaAgendamientoMin = 'Debe ser entre 0 y 100'
    }

    if (!validations.isValidPercentage(metas.tasaCierreMin)) {
      errors.tasaCierreMin = 'Debe ser entre 0 y 100'
    }

    if (!validations.isValidAmount(metas.cajaTarget)) {
      errors.cajaTarget = 'Debe ser un número positivo'
    }

    return { isValid: Object.keys(errors).length === 0, errors }
  }
}
