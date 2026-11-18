import { spawn } from 'child_process';
import path from 'path';

console.log('\x1b[36m%s\x1b[0m', '=====================================================');
console.log('\x1b[36m%s\x1b[0m', '    TALENTASSESS ENTERPRISE™ SHOWCASE DEV SERVER     ');
console.log('\x1b[36m%s\x1b[0m', '=====================================================');
console.log('\x1b[32m%s\x1b[0m', '🚀 Starting Fastify Backend (Port 4000)...');
console.log('\x1b[32m%s\x1b[0m', '✨ Starting Vite Frontend (Port 5173)...');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

// 1. Spawn Server
const serverProcess = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.resolve('./server'),
  stdio: 'inherit',
  shell: true,
});

// 2. Spawn Client
const clientProcess = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.resolve('./client'),
  stdio: 'inherit',
  shell: true,
});

function cleanup() {
  console.log('\n🛑 Stopping servers...');
  serverProcess.kill();
  clientProcess.kill();
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
