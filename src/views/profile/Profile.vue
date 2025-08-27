<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
    <div class="max-w-2xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <div
          class="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <span class="text-2xl font-bold text-white">
            {{ user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U" }}
          </span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Mi Perfil</h1>
        <p class="text-gray-600">
          Gestiona tu información personal y preferencias
        </p>
      </div>

      <!-- Información del usuario -->
      <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Nombre completo
            </label>
            <input
              type="text"
              :value="user?.displayName || ''"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ingresa tu nombre completo"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Correo electrónico
            </label>
            <input
              type="email"
              :value="user?.email || ''"
              readonly
              class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+52 999 999 9999"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              País/Región
            </label>
            <select
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="MX">México</option>
              <option value="US">Estados Unidos</option>
              <option value="CA">Canadá</option>
            </select>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            class="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuth } from "@/composables/useAuth";

const { user } = useAuth();
</script>
