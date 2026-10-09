import { computed } from 'vue'
import { useUserStore } from '@/stores/useUserStore'

/**
 * Composable to check user profile completion status (required for trial activation)
 */
export function useProfileCompletion() {
  const userStore = useUserStore()

  // Get current user profile
  const profile = computed(() => userStore.userProfile)

  // Fields and their values
  const name = computed(() => profile.value?.profile?.name || profile.value?.nombre || '')
  const lastName = computed(() => profile.value?.profile?.lastName || profile.value?.apellidos || '')
  const phone = computed(() => profile.value?.profile?.phone || '')
  const email = computed(() => profile.value?.email || '')

  // Specific validation checks
  const isNameValid = computed(() => name.value.trim().length >= 2)
  const isLastNameValid = computed(() => lastName.value.trim().length >= 2)
  const isEmailValid = computed(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email.value)
  })
  const isPhoneValid = computed(() => {
    // Basic phone validation: digits, spaces, hyphens, optional plus, length between 5 and 15
    const cleanPhone = phone.value.replace(/[\s-]/g, '')
    const phoneRegex = /^\+?\d{5,15}$/
    return phoneRegex.test(cleanPhone)
  })

  // List of fields to check for overall completion
  const checkFields = computed(() => [
    { name: 'name', label: 'Nombre', isValid: isNameValid.value, value: name.value },
    { name: 'lastName', label: 'Apellido', isValid: isLastNameValid.value, value: lastName.value },
    { name: 'email', label: 'Correo', isValid: isEmailValid.value, value: email.value },
    { name: 'phone', label: 'Teléfono', isValid: isPhoneValid.value, value: phone.value }
  ])

  // Overall complete flag
  const isProfileComplete = computed(() => {
    return isNameValid.value && isLastNameValid.value && isEmailValid.value && isPhoneValid.value
  })

  // Missing fields for display
  const missingFields = computed(() => {
    return checkFields.value
      .filter(field => !field.isValid)
      .map(field => field.label)
  })

  // Profile completion percentage
  const completionPercentage = computed(() => {
    const validCount = checkFields.value.filter(field => field.isValid).length
    return Math.round((validCount / checkFields.value.length) * 100)
  })

  return {
    isProfileComplete,
    missingFields,
    completionPercentage,
    checkFields,
    isNameValid,
    isLastNameValid,
    isEmailValid,
    isPhoneValid,
    phone,
    name,
    lastName,
    email
  }
}
