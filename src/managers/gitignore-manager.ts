import fs from 'fs-extra';
import { ProjectConfig, FileChange } from '../types.js';

export class GitignoreManager {
  private config: ProjectConfig;
  private dryRun: boolean;

  constructor(config: ProjectConfig, dryRun: boolean = false) {
    this.config = config;
    this.dryRun = dryRun;
  }

  async setup(): Promise<FileChange[]> {
    const changes: FileChange[] = [];
    const gitignorePath = '.gitignore';
    
    const linesToAdd = [
      'dist/',
      'www/',
      '.env',
      '.env.*',
      'src/environments/environment.ts',
      'src/environments/environment.prod.ts',
      'src/environments/environment.staging.ts',
      'src/environments/environment.prod.staging.ts',
      'firebase-debug.log',
      '.firebase/',
      'functions/.runtimeconfig.json',
      '# common Angular/Ionic artifacts',
      '.husky/',
      '.idea/',
      '.vscode/',
      '.DS_Store'
    ];

    if (await fs.pathExists(gitignorePath)) {
      // Append new lines if they don't exist
      const existingContent = await fs.readFile(gitignorePath, 'utf-8');
      const existingLines = existingContent.split('\n').map(line => line.trim());
      
      const newLines = linesToAdd.filter(line => {
        if (line.startsWith('#')) return true; // Always add comments
        return !existingLines.includes(line);
      });

      if (newLines.length > 0) {
        const contentToAdd = '\n' + newLines.join('\n');
        
        if (!this.dryRun) {
          await fs.appendFile(gitignorePath, contentToAdd);
        }
        
        changes.push({
          path: gitignorePath,
          action: 'append',
          content: contentToAdd,
          description: `Added ${newLines.length} new lines to .gitignore`
        });
      }
    } else {
      // Create new .gitignore file
      const content = linesToAdd.join('\n');
      
      if (!this.dryRun) {
        await fs.writeFile(gitignorePath, content);
      }
      
      changes.push({
        path: gitignorePath,
        action: 'create',
        content,
        description: 'Created new .gitignore file with Ionic/Angular patterns'
      });
    }

    return changes;
  }
}
