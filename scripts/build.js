#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

console.log('🔨 Building CLI package...\n');

async function build() {
  try {
    // Clean dist directory
    const distDir = path.join(__dirname, '../dist');
    if (await fs.pathExists(distDir)) {
      await fs.remove(distDir);
      console.log('✅ Cleaned dist directory');
    }

    // Install dependencies if needed
    if (!await fs.pathExists(path.join(__dirname, '../node_modules'))) {
      console.log('📦 Installing dependencies...');
      execSync('npm install', { stdio: 'inherit' });
    }

    // Build with tsup
    console.log('🔨 Building with tsup...');
    execSync('npm run build', { stdio: 'inherit' });

    // Verify build output
    const cliPath = path.join(distDir, 'cli.js');
    if (await fs.pathExists(cliPath)) {
      console.log('✅ CLI built successfully');
      
      // Make CLI executable
      await fs.chmod(cliPath, 0o755);
      console.log('✅ Made CLI executable');
      
      // Show file size
      const stats = await fs.stat(cliPath);
      console.log(`📊 CLI size: ${(stats.size / 1024).toFixed(2)} KB`);
    } else {
      throw new Error('CLI file not found after build');
    }

    console.log('\n🎉 Build completed successfully!');
    console.log('\nTo test the CLI:');
    console.log('1. In a test project: npx . --dry-run');
    console.log('2. Or run: node scripts/test-cli.js');

  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

build();
