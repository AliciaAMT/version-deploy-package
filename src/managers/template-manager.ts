import fs from 'fs-extra';
import path from 'path';
import ejs from 'ejs';
import { ProjectConfig } from '../types.js';

export class TemplateManager {
  private templatesDir: string;

  constructor() {
    // Try multiple possible template locations for different installation scenarios
    const possiblePaths = [
      path.join(__dirname, '../../templates'), // For development
      path.join(__dirname, '../templates'),    // For built package
      path.join(process.cwd(), 'node_modules/@accessiblewebmedia/ionic-angular-init/templates'), // For installed package
      path.join(process.cwd(), 'node_modules/@accessiblewebmedia/ionic-angular-init/dist/templates'), // Alternative installed path
      // Also try relative to the current working directory
      path.join(process.cwd(), 'templates'),
    ];

    // Find the first existing templates directory
    for (const templatePath of possiblePaths) {
      if (fs.existsSync(templatePath)) {
        this.templatesDir = templatePath;
        break;
      }
    }

    // If no templates directory found, use the first path as fallback
    if (!this.templatesDir) {
      this.templatesDir = possiblePaths[0];
    }
  }

  async renderTemplate(templateName: string, data: ProjectConfig): Promise<string> {
    const templatePath = path.join(this.templatesDir, templateName);
    
    if (!await fs.pathExists(templatePath)) {
      throw new Error(`Template not found: ${templatePath}`);
    }

    const template = await fs.readFile(templatePath, 'utf-8');
    return ejs.render(template, data);
  }

  async renderStringTemplate(templateString: string, data: ProjectConfig): Promise<string> {
    return ejs.render(templateString, data);
  }
}
