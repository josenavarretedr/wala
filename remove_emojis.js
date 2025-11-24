const fs = require('fs');

// Leer el archivo
let content = fs.readFileSync('src/stores/AccountsBalanceApp/accountsBalanceStore.js', 'utf8');

// Eliminar TODOS los emojis y caracteres especiales
content = content.replace(/[\u{1F300}-\u{1F9FF}]/gu, ''); // Emojis
content = content.replace(/[\u{2600}-\u{26FF}]/gu, ''); // Símbolos

// Guardar
fs.writeFileSync('src/stores/AccountsBalanceApp/accountsBalanceStore.js', content, 'utf8');

console.log('✓ Emojis eliminados');
