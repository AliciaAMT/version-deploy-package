import fs from 'fs-extra';
import path from 'path';
import ejs from 'ejs';
import { ProjectConfig, FileChange } from '../types.js';
import { TemplateManager } from './template-manager.js';

export class EnvironmentManager {
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
    const envDir = 'src/environments';

    // Ensure environments directory exists
    if (!this.dryRun) {
      await fs.ensureDir(envDir);
    }

    // Environment files to create/update
    const envFiles = [
      { name: 'environment.ts', template: 'environment.ts.ejs' },
      { name: 'environment.prod.ts', template: 'environment.prod.ts.ejs' },
      { name: 'environment.staging.ts', template: 'environment.staging.ts.ejs' },
      { name: 'environment.prod.staging.ts', template: 'environment.prod.staging.ts.ejs' },
      { name: 'environment.example.ts', template: 'environment.example.ts.ejs' },
      { name: 'environment.prod.example.ts', template: 'environment.prod.example.ts.ejs' }
    ];

    for (const envFile of envFiles) {
      const filePath = path.join(envDir, envFile.name);
      const content = await this.templateManager.renderTemplate(envFile.template, this.config);
      
      if (await this.shouldUpdateFile(filePath, content)) {
        if (!this.dryRun) {
          await fs.writeFile(filePath, content);
        }
        
        changes.push({
          path: filePath,
          action: await fs.pathExists(filePath) ? 'update' : 'create',
          content,
          description: `Environment configuration for ${envFile.name}`
        });
      }
    }

    return changes;
  }

  private async shouldUpdateFile(filePath: string, newContent: string): Promise<boolean> {
    if (!await fs.pathExists(filePath)) return true;
    
    const existingContent = await fs.readFile(filePath, 'utf-8');
    return existingContent.trim() !== newContent.trim();
  }
}
