# Example Usage

This document shows various ways to use the `@accessiblewebmedia/ionic-angular-init` CLI.

## Basic Examples

### 1. Interactive Mode
```bash
# Run in an Ionic Angular project directory
npx @accessiblewebmedia/ionic-angular-init
```

This will prompt you for:
- Author name
- Project title
- Website URL
- Firebase setup preference
- CI/CD preference

### 2. Non-Interactive Mode
```bash
npx @accessiblewebmedia/ionic-angular-init --yes
```

Uses default values for all prompts.

### 3. Preview Changes
```bash
npx @accessiblewebmedia/ionic-angular-init --dry-run
```

Shows what would be changed without modifying files.

## Advanced Examples

### 4. Full Configuration with Firebase
```bash
npx @accessiblewebmedia/ionic-angular-init \
  --yes \
  --author "Alicia Anne Taylor" \
  --title "Kahal" \
  --website "https://theoneassembly.org" \
  --firebase \
  --ci=github \
  --hosting-sites="prod:kahal-prod,staging:kahal-staging" \
  --branch-prod=main \
  --branch-staging=develop
```

### 5. Minimal Configuration
```bash
npx @accessiblewebmedia/ionic-angular-init \
  --yes \
  --title "My App" \
  --author "John Doe"
```

### 6. Firebase Only (No CI/CD)
```bash
npx @accessiblewebmedia/ionic-angular-init \
  --yes \
  --firebase \
  --ci=none
```

### 7. Custom Branch Names
```bash
npx @accessiblewebmedia/ionic-angular-init \
  --yes \
  --firebase \
  --branch-prod=master \
  --branch-staging=dev
```

## Real-World Scenarios

### Scenario 1: New Project Setup
```bash
# 1. Create new Ionic project
ionic start my-app tabs --type=angular

# 2. Navigate to project
cd my-app

# 3. Initialize with Firebase
npx @accessiblewebmedia/ionic-angular-init --yes --firebase

# 4. Update environment files with your Firebase keys
# 5. Deploy to staging
npm run deploy:firebase:staging
```

### Scenario 2: Existing Project Enhancement
```bash
# 1. Navigate to existing Ionic project
cd existing-ionic-app

# 2. Preview changes
npx @accessiblewebmedia/ionic-angular-init --dry-run

# 3. Apply changes
npx @accessiblewebmedia/ionic-angular-init --yes --firebase

# 4. Review generated files and update as needed
```

### Scenario 3: Team Development Setup
```bash
# 1. Clone team repository
git clone https://github.com/team/ionic-app.git
cd ionic-app

# 2. Initialize with team configuration
npx @accessiblewebmedia/ionic-angular-init \
  --yes \
  --title "Team App" \
  --author "Team Name" \
  --website "https://team-app.com" \
  --firebase \
  --hosting-sites="prod:team-prod,staging:team-staging"

# 3. Commit generated files
git add .
git commit -m "Add Firebase configuration and environment setup"
git push origin main
```

## Troubleshooting

### Common Issues

1. **"Not in Ionic Angular workspace"**
   - Ensure you're in a directory with `package.json` containing `@ionic/angular`
   - Ensure `angular.json` exists

2. **"Template not found"**
   - Reinstall the package: `npm install -g @accessiblewebmedia/ionic-angular-init`

3. **Firebase deployment fails**
   - Check that Firebase CLI is installed: `npm install -g firebase-tools`
   - Ensure you're logged in: `firebase login`

### Getting Help

- Run with `--dry-run` to see what would happen
- Check the generated `docs/` folder for detailed instructions
- Review the generated README for project-specific guidance

## Version Bump & Deploy Workflow

After initializing your project, you can use these convenient scripts for version management and deployment:

### Production Deployments (with version bump)
```bash
# Patch version bump (1.0.0 → 1.0.1), build, deploy to production
npm run vd

# Feature version bump (1.0.0 → 1.1.0), build, deploy to production  
npm run fvd

# Major version bump (1.0.0 → 2.0.0), build, deploy to production
npm run mvd
```

### Staging Deployment (no version bump)
```bash
# Build and deploy to staging environment
npm run td
```

### Workflow Examples

**Daily development cycle:**
```bash
# Make changes, test locally
npm start

# Deploy to staging for testing
npm run td

# After testing, deploy to production with patch bump
npm run vd
```

**Feature release cycle:**
```bash
# Complete feature, test on staging
npm run td

# Deploy feature to production with minor version bump
npm run fvd
```

**Major release cycle:**
```bash
# Complete major changes, test on staging
npm run td

# Deploy major release to production
npm run mvd
```
