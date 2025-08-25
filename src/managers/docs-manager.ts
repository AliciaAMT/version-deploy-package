import fs from 'fs-extra';
import path from 'path';
import { ProjectConfig, FileChange } from '../types.js';
import { TemplateManager } from './template-manager.js';

export class DocsManager {
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
    const docsDir = 'docs';

    // Ensure docs directory exists
    if (!this.dryRun) {
      await fs.ensureDir(docsDir);
    }

    // Documentation files to create
    const docFiles = [
      { name: 'getting-started.md', template: 'docs/getting-started.md.ejs' },
      { name: 'env.md', template: 'docs/env.md.ejs' },
      { name: 'deploy.md', template: 'docs/deploy.md.ejs' }
    ];

    for (const docFile of docFiles) {
      const filePath = path.join(docsDir, docFile.name);
      const content = await this.templateManager.renderTemplate(docFile.template, this.config);
      
      if (await this.shouldUpdateFile(filePath, content)) {
        if (!this.dryRun) {
          await fs.writeFile(filePath, content);
        }
        
        changes.push({
          path: filePath,
          action: await fs.pathExists(filePath) ? 'update' : 'create',
          content,
          description: `Documentation: ${docFile.name}`
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
