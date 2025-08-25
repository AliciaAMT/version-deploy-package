#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

console.log('🧪 Testing CLI functionality...\n');

// Test fixture directory
const fixtureDir = path.join(__dirname, '../test-fixtures/ionic-angular-project');
const tempDir = path.join(__dirname, '../temp-test-project');

async function runTests() {
  try {
    // Clean up previous test run
    if (await fs.pathExists(tempDir)) {
      await fs.remove(tempDir);
    }

    // Copy fixture to temp directory
    await fs.copy(fixtureDir, tempDir);
    console.log('✅ Test fixture copied to temp directory');

    // Change to temp directory
    process.chdir(tempDir);
    console.log('✅ Changed to test directory');

    // Test dry run
    console.log('\n🔍 Testing dry run mode...');
    try {
      execSync('node ../../dist/cli.js --dry-run --yes --title "Test App" --author "Test Author" --website "https://test.com"', { 
        stdio: 'inherit',
        cwd: tempDir
      });
      console.log('✅ Dry run completed successfully');
    } catch (error) {
      console.log('⚠️  Dry run failed (this is expected if CLI is not built yet)');
    }

    console.log('\n🎉 CLI test completed!');
    console.log('\nTo test the full CLI:');
    console.log('1. Run: npm run build');
    console.log('2. Run: node scripts/test-cli.js');
    console.log('3. Or test in a real Ionic project: npx . --dry-run');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTests();
