import fs from 'fs-extra';
import path from 'path';

export class FileUtils {
  /**
   * Safely append lines to a file, avoiding duplicates
   */
  static async safeAppend(filePath: string, lines: string[]): Promise<void> {
    if (!await fs.pathExists(filePath)) {
      await fs.writeFile(filePath, lines.join('\n'));
      return;
    }

    const existingContent = await fs.readFile(filePath, 'utf-8');
    const existingLines = existingContent.split('\n').map(line => line.trim());
    
    const newLines = lines.filter(line => {
      if (line.startsWith('#')) return true; // Always add comments
      return !existingLines.includes(line);
    });

    if (newLines.length > 0) {
      const contentToAdd = '\n' + newLines.join('\n');
      await fs.appendFile(filePath, contentToAdd);
    }
  }

  /**
   * Check if file content would change
   */
  static async wouldChange(filePath: string, newContent: string): Promise<boolean> {
    if (!await fs.pathExists(filePath)) return true;
    
    const existingContent = await fs.readFile(filePath, 'utf-8');
    return existingContent.trim() !== newContent.trim();
  }

  /**
   * Ensure directory exists
   */
  static async ensureDir(dirPath: string): Promise<void> {
    await fs.ensureDir(dirPath);
  }

  /**
   * Read JSON file safely
   */
  static async readJson<T>(filePath: string): Promise<T> {
    if (!await fs.pathExists(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    return await fs.readJson(filePath);
  }

  /**
   * Write JSON file with formatting
   */
  static async writeJson(filePath: string, data: any, spaces: number = 2): Promise<void> {
    await fs.writeJson(filePath, data, { spaces });
  }
}
