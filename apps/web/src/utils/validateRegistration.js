// Script de validación para el nuevo sistema de registro
// Ejecutar en la consola del navegador

console.log('🧪 VALIDACIÓN DEL SISTEMA DE REGISTRO');
console.log('=====================================');

// Verificar que los métodos existen
const validateRegistration = () => {
  try {
    // Verificar stores
    const { useAuthStore } = window.__stores__ || {};
    const { useUserStore } = window.__stores__ || {};

    console.log('🔍 Verificando disponibilidad de stores...');

    // Esta función se ejecutará cuando las stores estén disponibles
    if (typeof useAuthStore === 'function' && typeof useUserStore === 'function') {
      const authStore = useAuthStore();
      const userStore = useUserStore();

      // Verificar métodos del authStore
      console.log('📋 Métodos disponibles en authStore:');
      console.log('  - login:', typeof authStore.login);
      console.log('  - register:', typeof authStore.register);
      console.log('  - logout:', typeof authStore.logout);
      console.log('  - checkUser:', typeof authStore.checkUser);
      console.log('  - restoreSession:', typeof authStore.restoreSession);

      // Verificar métodos del userStore
      console.log('📋 Métodos disponibles en userStore:');
      console.log('  - loadUserProfile:', typeof userStore.loadUserProfile);
      console.log('  - createUserProfile:', typeof userStore.createUserProfile);
      console.log('  - loadUserBusinesses:', typeof userStore.loadUserBusinesses);
      console.log('  - switchBusiness:', typeof userStore.switchBusiness);

      // Verificar estado inicial
      console.log('📊 Estado inicial:');
      console.log('  - isAuthenticated:', authStore.isAuthenticated);
      console.log('  - user:', authStore.user);
      console.log('  - userBusinesses:', userStore.userBusinesses?.length || 0);

      if (typeof authStore.register === 'function') {
        console.log('✅ Sistema de registro correctamente implementado');
        return true;
      } else {
        console.log('❌ Método register no encontrado en authStore');
        return false;
      }
    } else {
      console.log('⏳ Stores aún no disponibles, reintentando...');
      setTimeout(validateRegistration, 1000);
      return false;
    }
  } catch (error) {
    console.error('❌ Error en validación:', error);
    return false;
  }
};

// Función para probar el flujo de registro (sin ejecutar)
const testRegistrationFlow = () => {
  console.log('');
  console.log('🧪 FLUJO DE REGISTRO ESPERADO:');
  console.log('1. Usuario llena formulario en /register');
  console.log('2. authStore.register(email, password, name)');
  console.log('3. Firebase Auth crea usuario');
  console.log('4. userStore.createUserProfile(userData)');
  console.log('5. Firestore almacena perfil de usuario');
  console.log('6. Redirección a /onboarding');
  console.log('7. Usuario crea su primer negocio');
  console.log('8. Redirección al dashboard del negocio');
  console.log('');
  console.log('🔗 Rutas involucradas:');
  console.log('  - /register → formulario de registro');
  console.log('  - /onboarding → crear primer negocio');
  console.log('  - /business/{id}/dashboard → dashboard del negocio');
};

// Función para mostrar datos de prueba
const showTestData = () => {
  console.log('');
  console.log('🧪 DATOS DE PRUEBA RECOMENDADOS:');
  console.log('Nombre: Test User');
  console.log('Email: test@walla.app');
  console.log('Password: Test123!');
  console.log('');
  console.log('💡 Para probar:');
  console.log('1. Ve a http://localhost:5174/register');
  console.log('2. Llena el formulario con los datos de prueba');
  console.log('3. Haz click en "Registrarse"');
  console.log('4. Verifica que te redirija a /onboarding');
};

// Ejecutar validaciones
validateRegistration();
testRegistrationFlow();
showTestData();

// Hacer funciones disponibles globalmente
window.validateRegistration = validateRegistration;
window.testRegistrationFlow = testRegistrationFlow;
window.showTestData = showTestData;

console.log('');
console.log('📋 FUNCIONES DISPONIBLES:');
console.log('- validateRegistration() - Verificar implementación');
console.log('- testRegistrationFlow() - Mostrar flujo esperado');
console.log('- showTestData() - Datos de prueba');
