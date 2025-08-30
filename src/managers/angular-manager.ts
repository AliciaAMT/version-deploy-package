import fs from 'fs-extra';
import { ProjectConfig, FileChange, AngularJson } from '../types.js';

export class AngularManager {
  private config: ProjectConfig;
  private dryRun: boolean;

  constructor(config: ProjectConfig, dryRun: boolean = false) {
    this.config = config;
    this.dryRun = dryRun;
  }

  async setup(): Promise<FileChange[]> {
    const changes: FileChange[] = [];
    
    if (!await fs.pathExists('angular.json')) {
      throw new Error('angular.json not found');
    }

    const angularJson: AngularJson = await fs.readJson('angular.json');
    const originalContent = JSON.stringify(angularJson, null, 2);
    
    // Detect project name (first key in projects)
    const projectName = Object.keys(angularJson.projects)[0];
    if (!projectName) {
      throw new Error('No projects found in angular.json');
    }

    // Apply patches
    this.patchAngularJson(angularJson, projectName);
    
    const newContent = JSON.stringify(angularJson, null, 2);
    
    if (originalContent !== newContent) {
      if (!this.dryRun) {
        await fs.writeJson('angular.json', angularJson, { spaces: 2 });
      }
      
      changes.push({
        path: 'angular.json',
        action: 'patch',
        content: newContent,
        description: 'Updated angular.json with build and serve configurations for staging and production'
      });
    }

    return changes;
  }

  private patchAngularJson(angularJson: AngularJson, projectName: string): void {
    const project = angularJson.projects[projectName];
    
    if (!project.architect) {
      project.architect = {};
    }
    
    if (!project.architect.build) {
      project.architect.build = { configurations: {} };
    }
    
    if (!project.architect.serve) {
      project.architect.serve = { configurations: {} };
    }

    // Ensure build configurations exist
    if (!project.architect.build.configurations) {
      project.architect.build.configurations = {};
    }

    // Ensure the main build configuration has the correct outputPath for Firebase
    if (!project.architect.build.outputPath) {
      project.architect.build.outputPath = 'www';
    }

    // Add staging configuration
    if (!project.architect.build.configurations.staging) {
      project.architect.build.configurations.staging = {
        outputPath: 'www',
        fileReplacements: [
          {
            replace: 'src/environments/environment.ts',
            with: 'src/environments/environment.staging.ts'
          }
        ]
      };
    }

    // Add productionStaging configuration
    if (!project.architect.build.configurations.productionStaging) {
      project.architect.build.configurations.productionStaging = {
        outputPath: 'www',
        fileReplacements: [
          {
            replace: 'src/environments/environment.ts',
            with: 'src/environments/environment.prod.staging.ts'
          }
        ]
      };
    }

    // Ensure serve configurations exist
    if (!project.architect.serve.configurations) {
      project.architect.serve.configurations = {};
    }

    // Add staging serve configuration
    if (!project.architect.serve.configurations.staging) {
      project.architect.serve.configurations.staging = {
        browserTarget: `${projectName}:build:staging`
      };
    }

    // Add productionStaging serve configuration
    if (!project.architect.serve.configurations.productionStaging) {
      project.architect.serve.configurations.productionStaging = {
        browserTarget: `${projectName}:build:productionStaging`
      };
    }
  }
}
