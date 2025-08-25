import { ProjectValidator } from '../validators.js';
import fs from 'fs-extra';

// Mock fs-extra
jest.mock('fs-extra');

describe('ProjectValidator', () => {
  let validator: ProjectValidator;
  const mockFs = fs as jest.Mocked<typeof fs>;

  beforeEach(() => {
    validator = new ProjectValidator();
    jest.clearAllMocks();
  });

  describe('validate', () => {
    it('should pass validation for valid Ionic Angular project', async () => {
      // Mock package.json exists
      mockFs.pathExists.mockResolvedValue(true);
      
      // Mock package.json content
      mockFs.readJson.mockResolvedValue({
        dependencies: {
          '@ionic/angular': '^7.0.0',
          '@angular/core': '^17.0.0'
        }
      });

      // Mock angular.json exists
      mockFs.pathExists.mockResolvedValueOnce(true).mockResolvedValueOnce(true);
      
      // Mock angular.json content
      mockFs.readJson.mockResolvedValueOnce({
        dependencies: {
          '@ionic/angular': '^7.0.0',
          '@angular/core': '^17.0.0'
        }
      }).mockResolvedValueOnce({
        projects: {
          'my-app': {
            architect: {
              build: {},
              serve: {}
            }
          }
        }
      });

      await expect(validator.validate()).resolves.not.toThrow();
    });

    it('should throw error when package.json not found', async () => {
      mockFs.pathExists.mockResolvedValue(false);

      await expect(validator.validate()).rejects.toThrow(
        'No package.json found. Please run this command from an Ionic Angular project root.'
      );
    });

    it('should throw error when required dependencies missing', async () => {
      mockFs.pathExists.mockResolvedValue(true);
      mockFs.readJson.mockResolvedValue({
        dependencies: {
          '@angular/core': '^17.0.0'
          // Missing @ionic/angular
        }
      });

      await expect(validator.validate()).rejects.toThrow(
        'Missing required dependencies: @ionic/angular. This does not appear to be an Ionic Angular project.'
      );
    });

    it('should throw error when angular.json not found', async () => {
      mockFs.pathExists
        .mockResolvedValueOnce(true) // package.json exists
        .mockResolvedValueOnce(false); // angular.json doesn't exist

      mockFs.readJson.mockResolvedValue({
        dependencies: {
          '@ionic/angular': '^7.0.0',
          '@angular/core': '^17.0.0'
        }
      });

      await expect(validator.validate()).rejects.toThrow(
        'No angular.json found. This does not appear to be an Angular project.'
      );
    });
  });
});
