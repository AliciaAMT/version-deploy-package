import fs from 'fs-extra';
import path from 'path';
import { PackageJson, AngularJson } from './types.js';

export class ProjectValidator {
  async validate(): Promise<void> {
    // Check if we're in a directory with package.json
    if (!await fs.pathExists('package.json')) {
      throw new Error('No package.json found. Please run this command from an Ionic Angular project root.');
    }

    // Validate package.json has required dependencies
    await this.validatePackageJson();

    // Validate angular.json exists
    if (!await fs.pathExists('angular.json')) {
      throw new Error('No angular.json found. This does not appear to be an Angular project.');
    }

    // Validate angular.json structure
    await this.validateAngularJson();

    console.log('✅ Project validation passed - Ionic Angular workspace detected');
  }

  private async validatePackageJson(): Promise<void> {
    const packageJson: PackageJson = await fs.readJson('package.json');
    
    const requiredDeps = ['@ionic/angular', '@angular/core'];
    const missingDeps = requiredDeps.filter(dep => {
      return !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep];
    });

    if (missingDeps.length > 0) {
      throw new Error(
        `Missing required dependencies: ${missingDeps.join(', ')}. ` +
        'This does not appear to be an Ionic Angular project.'
      );
    }
  }

  private async validateAngularJson(): Promise<void> {
    const angularJson: AngularJson = await fs.readJson('angular.json');
    
    if (!angularJson.projects || Object.keys(angularJson.projects).length === 0) {
      throw new Error('angular.json has no projects defined.');
    }

    // Check if at least one project has the required architect structure
    const hasValidProject = Object.values(angularJson.projects).some(project => {
      return project.architect?.build && project.architect?.serve;
    });

    if (!hasValidProject) {
      throw new Error('angular.json projects must have build and serve architects defined.');
    }
  }
}
