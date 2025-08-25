import fs from 'fs-extra';
import path from 'path';
import ejs from 'ejs';
import { ProjectConfig } from '../types.js';

export class TemplateManager {
  private templatesDir = path.join(__dirname, '../../templates');

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
