<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
    <div class="max-w-3xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Seguridad</h1>
        <p class="text-gray-600">
          Gestiona la seguridad de tu cuenta y contraseña
        </p>
      </div>

      <div class="space-y-8">
        <!-- Cambiar contraseña -->
        <div class="border border-gray-200 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            Cambiar contraseña
          </h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Contraseña actual
              </label>
              <input
                type="password"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ingresa tu contraseña actual"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Nueva contraseña
              </label>
              <input
                type="password"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ingresa tu nueva contraseña"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Confirmar nueva contraseña
              </label>
              <input
                type="password"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Confirma tu nueva contraseña"
              />
            </div>

            <button
              class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Actualizar contraseña
            </button>
          </div>
        </div>

        <!-- Autenticación de dos factores -->
        <div class="border border-gray-200 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            Autenticación de dos factores
          </h3>
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-medium text-gray-900">Activar 2FA</h4>
              <p class="text-sm text-gray-600">
                Agrega una capa extra de seguridad a tu cuenta
              </p>
            </div>
            <button
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Configurar
            </button>
          </div>
        </div>

        <!-- Sesiones activas -->
        <div class="border border-gray-200 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            Sesiones activas
          </h3>
          <div class="space-y-4">
            <div
              class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center space-x-3">
                <div
                  class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"
                >
                  <span class="text-green-600 text-sm">💻</span>
                </div>
                <div>
                  <h4 class="font-medium text-gray-900">Windows - Chrome</h4>
                  <p class="text-sm text-gray-600">
                    Sesión actual • IP: 192.168.1.1
                  </p>
                </div>
              </div>
              <span
                class="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full"
              >
                Activa
              </span>
            </div>

            <div class="flex items-center justify-between">
              <p class="text-sm text-gray-600">
                ¿Ves alguna actividad sospechosa?
              </p>
              <button
                class="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Cerrar todas las sesiones
              </button>
            </div>
          </div>
        </div>

        <!-- Exportar datos -->
        <div class="border border-gray-200 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            Exportar datos
          </h3>
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-medium text-gray-900">Descargar mis datos</h4>
              <p class="text-sm text-gray-600">
                Obtén una copia de todos tus datos almacenados
              </p>
            </div>
            <button
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Solicitar exportación
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Placeholder para lógica de seguridad
</script>
