<template>
  <div class="max-w-4xl mx-auto">
    <!-- Bienvenida -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">
        Bienvenido a {{ business?.nombre }}
      </h1>
      <p class="text-gray-600 text-lg">
        {{ getBusinessTypeDisplay(business?.tipo) }}
      </p>
    </div>

    <!-- Resumen estadístico -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <!-- Ingresos del día -->
      <div class="bg-green-50 border border-green-200 rounded-2xl p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-green-600 text-sm font-medium">Ingresos del día</p>
            <p class="text-2xl font-bold text-green-800">S/ 1,245.50</p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <span class="text-2xl">💰</span>
          </div>
        </div>
      </div>

      <!-- Egresos del día -->
      <div class="bg-red-50 border border-red-200 rounded-2xl p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-red-600 text-sm font-medium">Egresos del día</p>
            <p class="text-2xl font-bold text-red-800">S/ 345.20</p>
          </div>
          <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <span class="text-2xl">💸</span>
          </div>
        </div>
      </div>

      <!-- Balance -->
      <div class="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-blue-600 text-sm font-medium">Balance del día</p>
            <p class="text-2xl font-bold text-blue-800">S/ 900.30</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <span class="text-2xl">📊</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Acciones rápidas -->
    <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
      <h2 class="text-2xl font-semibold text-gray-800 mb-6">Acciones Rápidas</h2>
      
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <!-- Registrar Ingreso -->
        <router-link
          v-if="hasPermission('crearMovimientos')"
          :to="`/business/${businessId}/income`"
          class="flex flex-col items-center p-6 bg-green-50 hover:bg-green-100 rounded-xl transition-colors border border-green-200"
        >
          <div class="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mb-4">
            <span class="text-2xl text-white">💰</span>
          </div>
          <span class="text-green-700 font-medium">Registrar Ingreso</span>
        </router-link>

        <!-- Registrar Egreso -->
        <router-link
          v-if="hasPermission('crearMovimientos')"
          :to="`/business/${businessId}/expenses`"
          class="flex flex-col items-center p-6 bg-red-50 hover:bg-red-100 rounded-xl transition-colors border border-red-200"
        >
          <div class="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center mb-4">
            <span class="text-2xl text-white">💸</span>
          </div>
          <span class="text-red-700 font-medium">Registrar Egreso</span>
        </router-link>

        <!-- Ver Reportes -->
        <router-link
          v-if="hasPermission('verReportes')"
          :to="`/business/${businessId}/reports`"
          class="flex flex-col items-center p-6 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors border border-purple-200"
        >
          <div class="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mb-4">
            <span class="text-2xl text-white">📈</span>
          </div>
          <span class="text-purple-700 font-medium">Ver Reportes</span>
        </router-link>

        <!-- Gestión (Solo Gerentes) -->
        <router-link
          v-if="isManager"
          :to="`/business/${businessId}/employees`"
          class="flex flex-col items-center p-6 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors border border-indigo-200"
        >
          <div class="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center mb-4">
            <span class="text-2xl text-white">👥</span>
          </div>
          <span class="text-indigo-700 font-medium">Gestionar Empleados</span>
        </router-link>
      </div>
    </div>

    <!-- Información del usuario (Solo para demo) -->
    <div class="mt-8 bg-gray-50 border border-gray-200 rounded-2xl p-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">Tu Perfil</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <span class="text-gray-600">Nombre:</span>
          <span class="ml-2 font-medium">{{ userProfile?.nombre }} {{ userProfile?.apellidos }}</span>
        </div>
        <div>
          <span class="text-gray-600">Rol:</span>
          <span class="ml-2 font-medium">{{ getRoleDisplay(userProfile?.rol) }}</span>
        </div>
        <div>
          <span class="text-gray-600">Departamento:</span>
          <span class="ml-2 font-medium">{{ userProfile?.departamento || 'No asignado' }}</span>
        </div>
        <div>
          <span class="text-gray-600">Negocio ID:</span>
          <span class="ml-2 font-medium text-blue-600">{{ userProfile?.businessId }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/useUserStore'
import { useBusinessStore } from '@/stores/businessStore'

const route = useRoute()
const userStore = useUserStore()
const businessStore = useBusinessStore()

// Computed properties
const userProfile = computed(() => userStore.userProfile)
const business = computed(() => businessStore.business)
const businessId = computed(() => route.params.businessId)
const isManager = computed(() => userProfile.value?.rol === 'gerente')

// Métodos
const hasPermission = (permission) => {
  if (isManager.value) return true // Los gerentes tienen todos los permisos
  return userProfile.value?.permissions?.[permission] || false
}

const getRoleDisplay = (role) => {
  const roles = {
    'gerente': '👨‍💼 Gerente',
    'empleado': '👤 Empleado'
  }
  return roles[role] || '👤 Usuario'
}

const getBusinessTypeDisplay = (type) => {
  const types = {
    'restaurante': '🍽️ Restaurante',
    'tienda': '🛍️ Tienda',
    'farmacia': '💊 Farmacia',
    'panaderia': '🥖 Panadería',
    'ferreteria': '🔧 Ferretería',
    'salon': '💄 Salón',
    'consultorio': '🏥 Consultorio',
    'taller': '🔧 Taller',
    'otro': '📦 Negocio'
  }
  return types[type] || '📦 Negocio'
}
</script>
