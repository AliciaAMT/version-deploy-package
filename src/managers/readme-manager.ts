import fs from 'fs-extra';
import { ProjectConfig, FileChange } from '../types.js';
import { TemplateManager } from './template-manager.js';

export class ReadmeManager {
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
    const readmePath = 'README.md';
    const backupPath = 'README-ONEASSEMBLY.md';
    
    if (await fs.pathExists(readmePath)) {
      // Check if user wants to overwrite existing README
      if (!this.config.yes) {
        // For now, create a backup README
        const content = await this.templateManager.renderTemplate('README.md.ejs', this.config);
        
        if (!this.dryRun) {
          await fs.writeFile(backupPath, content);
        }
        
        changes.push({
          path: backupPath,
          action: 'create',
          content,
          description: 'Created README-ONEASSEMBLY.md (existing README.md preserved)'
        });
      } else {
        // Overwrite existing README
        const content = await this.templateManager.renderTemplate('README.md.ejs', this.config);
        
        if (!this.dryRun) {
          await fs.writeFile(readmePath, content);
        }
        
        changes.push({
          path: readmePath,
          action: 'update',
          content,
          description: 'Updated existing README.md with Ionic Angular template'
        });
      }
    } else {
      // Create new README
      const content = await this.templateManager.renderTemplate('README.md.ejs', this.config);
      
      if (!this.dryRun) {
        await fs.writeFile(readmePath, content);
      }
      
      changes.push({
        path: readmePath,
        action: 'create',
        content,
        description: 'Created new README.md with Ionic Angular template'
      });
    }

    return changes;
  }
}
