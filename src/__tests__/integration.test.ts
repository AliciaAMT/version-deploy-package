import { IonicAngularInitializer } from '../initializer.js';
import { CliOptions } from '../types.js';

describe('IonicAngularInitializer Integration', () => {
  it('should create initializer with options', () => {
    const options: CliOptions = {
      yes: true,
      title: 'Test App',
      author: 'Test Author',
      website: 'https://test.com',
      firebase: true,
      ci: 'github'
    };

    const initializer = new IonicAngularInitializer(options);
    expect(initializer).toBeInstanceOf(IonicAngularInitializer);
  });

  it('should handle dry run mode', () => {
    const options: CliOptions = {
      dryRun: true,
      yes: true,
      title: 'Test App',
      author: 'Test Author',
      website: 'https://test.com'
    };

    const initializer = new IonicAngularInitializer(options);
    expect(initializer).toBeInstanceOf(IonicAngularInitializer);
  });
});
