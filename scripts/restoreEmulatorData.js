const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const COMMIT = '77f55ee~1';

const EXPORTS = {
  main: {
    source: 'firebase-export-1780816587447lMhX6J',
    description: 'Base principal con usuarios (Luis, Sofia, Rosa, Jose / josenavarretedr@gmail.com) y datos completos (621 KB)',
  },
  cooperativas: {
    source: 'firebase-export-1788242084847KcZQQH',
    description: 'Base de cooperativas con usuario panda.otter (297 KB)',
  },
};

function extractExport(gitRef, srcFolder, targetDir) {
  console.log(`\nExtrayendo ${srcFolder} hacia ${targetDir}...`);
  const fileList = execSync(`git ls-tree -r --name-only ${gitRef} ${srcFolder}`)
    .toString()
    .trim()
    .split(/\r?\n/);

  for (const gitPath of fileList) {
    if (!gitPath) continue;
    const relPath = gitPath.substring(srcFolder.length + 1);
    const destPath = path.join(targetDir, relPath);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    const content = execSync(`git show ${gitRef}:${gitPath}`, { maxBuffer: 50 * 1024 * 1024 });
    fs.writeFileSync(destPath, content);
    console.log(`  - ${relPath} (${content.length} bytes)`);
  }
}

const target = process.argv[2] || 'main';

if (target === 'all') {
  // Guarda una copia de respaldo persistente para que nunca se pierda
  extractExport(COMMIT, EXPORTS.main.source, path.join(rootDir, 'emulator-data-seeds', 'main'));
  extractExport(COMMIT, EXPORTS.cooperativas.source, path.join(rootDir, 'emulator-data-seeds', 'cooperativas'));
  // Restaura el principal a emulator-data
  extractExport(COMMIT, EXPORTS.main.source, path.join(rootDir, 'emulator-data'));
  console.log('\nRestauración completada con éxito.');
} else if (EXPORTS[target]) {
  extractExport(COMMIT, EXPORTS[target].source, path.join(rootDir, 'emulator-data'));
  console.log(`\nRestauración de '${target}' a emulator-data completada con éxito.`);
} else {
  console.error(`Opción desconocida: ${target}. Usa 'main', 'cooperativas' o 'all'.`);
  process.exit(1);
}
