#!/usr/bin/env node

/**
 * Wrapper para ejecutar el script seed-data según la plataforma
 * Permite interacción con el usuario (stdin/stdout)
 */

const { spawn } = require('child_process');
const path = require('path');

const isWindows = process.platform === 'win32';
const scriptPath = path.join(__dirname, isWindows ? 'seed-data.ps1' : 'seed-data.sh');
const command = isWindows ? 'pwsh' : 'bash';
const args = isWindows ? ['-File', scriptPath] : [scriptPath];

// Ejecutar el script con stdio heredado (permite interacción)
const child = spawn(command, args, {
  stdio: 'inherit',
  shell: true,
  cwd: path.join(__dirname, '..')
});

child.on('exit', (code) => {
  process.exit(code || 0);
});

child.on('error', (err) => {
  console.error('Error ejecutando el script:', err);
  process.exit(1);
});
