import inquirer from 'inquirer';
import { CliOptions, ProjectConfig } from '../types.js';

export class PromptManager {
  private options: CliOptions;

  constructor(options: CliOptions) {
    this.options = options;
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
    
    const { author } = await inquirer.prompt([{
      type: 'input',
      name: 'author',
      message: 'Author name:',
      default: 'Your Name'
    }]);
    
    return author;
  }

  private async promptTitle(): Promise<string> {
    if (this.options.yes) return 'My Ionic App';
    
    const { title } = await inquirer.prompt([{
      type: 'input',
      name: 'title',
      message: 'Project title:',
      default: 'My Ionic App'
    }]);
    
    return title;
  }

  private async promptWebsite(): Promise<string> {
    if (this.options.yes) return 'https://example.com';
    
    const { website } = await inquirer.prompt([{
      type: 'input',
      name: 'website',
      message: 'Website URL:',
      default: 'https://example.com'
    }]);
    
    return website;
  }

  private async promptFirebase(): Promise<boolean> {
    if (this.options.firebase !== undefined) return this.options.firebase;
    if (this.options.yes) return true;
    
    const { firebase } = await inquirer.prompt([{
      type: 'confirm',
      name: 'firebase',
      message: 'Set up Firebase configuration?',
      default: true
    }]);
    
    return firebase;
  }

  private async promptCI(): Promise<'github' | 'none'> {
    if (this.options.ci) return this.options.ci;
    if (this.options.yes) return 'github';
    
    const { ci } = await inquirer.prompt([{
      type: 'list',
      name: 'ci',
      message: 'CI/CD setup:',
      choices: [
        { name: 'GitHub Actions', value: 'github' },
        { name: 'None', value: 'none' }
      ],
      default: 'github'
    }]);
    
    return ci;
  }

  private async parseHostingSites(hostingSitesStr?: string): Promise<Record<string, string>> {
    if (!hostingSitesStr) {
      if (this.options.yes) {
        return { prod: 'your-prod-site', staging: 'your-staging-site' };
      }
      
      const { hostingSites } = await inquirer.prompt([{
        type: 'input',
        name: 'hostingSites',
        message: 'Firebase hosting sites (format: "prod:site1,staging:site2"):',
        default: 'prod:your-prod-site,staging:your-staging-site'
      }]);
      
      hostingSitesStr = hostingSites;
    }

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
}
