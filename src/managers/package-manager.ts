import fs from 'fs-extra';
import { ProjectConfig, FileChange, PackageJson } from '../types.js';

export class PackageManager {
  private config: ProjectConfig;
  private dryRun: boolean;

  constructor(config: ProjectConfig, dryRun: boolean = false) {
    this.config = config;
    this.dryRun = dryRun;
  }

  async setup(): Promise<FileChange[]> {
    const changes: FileChange[] = [];
    
    if (!await fs.pathExists('package.json')) {
      throw new Error('package.json not found');
    }

    const packageJson: PackageJson = await fs.readJson('package.json');
    const originalContent = JSON.stringify(packageJson, null, 2);
    
    // Apply patches
    this.patchPackageJson(packageJson);
    
    const newContent = JSON.stringify(packageJson, null, 2);
    
    if (originalContent !== newContent) {
      if (!this.dryRun) {
        await fs.writeJson('package.json', packageJson, { spaces: 2 });
      }
      
      changes.push({
        path: 'package.json',
        action: 'patch',
        content: newContent,
        description: 'Updated package.json with scripts, metadata, and engines'
      });
    }

    // Install Firebase dependencies if requested
    if (this.config.firebase && !this.dryRun) {
      await this.installFirebaseDeps();
    }

    return changes;
  }

  private patchPackageJson(packageJson: PackageJson): void {
    // Set name if missing (kebab-case of title)
    if (!packageJson.name) {
      packageJson.name = this.toKebabCase(this.config.title);
    }

    // Set author
    if (!packageJson.author) {
      packageJson.author = this.config.author;
    }

    // Set homepage
    if (!packageJson.homepage) {
      packageJson.homepage = this.config.website;
    }

    // Ensure scripts object exists
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }

    // Add missing scripts
    const requiredScripts = {
      'start': 'ionic serve',
      'start:staging': 'ionic serve --configuration=staging',
      'build': 'ng build -c production',
      'build:staging': 'ng build -c staging',
      'build:prod:staging': 'ng build -c productionStaging',
      'test': 'ng test',
      'lint': 'ng lint',
      'deploy:firebase:prod': 'firebase deploy --only hosting:prod',
      'deploy:firebase:staging': 'firebase deploy --only hosting:staging'
    };

    for (const [scriptName, scriptCommand] of Object.entries(requiredScripts)) {
      if (!packageJson.scripts[scriptName]) {
        packageJson.scripts[scriptName] = scriptCommand;
      }
    }

    // Ensure engines object exists
    if (!packageJson.engines) {
      packageJson.engines = {};
    }

    // Set Node version requirement
    packageJson.engines.node = '>=18';
  }

  private toKebabCase(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private async installFirebaseDeps(): Promise<void> {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    try {
      // Check if Firebase dependencies are already installed
      const packageJson: PackageJson = await fs.readJson('package.json');
      const hasAngularFire = packageJson.dependencies?.['@angular/fire'] || packageJson.devDependencies?.['@angular/fire'];
      const hasFirebase = packageJson.dependencies?.['firebase'] || packageJson.devDependencies?.['firebase'];

      if (!hasAngularFire || !hasFirebase) {
        console.log('Installing Firebase dependencies...');
        await execAsync('npm install @angular/fire firebase');
      }
    } catch (error) {
      console.warn('Warning: Failed to install Firebase dependencies. You may need to install them manually.');
    }
  }
}
