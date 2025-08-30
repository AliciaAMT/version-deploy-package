import chalk from 'chalk';
import ora from 'ora';
import { ProjectConfig, CliOptions, FileChange } from './types.js';
import { ProjectValidator } from './validators.js';
import { EnvironmentManager } from './managers/environment-manager.js';
import { PackageManager } from './managers/package-manager.js';
import { AngularManager } from './managers/angular-manager.js';
import { GitignoreManager } from './managers/gitignore-manager.js';
import { ReadmeManager } from './managers/readme-manager.js';
import { DocsManager } from './managers/docs-manager.js';
import { FirebaseManager } from './managers/firebase-manager.js';
import { PromptManager } from './managers/prompt-manager.js';
import { AppConfigManager } from './managers/app-config-manager.js';

export class IonicAngularInitializer {
  private config: ProjectConfig;
  private options: CliOptions;
  private changes: FileChange[] = [];
  private spinner: ora.Ora;

  constructor(options: CliOptions) {
    this.options = options;
    this.spinner = ora();
  }

  async run(): Promise<void> {
    try {
      // Validate project structure
      await this.validateProject();
      
      // Gather configuration
      await this.gatherConfig();
      
      // Execute initialization tasks
      await this.executeTasks();
      
      // Show summary
      this.showSummary();
      
    } catch (error) {
      this.spinner.fail('Initialization failed');
      throw error;
    }
  }

  private async validateProject(): Promise<void> {
    this.spinner.start('Validating project structure...');
    
    const validator = new ProjectValidator();
    await validator.validate();
    
    this.spinner.succeed('Project validation passed');
  }

  private async gatherConfig(): Promise<void> {
    this.spinner.start('Gathering configuration...');
    
    // Stop the spinner before starting interactive prompts
    this.spinner.stop();
    
    const promptManager = new PromptManager(this.options);
    this.config = await promptManager.gatherConfig();
    
    // Restart the spinner to show completion
    this.spinner.start('Configuration gathered');
    this.spinner.succeed('Configuration gathered');
  }

  private async executeTasks(): Promise<void> {
    const tasks = [
      { name: 'App configuration', executor: () => this.setupAppConfig() },
      { name: 'Environment files', executor: () => this.setupEnvironments() },
      { name: 'Package.json', executor: () => this.setupPackageJson() },
      { name: 'Angular.json', executor: () => this.setupAngularJson() },
      { name: 'Gitignore', executor: () => this.setupGitignore() },
      { name: 'README', executor: () => this.setupReadme() },
      { name: 'Documentation', executor: () => this.setupDocs() },
      { name: 'Firebase setup', executor: () => this.setupFirebase() },
    ];

    for (const task of tasks) {
      if (this.shouldSkipTask(task.name)) continue;
      
      this.spinner.start(`Setting up ${task.name}...`);
      try {
        await task.executor();
        this.spinner.succeed(`${task.name} setup complete`);
      } catch (error) {
        this.spinner.fail(`${task.name} setup failed`);
        throw error;
      }
    }
  }

  private shouldSkipTask(taskName: string): boolean {
    if (taskName === 'Firebase setup' && !this.config.firebase) return true;
    return false;
  }

  private async setupAppConfig(): Promise<void> {
    const manager = new AppConfigManager(this.config, this.options.dryRun);
    const taskChanges = await manager.setup();
    this.changes.push(...taskChanges);
  }

  private async setupEnvironments(): Promise<void> {
    const manager = new EnvironmentManager(this.config, this.options.dryRun);
    const taskChanges = await manager.setup();
    this.changes.push(...taskChanges);
  }

  private async setupPackageJson(): Promise<void> {
    const manager = new PackageManager(this.config, this.options.dryRun);
    const taskChanges = await manager.setup();
    this.changes.push(...taskChanges);
  }

  private async setupAngularJson(): Promise<void> {
    const manager = new AngularManager(this.config, this.options.dryRun);
    const taskChanges = await manager.setup();
    this.changes.push(...taskChanges);
  }

  private async setupGitignore(): Promise<void> {
    const manager = new GitignoreManager(this.config, this.options.dryRun);
    const taskChanges = await manager.setup();
    this.changes.push(...taskChanges);
  }

  private async setupReadme(): Promise<void> {
    const manager = new ReadmeManager(this.config, this.options.dryRun);
    const taskChanges = await manager.setup();
    this.changes.push(...taskChanges);
  }

  private async setupDocs(): Promise<void> {
    const manager = new DocsManager(this.config, this.options.dryRun);
    const taskChanges = await manager.setup();
    this.changes.push(...taskChanges);
  }

  private async setupFirebase(): Promise<void> {
    if (!this.config.firebase) return;
    
    const manager = new FirebaseManager(this.config, this.options.dryRun);
    const taskChanges = await manager.setup();
    this.changes.push(...taskChanges);
  }

  private showSummary(): void {
    console.log('\n' + chalk.blue('📋 Summary of Changes:'));
    console.log(chalk.blue('='.repeat(50)));
    
    if (this.changes.length === 0) {
      console.log(chalk.yellow('No changes were made (project already configured)'));
      return;
    }

    const groupedChanges = this.groupChangesByAction();
    
    for (const [action, changes] of Object.entries(groupedChanges)) {
      console.log(chalk.cyan(`\n${action.toUpperCase()}:`));
      changes.forEach(change => {
        console.log(`  ${chalk.green('✓')} ${change.path} - ${change.description}`);
      });
    }

    if (this.options.dryRun) {
      console.log(chalk.blue('\n💡 This was a dry run. Run without --dry-run to apply changes.'));
    } else {
      console.log(chalk.green('\n🎉 All changes have been applied successfully!'));
    }
  }

  private groupChangesByAction(): Record<string, FileChange[]> {
    return this.changes.reduce((acc, change) => {
      if (!acc[change.action]) acc[change.action] = [];
      acc[change.action].push(change);
      return acc;
    }, {} as Record<string, FileChange[]>);
  }
}
