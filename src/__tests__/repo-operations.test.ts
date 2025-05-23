import { RepoOperations } from '../repo-operations';
import { GitHubClient, RepoOperationOptions, RepoOperationResult, RepoUpdateOptions } from '../types';

class MockGitHubClient implements GitHubClient {
  async createRepository(options: RepoOperationOptions): Promise<RepoOperationResult> {
    await Promise.resolve();
    return {
      status: 'success',
      message: `Repository ${options.repositoryName} created successfully`,
      repositoryUrl: `https://github.com/org/${options.repositoryName}`
    };
  }

  async deleteRepository(name: string): Promise<RepoOperationResult> {
    await Promise.resolve();
    return {
      status: 'success',
      message: `Repository ${name} deleted successfully`
    };
  }

  async updateRepository(options: RepoUpdateOptions): Promise<RepoOperationResult> {
    await Promise.resolve();
    return {
      status: 'success',
      message: `Repository ${options.repositoryName} updated successfully`
    };
  }

  async archiveRepository(name: string): Promise<RepoOperationResult> {
    await Promise.resolve();
    return {
      status: 'success',
      message: `Repository ${name} archived successfully`
    };
  }
}

describe('RepoOperations', () => {
  let repoOps: RepoOperations;
  let mockClient: GitHubClient;

  beforeEach(() => {
    mockClient = new MockGitHubClient();
    repoOps = new RepoOperations(mockClient);
  });

  describe('validateRepoName', () => {
    test('accepts valid repository names', () => {
      const validNames = [
        'test-repo',
        'test_repo',
        'test.repo',
        'testrepo123'
      ];

      validNames.forEach(name => {
        expect(() => repoOps.validateRepoName(name)).not.toThrow();
      });
    });

    test('accepts special repository names', () => {
      const specialNames = ['.github', '.github-private'];
      specialNames.forEach(name => {
        expect(() => repoOps.validateRepoName(name)).not.toThrow();
      });
    });

    test('rejects invalid repository names', () => {
      const invalidNames = [
        'test repo',    // contains space
        'test/repo',    // contains slash
        'test@repo',    // contains @
        '',             // empty string
        ' ',            // just space
        'test$repo',    // contains $
        '.test',        // starts with dot
        '-test',        // starts with hyphen
        '_test',        // starts with underscore
        'test!repo'     // contains !
      ];

      invalidNames.forEach(name => {
        expect(() => repoOps.validateRepoName(name)).toThrow('Invalid repository name. Use only letters, numbers, dots, hyphens, and underscores.');
      });
    });
  });

  describe('execute', () => {
    test('creates a repository with all options', async () => {
      const options: RepoOperationOptions = {
        repositoryName: 'test-repo',
        description: 'Test repository',
        isPrivate: true,
        autoInit: true,
        gitignoreTemplate: 'Node',
        licenseTemplate: 'mit',
        homepage: 'https://example.com',
        hasIssues: true,
        hasProjects: true,
        hasWiki: true,
        hasDiscussions: true,
        teamId: 123,
        allowSquashMerge: true,
        allowMergeCommit: true,
        allowRebaseMerge: true,
        allowAutoMerge: true,
        deleteBranchOnMerge: true,
        allowUpdateBranch: true,
        defaultBranch: 'main',
        useSquashPrTitleAsDefault: true,
        squashMergeCommitTitle: 'PR_TITLE',
        squashMergeCommitMessage: 'PR_BODY',
        mergeCommitTitle: 'PR_TITLE',
        mergeCommitMessage: 'PR_BODY'
      };

      const result = await repoOps.execute('create', options);
      expect(result.status).toBe('success');
      expect(result.message).toBe('Repository test-repo created successfully');
    });

    test('creates a repository with minimal options', async () => {
      const options: RepoOperationOptions = {
        repositoryName: 'test-repo'
      };

      const result = await repoOps.execute('create', options);
      expect(result.status).toBe('success');
      expect(result.message).toBe('Repository test-repo created successfully');
    });

    test('deletes a repository', async () => {
      const options: RepoOperationOptions = {
        repositoryName: 'test-repo'
      };

      const result = await repoOps.execute('delete', options);

      expect(result.status).toBe('success');
      expect(result.message).toBe('Repository test-repo deleted successfully');
    });

    test('archives a repository', async () => {
      const options: RepoOperationOptions = {
        repositoryName: 'test-repo'
      };

      const result = await repoOps.execute('archive', options);

      expect(result.status).toBe('success');
      expect(result.message).toBe('Repository test-repo archived successfully');
    });

    test('rejects unsupported operations', async () => {
      const options: RepoOperationOptions = {
        repositoryName: 'test-repo'
      };

      const result = await repoOps.execute('unsupported', options);

      expect(result.status).toBe('failure');
      expect(result.message).toBe('Unsupported operation: unsupported');
    });
  });
});
