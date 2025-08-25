#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

console.log('🚀 Publishing CLI package...\n');

async function publish() {
  try {
    // Check if we're in the right directory
    const packageJsonPath = path.join(__dirname, '../package.json');
    if (!await fs.pathExists(packageJsonPath)) {
      throw new Error('package.json not found. Run this from the project root.');
    }

    // Check if dist directory exists
    const distDir = path.join(__dirname, '../dist');
    if (!await fs.pathExists(distDir)) {
      console.log('📦 Building package first...');
      execSync('npm run build:cli', { stdio: 'inherit' });
    }

    // Check if CLI file exists
    const cliPath = path.join(distDir, 'cli.js');
    if (!await fs.pathExists(cliPath)) {
      throw new Error('CLI not built. Run npm run build:cli first.');
    }

    // Check if we're logged into npm
    try {
      execSync('npm whoami', { stdio: 'pipe' });
    } catch (error) {
      throw new Error('Not logged into npm. Run npm login first.');
    }

    // Check git status
    try {
      const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
      if (gitStatus.trim()) {
        console.log('⚠️  Uncommitted changes detected:');
        console.log(gitStatus);
        console.log('\nPlease commit or stash changes before publishing.');
        process.exit(1);
      }
    } catch (error) {
      console.log('⚠️  Could not check git status. Continuing...');
    }

    // Show what will be published
    console.log('📋 Package contents:');
    execSync('npm pack --dry-run', { stdio: 'inherit' });

    // Confirm publish
    console.log('\n🤔 Ready to publish? (y/N)');
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    
    process.stdin.on('data', async (data) => {
      const answer = data.trim().toLowerCase();
      
      if (answer === 'y' || answer === 'yes') {
        try {
          console.log('\n🚀 Publishing to npm...');
          execSync('npm publish', { stdio: 'inherit' });
          console.log('\n🎉 Package published successfully!');
          
          // Show package info
          const packageJson = await fs.readJson(packageJsonPath);
                     console.log(`\n📦 Package: @accessiblewebmedia/ionic-angular-init@${packageJson.version}`);
           console.log('🔗 Install with: npm install -g @accessiblewebmedia/ionic-angular-init');
           console.log('🚀 Use with: npx @accessiblewebmedia/ionic-angular-init');
          
        } catch (error) {
          console.error('❌ Publish failed:', error.message);
          process.exit(1);
        }
      } else {
        console.log('❌ Publish cancelled');
      }
      
      process.stdin.pause();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Publish preparation failed:', error.message);
    process.exit(1);
  }
}

publish();
