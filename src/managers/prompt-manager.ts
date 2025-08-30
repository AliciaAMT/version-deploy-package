import inquirer from 'inquirer';
import { CliOptions, ProjectConfig } from '../types.js';
import * as readline from 'readline';

export class PromptManager {
  private options: CliOptions;
  private isInteractive: boolean;
  private readonly PROMPT_TIMEOUT = 30000; // 30 seconds timeout

  constructor(options: CliOptions) {
    this.options = options;
    this.isInteractive = this.checkInteractiveTerminal();
  }

  private checkInteractiveTerminal(): boolean {
    // Check if we're in an interactive terminal
    const isTTY = process.stdin.isTTY && process.stdout.isTTY;
    const isDumbTerminal = process.env.TERM === 'dumb';
    const isCI = process.env.CI === 'true';
    const isTest = process.env.NODE_ENV === 'test';
    
    // Special handling for Windows Git Bash
    const isWindowsGitBash = process.platform === 'win32' && 
                             process.env.SHELL && 
                             process.env.SHELL.includes('bash');
    
    return isTTY && !isDumbTerminal && !isCI && !isTest;
  }

  private async safePrompt(promptConfig: any, fallbackValue: string): Promise<string> {
    if (!this.isInteractive) {
      return this.getFallbackValue('AUTHOR', fallbackValue);
    }

    try {
      // Create a promise that resolves with the prompt result
      const promptPromise = inquirer.prompt([promptConfig]);
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Prompt timeout')), this.PROMPT_TIMEOUT);
      });

      // Race the prompt against the timeout
      const result = await Promise.race([promptPromise, timeoutPromise]) as any;
      return result[promptConfig.name];
    } catch (error) {
      console.warn('⚠️  Interactive prompt failed or timed out, trying fallback input method...');
      return this.fallbackInput(promptConfig, fallbackValue);
    }
  }

  private async fallbackInput(promptConfig: any, fallbackValue: string): Promise<string> {
    try {
      // Use readline as a fallback
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const question = (query: string): Promise<string> => {
        return new Promise((resolve) => {
          rl.question(query, (answer) => {
            resolve(answer);
          });
        });
      };

      let message = promptConfig.message;
      if (promptConfig.default) {
        message += ` (default: ${promptConfig.default}): `;
      } else {
        message += ': ';
      }

      const answer = await question(message);
      rl.close();

      if (answer.trim() === '') {
        return promptConfig.default || fallbackValue;
      }

      return answer.trim();
    } catch (error) {
      console.warn('⚠️  Fallback input also failed, using default value');
      return promptConfig.default || fallbackValue;
    }
  }

  async gatherConfig(): Promise<ProjectConfig> {
    const config: ProjectConfig = {
      author: '',
      title: '',
      website: '',
      firebase: false,
      ci: 'github',
      hostingSites: {},
      branchProd: 'main',
      branchStaging: 'staging'
    };

    // Use CLI options or prompt for values
    config.author = this.options.author || await this.promptAuthor();
    config.title = this.options.title || await this.promptTitle();
    config.website = this.options.website || await this.promptWebsite();
    config.firebase = this.options.firebase || await this.promptFirebase();
    config.ci = this.options.ci || await this.promptCI();
    
    if (config.firebase) {
      config.hostingSites = await this.parseHostingSites(this.options.hostingSites);
    }
    
    config.branchProd = this.options.branchProd || 'main';
    config.branchStaging = this.options.branchStaging || 'staging';

    return config;
  }

  private async promptAuthor(): Promise<string> {
    if (this.options.yes) return 'Your Name';
    
    return this.safePrompt({
      type: 'input',
      name: 'author',
      message: 'Author name:',
      default: 'Your Name'
    }, 'Your Name');
  }

  private async promptTitle(): Promise<string> {
    if (this.options.yes) return 'My Ionic App';
    
    return this.safePrompt({
      type: 'input',
      name: 'title',
      message: 'Project title:',
      default: 'My Ionic App'
    }, 'My Ionic App');
  }

  private async promptWebsite(): Promise<string> {
    if (this.options.yes) return 'https://example.com';
    
    return this.safePrompt({
      type: 'input',
      name: 'website',
      message: 'Website URL:',
      default: 'https://example.com'
    }, 'https://example.com');
  }

  private async promptFirebase(): Promise<boolean> {
    if (this.options.firebase !== undefined) return this.options.firebase;
    if (this.options.yes) return true;
    
    try {
      if (!this.isInteractive) {
        return this.getFallbackValue('SETUP_FIREBASE', 'true') === 'true';
      }

      const result = await this.safePrompt({
        type: 'confirm',
        name: 'firebase',
        message: 'Set up Firebase configuration?',
        default: true
      }, 'true');
      
      return result === 'true';
    } catch (error) {
      return this.getFallbackValue('SETUP_FIREBASE', 'true') === 'true';
    }
  }

  private async promptCI(): Promise<'github' | 'none'> {
    if (this.options.ci) return this.options.ci;
    if (this.options.yes) return 'github';
    
    try {
      if (!this.isInteractive) {
        const ciValue = this.getFallbackValue('CI_SETUP', 'github');
        return ciValue === 'none' ? 'none' : 'github';
      }

      const result = await this.safePrompt({
        type: 'list',
        name: 'ci',
        message: 'CI/CD setup:',
        choices: [
          { name: 'GitHub Actions', value: 'github' },
          { name: 'None', value: 'none' }
        ],
        default: 'github'
      }, 'github');
      
      return result === 'none' ? 'none' : 'github';
    } catch (error) {
      const ciValue = this.getFallbackValue('CI_SETUP', 'github');
      return ciValue === 'none' ? 'none' : 'github';
    }
  }

  private async parseHostingSites(hostingSitesStr?: string): Promise<Record<string, string>> {
    if (!hostingSitesStr) {
      if (this.options.yes) {
        return { prod: 'your-prod-site', staging: 'your-staging-site' };
      }
      
      try {
        if (!this.isInteractive) {
          const sitesStr = this.getFallbackValue('HOSTING_SITES', 'prod:your-prod-site,staging:your-staging-site');
          return this.parseHostingSitesString(sitesStr);
        }

        const result = await this.safePrompt({
          type: 'input',
          name: 'hostingSites',
          message: 'Firebase hosting sites (format: "prod:site1,staging:site2"):',
          default: 'prod:your-prod-site,staging:your-staging-site'
        }, 'prod:your-prod-site,staging:your-staging-site');
        
        hostingSitesStr = result;
      } catch (error) {
        const sitesStr = this.getFallbackValue('HOSTING_SITES', 'prod:your-prod-site,staging:your-staging-site');
        return this.parseHostingSitesString(sitesStr);
      }
    }

    return this.parseHostingSitesString(hostingSitesStr);
  }

  private parseHostingSitesString(hostingSitesStr: string): Record<string, string> {
    const sites: Record<string, string> = {};
    const pairs = hostingSitesStr.split(',');
    
    for (const pair of pairs) {
      const [env, site] = pair.split(':').map(s => s.trim());
      if (env && site) {
        sites[env] = site;
      }
    }

    return sites;
  }

  private getFallbackValue(envVar: string, defaultValue: string): string {
    return process.env[envVar] || defaultValue;
  }
}
