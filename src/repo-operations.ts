import { GitHubClient, RepoOperationOptions, RepoOperationResult, RepoUpdateOptions } from './types';

export class RepoOperations {
  constructor(private client: GitHubClient) {}

  validateRepoName(name: string): void {
    // Allow special GitHub repository names for both organizations and users
    const specialRepos = ['.github', '.github-private'];
    if (specialRepos.includes(name)) {
      return;
    }

    // Check for empty string or undefined
    if (!name || name.trim().length === 0) {
      throw new Error('Invalid repository name. Use only letters, numbers, dots, hyphens, and underscores.');
    }

    // Check for valid characters and format
    if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*[a-zA-Z0-9]$/.test(name)) {
      throw new Error('Invalid repository name. Use only letters, numbers, dots, hyphens, and underscores.');
    }

    // Check length
    if (name.length > 100) {
      throw new Error('Invalid repository name. Use only letters, numbers, dots, hyphens, and underscores.');
    }
  }

  async execute(operation: string, options: RepoOperationOptions | RepoUpdateOptions): Promise<RepoOperationResult> {
    this.validateRepoName(options.repositoryName);

    switch (operation.toLowerCase()) {
      case 'create':
        return await this.client.createRepository(options as RepoOperationOptions);
      case 'delete':
        return await this.client.deleteRepository(options.repositoryName);
      case 'archive':
        return await this.client.archiveRepository(options.repositoryName);
      case 'update':
        return await this.client.updateRepository(options as RepoUpdateOptions);
      default:
        return {
          status: 'failure',
          message: `Unsupported operation: ${operation}`
        };
    }
  }
}
