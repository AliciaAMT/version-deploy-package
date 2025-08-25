#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { IonicAngularInitializer } from './initializer.js';
import { CliOptions } from './types.js';

const program = new Command();

program
  .name('oneassembly-init')
  .description('Initialize Ionic Angular projects with Firebase configuration')
  .version('1.0.0')
  .option('-y, --yes', 'Skip prompts and use defaults')
  .option('--dry-run', 'Show planned changes without writing files')
  .option('--author <string>', 'Author name for package.json')
  .option('--title <string>', 'Project title (used for package.json name if missing)')
  .option('--website <url>', 'Website URL for package.json homepage')
  .option('--firebase', 'Ensure @angular/fire and firebase are installed')
  .option('--ci <github|none>', 'CI/CD setup (default: github)', 'github')
  .option('--hosting-sites <sites>', 'Firebase hosting sites mapping (format: "prod:site1,staging:site2")')
  .option('--branch-prod <branch>', 'Production branch name (default: main)', 'main')
  .option('--branch-staging <branch>', 'Staging branch name (default: staging)', 'staging')
  .action(async (options: CliOptions) => {
    try {
      const initializer = new IonicAngularInitializer(options);
      
      if (options.dryRun) {
        console.log(chalk.blue('🔍 DRY RUN MODE - No files will be modified'));
        console.log(chalk.blue('='.repeat(50)));
      }
      
      await initializer.run();
      
      if (options.dryRun) {
        console.log(chalk.blue('='.repeat(50)));
        console.log(chalk.blue('DRY RUN COMPLETE - Review the planned changes above'));
      } else {
        console.log(chalk.green('✅ Initialization complete!'));
      }
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse();
