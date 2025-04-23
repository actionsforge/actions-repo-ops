import { RepoOperations } from '../repo-operations';
import { GitHubClient, RepoUpdateOptions, RepoOperationResult } from '../types';

class MockGitHubClient implements GitHubClient {
  async updateRepository(options: RepoUpdateOptions): Promise<RepoOperationResult> {
    await Promise.resolve();
    return {
      status: 'success',
      message: `Repository ${options.repositoryName} updated successfully`
    };
  }

  async createRepository(): Promise<RepoOperationResult> {
    await Promise.resolve();
    throw new Error('Not implemented');
  }

  async deleteRepository(): Promise<RepoOperationResult> {
    await Promise.resolve();
    throw new Error('Not implemented');
  }

  async archiveRepository(): Promise<RepoOperationResult> {
    await Promise.resolve();
    throw new Error('Not implemented');
  }
}

describe('Repository Update Operations', () => {
  let repoOps: RepoOperations;
  let mockClient: GitHubClient;

  beforeEach(() => {
    mockClient = new MockGitHubClient();
    repoOps = new RepoOperations(mockClient);
  });

  test('updates repository settings successfully', async () => {
    const options: RepoUpdateOptions = {
      repositoryName: 'test-repo',
      description: 'Updated description',
      private: true,
      hasIssues: true,
      hasProjects: false,
      hasWiki: true,
      hasDiscussions: true,
      defaultBranch: 'main'
    };

    const result = await repoOps.execute('update', options);
    expect(result.status).toBe('success');
    expect(result.message).toBe('Repository test-repo updated successfully');
  });

  test('validates repository name for update operation', async () => {
    const options: RepoUpdateOptions = {
      repositoryName: 'invalid repo name',
      description: 'Test'
    };

    await expect(repoOps.execute('update', options)).rejects.toThrow(
      'Invalid repository name. Use only letters, numbers, dots, hyphens, and underscores.'
    );
  });
});
