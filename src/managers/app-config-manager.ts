import fs from 'fs-extra';
import path from 'path';
import { ProjectConfig, FileChange } from '../types.js';

export class AppConfigManager {
  private config: ProjectConfig;
  private dryRun: boolean;

  constructor(config: ProjectConfig, dryRun: boolean = false) {
    this.config = config;
    this.dryRun = dryRun;
  }

  async setup(): Promise<FileChange[]> {
    const changes: FileChange[] = [];

    // Fix icon issues
    await this.fixIconIssues(changes);
    
    // Fix text selection and zoom issues
    await this.fixAppBehavior(changes);

    return changes;
  }

  private async fixIconIssues(changes: FileChange[]): Promise<void> {
    // Fix favicon.ico issues
    await this.createFavicon(changes);
    
    // Fix Apple touch icon issues
    await this.createAppleTouchIcon(changes);
    
    // Fix PWA manifest icon issues
    await this.createPWAIcons(changes);
  }

  private async createFavicon(changes: FileChange[]): Promise<void> {
    const faviconPath = 'src/assets/favicon.ico';
    const faviconDir = path.dirname(faviconPath);
    
    if (!this.dryRun) {
      await fs.ensureDir(faviconDir);
    }

    // Create a simple favicon.ico placeholder if it doesn't exist
    if (!await fs.pathExists(faviconPath)) {
      const faviconContent = this.generateFaviconPlaceholder();
      
      if (!this.dryRun) {
        await fs.writeFile(faviconPath, faviconContent);
      }
      
      changes.push({
        path: faviconPath,
        action: 'create',
        content: 'Binary favicon.ico file',
        description: 'Created favicon.ico to prevent 404 errors'
      });
    }
  }

  private async createAppleTouchIcon(changes: FileChange[]): Promise<void> {
    const iconPath = 'src/assets/apple-touch-icon.png';
    const iconDir = path.dirname(iconPath);
    
    if (!this.dryRun) {
      await fs.ensureDir(iconDir);
    }

    // Create a simple Apple touch icon placeholder if it doesn't exist
    if (!await fs.pathExists(iconPath)) {
      const iconContent = this.generatePNGPlaceholder(180, 180); // Standard Apple touch icon size
      
      if (!this.dryRun) {
        await fs.writeFile(iconPath, iconContent);
      }
      
      changes.push({
        path: iconPath,
        action: 'create',
        content: 'Binary apple-touch-icon.png file',
        description: 'Created Apple touch icon to prevent 404 errors'
      });
    }
  }

  private async createPWAIcons(changes: FileChange[]): Promise<void> {
    const iconSizes = [16, 32, 48, 72, 96, 128, 144, 152, 192, 384, 512];
    const iconDir = 'src/assets/icons';
    
    if (!this.dryRun) {
      await fs.ensureDir(iconDir);
    }

    for (const size of iconSizes) {
      const iconPath = path.join(iconDir, `icon-${size}x${size}.png`);
      
      if (!await fs.pathExists(iconPath)) {
        const iconContent = this.generatePNGPlaceholder(size, size);
        
        if (!this.dryRun) {
          await fs.writeFile(iconPath, iconContent);
        }
        
        changes.push({
          path: iconPath,
          action: 'create',
          content: `Binary icon-${size}x${size}.png file`,
          description: `Created PWA icon ${size}x${size} to prevent 404 errors`
        });
      }
    }
  }

  private async fixAppBehavior(changes: FileChange[]): Promise<void> {
    // Update index.html to fix text selection and zoom issues
    await this.updateIndexHtml(changes);
    
    // Create/update global CSS for app behavior
    await this.updateGlobalStyles(changes);
  }

  private async updateIndexHtml(changes: FileChange[]): Promise<void> {
    const indexPath = 'src/index.html';
    
    if (!await fs.pathExists(indexPath)) {
      return; // Skip if index.html doesn't exist
    }

    let content = await fs.readFile(indexPath, 'utf-8');
    let modified = false;

    // Add viewport meta tag with proper zoom settings
    if (!content.includes('user-scalable=yes')) {
      const viewportRegex = /<meta[^>]*name="viewport"[^>]*>/;
      if (viewportRegex.test(content)) {
        // Replace existing viewport meta tag
        content = content.replace(
          viewportRegex,
          '<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes, viewport-fit=cover">'
        );
      } else {
        // Add new viewport meta tag after charset
        content = content.replace(
          /<meta charset="[^"]*">/,
          '<meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes, viewport-fit=cover">'
        );
      }
      modified = true;
    }

    // Add Apple touch icon meta tag
    if (!content.includes('apple-touch-icon')) {
      const headEnd = content.indexOf('</head>');
      if (headEnd !== -1) {
        content = content.slice(0, headEnd) + 
          '  <link rel="apple-touch-icon" href="assets/apple-touch-icon.png">\n' +
          content.slice(headEnd);
        modified = true;
      }
    }

    // Add favicon link
    if (!content.includes('favicon')) {
      const headEnd = content.indexOf('</head>');
      if (headEnd !== -1) {
        content = content.slice(0, headEnd) + 
          '  <link rel="icon" type="image/x-icon" href="assets/favicon.ico">\n' +
          content.slice(headEnd);
        modified = true;
      }
    }

    if (modified && !this.dryRun) {
      await fs.writeFile(indexPath, content);
    }

    if (modified) {
      changes.push({
        path: indexPath,
        action: 'patch',
        content: content,
        description: 'Updated index.html with proper viewport, icons, and meta tags'
      });
    }
  }

  private async updateGlobalStyles(changes: FileChange[]): Promise<void> {
    const globalStylesPath = 'src/global.scss';
    
    if (!await fs.pathExists(globalStylesPath)) {
      return; // Skip if global styles don't exist
    }

    let content = await fs.readFile(globalStylesPath, 'utf-8');
    let modified = false;

    // Add text selection by default (opposite of what was there before)
    if (!content.includes('user-select: text')) {
      const appSelectors = ['ion-app', 'ion-content', '.app-container', 'body'];
      const textSelectionRules = `
/* Make text selectable by default for better user experience */
${appSelectors.join(', ')} {
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  user-select: text;
}

/* Allow users to disable text selection in specific areas if needed */
.no-select, .unselectable-text {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Prevent zoom on double-tap for iOS */
* {
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
}

/* Ensure proper touch handling */
button, a, [role="button"] {
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
  touch-action: manipulation;
}
`;
      
      content += textSelectionRules;
      modified = true;
    }

    if (modified && !this.dryRun) {
      await fs.writeFile(globalStylesPath, content);
    }

    if (modified) {
      changes.push({
        path: globalStylesPath,
        action: 'patch',
        content: content,
        description: 'Updated global styles with text selection enabled by default and touch optimizations'
      });
    }
  }

  private generateFaviconPlaceholder(): Buffer {
    // This is a minimal 16x16 ICO file structure
    // In a real implementation, you might want to use a proper icon generation library
    const icoHeader = Buffer.from([
      0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x10, 0x10, 0x00, 0x00, 0x01, 0x00,
      0x20, 0x00, 0x68, 0x04, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00
    ]);
    
    // Simple 16x16 PNG data (minimal valid PNG)
    const pngData = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x10,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0xF3, 0xFF, 0x61, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    
    return Buffer.concat([icoHeader, pngData]);
  }

  private generatePNGPlaceholder(width: number, height: number): Buffer {
    // This is a minimal valid PNG file
    // In a real implementation, you might want to use a proper image generation library
    const pngData = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
      0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    
    // Update width and height in the PNG header
    pngData.writeUInt32BE(width, 16);
    pngData.writeUInt32BE(height, 20);
    
    return pngData;
  }
}
