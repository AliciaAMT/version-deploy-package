# @accessiblewebmedia/ionic-angular-init

A CLI tool to initialize Ionic Angular projects with Firebase configuration, environment management, and CI/CD setup.

## Features

- 🚀 **Environment Management**: Creates multiple environment configurations for dev, staging, and production
- 🔥 **Firebase Integration**: Optional Firebase hosting setup with GitHub Actions CI/CD
- 📦 **Package.json Updates**: Adds useful scripts and metadata without overwriting existing content
- ⚙️ **Angular Configuration**: Updates `angular.json` with build and serve configurations
- 📚 **Documentation**: Generates comprehensive docs and README files
- 🛡️ **Idempotent**: Safe to run multiple times, won't duplicate configurations
- 🔍 **Dry Run Mode**: Preview changes before applying them

## Installation

```bash
# Global installation
npm install -g @accessiblewebmedia/ionic-angular-init

# Or use npx (recommended)
npx @accessiblewebmedia/ionic-angular-init
```

## Usage

### Basic Usage
```bash
# Interactive mode
npx @oneassembly/ionic-angular-init

# Non-interactive with defaults
npx @oneassembly/ionic-angular-init --yes

# Preview changes without applying
npx @oneassembly/ionic-angular-init --dry-run
```

### Advanced Usage
```bash
npx @oneassembly/ionic-angular-init \
  --yes \
  --author "Your Name" \
  --title "My Awesome App" \
  --website "https://myapp.com" \
  --firebase \
  --ci=github \
  --hosting-sites="prod:myapp-prod,staging:myapp-staging" \
  --branch-prod=main \
  --branch-staging=develop
```

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `-y, --yes` | Skip prompts and use defaults | `false` |
| `--dry-run` | Show planned changes without writing files | `false` |
| `--author <string>` | Author name for package.json | Prompted |
| `--title <string>` | Project title (used for package.json name) | Prompted |
| `--website <url>` | Website URL for package.json homepage | Prompted |
| `--firebase` | Ensure @angular/fire and firebase are installed | `false` |
| `--ci <github\|none>` | CI/CD setup | `github` |
| `--hosting-sites <sites>` | Firebase hosting sites mapping | Prompted |
| `--branch-prod <branch>` | Production branch name | `main` |
| `--branch-staging <branch>` | Staging branch name | `staging` |

## What It Does

### 1. Environment Files
Creates/updates environment files in `src/environments/`:
- `environment.ts` - Development
- `environment.prod.ts` - Production
- `environment.staging.ts` - Staging
- `environment.prod.staging.ts` - Staging with production build
- `environment.example.ts` - Example configuration
- `environment.prod.example.ts` - Example production configuration

### 2. Package.json Updates
- Adds useful npm scripts for different environments
- Sets author, homepage, and project name
- Ensures Node.js 18+ requirement
- Installs Firebase dependencies if requested
- **Version bump and deploy scripts**:
  - `vd` - Patch bump, build, deploy to production
  - `fvd` - Feature bump, build, deploy to production
  - `mvd` - Major bump, build, deploy to production
  - `td` - Build and deploy to staging (no version bump)

### 3. Angular Configuration
Updates `angular.json` with:
- Build configurations for staging and production
- Serve configurations for different environments
- File replacements for environment switching

### 4. Firebase Setup (Optional)
If `--firebase` is passed:
- Generates `firebase.json` and `.firebaserc`
- Creates GitHub Actions workflow for CI/CD
- Sets up hosting targets for production and staging

### 5. Documentation
Generates:
- Project README with usage instructions
- `docs/` folder with detailed guides
- Environment configuration guide
- Deployment instructions

## Project Requirements

The CLI validates that you're in a valid Ionic Angular workspace:
- Must have `package.json` with `@ionic/angular` and `@angular/core` dependencies
- Must have `angular.json` with proper project structure

## Examples

### Quick Start
```bash
cd my-ionic-app
npx @accessiblewebmedia/ionic-angular-init --yes --firebase
```

### Custom Configuration
```bash
npx @accessiblewebmedia/ionic-angular-init \
  --title "Kahal" \
  --author "Alicia Anne Taylor" \
  --website "https://theoneassembly.org" \
  --firebase \
  --hosting-sites="prod:kahal-prod,staging:kahal-staging"
```

### Preview Changes
```bash
npx @accessiblewebmedia/ionic-angular-init --dry-run --firebase
```

## Development

### Building
```bash
npm install
npm run build
```

### Development Mode
```bash
npm run dev
```

### Testing
```bash
npm test
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
