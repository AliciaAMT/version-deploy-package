import fs from 'fs-extra';
import path from 'path';
import { ProjectConfig, FileChange } from '../types.js';
import { TemplateManager } from './template-manager.js';

export class FirebaseManager {
  private config: ProjectConfig;
  private dryRun: boolean;
  private templateManager: TemplateManager;

  constructor(config: ProjectConfig, dryRun: boolean = false) {
    this.config = config;
    this.dryRun = dryRun;
    this.templateManager = new TemplateManager();
  }

  async setup(): Promise<FileChange[]> {
    const changes: FileChange[] = [];

    // Firebase configuration files
    if (await this.shouldCreateFile('firebase.json')) {
      const content = await this.templateManager.renderTemplate('firebase.json.ejs', this.config);
      await this.createFile('firebase.json', content, 'Firebase hosting configuration', changes);
    }

    if (await this.shouldCreateFile('.firebaserc')) {
      const content = await this.templateManager.renderTemplate('.firebaserc.ejs', this.config);
      await this.createFile('.firebaserc', content, 'Firebase project configuration', changes);
    }

    // GitHub Actions workflow
    if (this.config.ci === 'github') {
      const workflowDir = '.github/workflows';
      const workflowPath = path.join(workflowDir, 'firebase-deploy.yml');
      
      if (!this.dryRun) {
        await fs.ensureDir(workflowDir);
      }

      if (await this.shouldCreateFile(workflowPath)) {
        const content = await this.templateManager.renderTemplate('github/firebase-deploy.yml.ejs', this.config);
        await this.createFile(workflowPath, content, 'GitHub Actions Firebase deployment workflow', changes);
      }
    }

    return changes;
  }

  private async shouldCreateFile(filePath: string): Promise<boolean> {
    if (this.dryRun) return true;
    return !await fs.pathExists(filePath);
  }

  private async createFile(filePath: string, content: string, description: string, changes: FileChange[]): Promise<void> {
    if (!this.dryRun) {
      await fs.writeFile(filePath, content);
    }
    
    changes.push({
      path: filePath,
      action: 'create',
      content,
      description
    });
  }
}
