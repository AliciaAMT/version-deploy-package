export interface CliOptions {
  yes?: boolean;
  dryRun?: boolean;
  author?: string;
  title?: string;
  website?: string;
  firebase?: boolean;
  ci?: 'github' | 'none';
  hostingSites?: string;
  branchProd?: string;
  branchStaging?: string;
}

export interface ProjectConfig {
  author: string;
  title: string;
  website: string;
  firebase: boolean;
  ci: 'github' | 'none';
  hostingSites: Record<string, string>;
  branchProd: string;
  branchStaging: string;
}

export interface AngularJsonProject {
  architect: {
    build: {
      configurations: Record<string, any>;
    };
    serve: {
      configurations: Record<string, any>;
    };
  };
}

export interface AngularJson {
  projects: Record<string, AngularJsonProject>;
}

export interface PackageJson {
  name?: string;
  author?: string;
  homepage?: string;
  scripts?: Record<string, string>;
  engines?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export interface EnvironmentConfig {
  production: boolean;
  mode: string;
  appName: string;
  siteUrl: string;
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
  };
}

export interface FileChange {
  path: string;
  action: 'create' | 'update' | 'append' | 'patch';
  content?: string;
  description: string;
}
