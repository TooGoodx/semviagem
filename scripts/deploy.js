#!/usr/bin/env node
import { execSync } from 'child_process';

console.log('🔨 Fazendo build...');
execSync('npm run build', { stdio: 'inherit' });

console.log('🚀 Fazendo deploy...');
execSync('netlify deploy --prod --dir=dist', { stdio: 'inherit' });

console.log('✅ Deploy concluído!');
console.log('🌐 Site: https://extraordinary-starship-9103ce.netlify.app');
