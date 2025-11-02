#!/usr/bin/env node

/**
 * Wrapper para ejecutar el script reset-db según la plataforma
 * Permite interacción con el usuario (stdin/stdout)
 */

const { spawn } = require('child_process');
const path = require('path');
const readline = require('readline');

const isWindows = process.platform === 'win32';

// Función para pedir confirmación
async function askConfirmation() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    console.log('\x1b[31m ADVERTENCIA: Este script eliminará TODOS los datos de la base de datos\x1b[0m');
    console.log('');
    rl.question('¿Estás seguro de que deseas continuar? (escribe \'SI\' para confirmar): ', (answer) => {
      rl.close();
      resolve(answer === 'SI');
    });
  });
}

// Función principal
async function main() {
  // Pedir confirmación antes de ejecutar
  const confirmed = await askConfirmation();
  
  if (!confirmed) {
    console.log('\x1b[33m Operación cancelada\x1b[0m');
    process.exit(0);
  }

  const scriptPath = path.join(__dirname, isWindows ? 'reset-db.ps1' : 'reset-db.sh');
  const command = isWindows ? 'pwsh' : 'bash';
  const args = isWindows ? ['-File', scriptPath, '-Force'] : [scriptPath, '--force'];

  // Ejecutar el script con stdio heredado
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: false,
    cwd: path.join(__dirname, '..')
  });

  child.on('exit', (code) => {
    process.exit(code || 0);
  });

  child.on('error', (err) => {
    console.error('Error ejecutando el script:', err);
    process.exit(1);
  });
}

main();
