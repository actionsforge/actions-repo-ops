import { RepoOperations } from '../repo-operations';
import { OctokitGitHubClient } from '../github-client';
import { RepoOperationOptions } from '../types';

// Mock the GitHub API calls
jest.mock('@actions/github', () => ({
  getOctokit: jest.fn(() => {
    const mockRepos = {
      get: jest.fn()
        .mockRejectedValueOnce(new Error('Not Found')) // For initial create check
        .mockResolvedValueOnce({ data: { name: 'test-repo', owner: { login: 'test-org' }, archived: false } }) // For archive check
        .mockResolvedValueOnce({ data: { name: 'test-repo', owner: { login: 'test-org' } } }), // For delete check
      createInOrg: jest.fn().mockResolvedValue({
        data: { html_url: 'https://github.com/test-org/test-repo' }
      }),
      delete: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({})
    };

    return {
      rest: {
        repos: mockRepos
      }
    };
  })
}));

describe('Integration Tests', () => {
  const token = 'fake-token';
  const orgName = 'test-org';
  let client: OctokitGitHubClient;
  let repoOps: RepoOperations;

  beforeEach(() => {
    client = new OctokitGitHubClient(token, orgName);
    repoOps = new RepoOperations(client);
  });

  test('complete repository lifecycle', async () => {
    // Create repository
    const createOptions: RepoOperationOptions = {
      repositoryName: 'test-repo',
      description: 'Test repository',
      isPrivate: true,
      autoInit: true,
      gitignoreTemplate: 'Node',
      licenseTemplate: 'mit'
    };

    let result = await repoOps.execute('create', createOptions);
    expect(result).toEqual({
      status: 'success',
      message: 'Repository test-repo created successfully',
      repositoryUrl: 'https://github.com/test-org/test-repo'
    });

    // Archive repository
    result = await repoOps.execute('archive', { repositoryName: 'test-repo' });
    expect(result).toEqual({
      status: 'success',
      message: 'Repository test-repo archived successfully'
    });

    // Delete repository
    result = await repoOps.execute('delete', { repositoryName: 'test-repo' });
    expect(result).toEqual({
      status: 'success',
      message: 'Repository test-repo deleted successfully'
    });
  });

  test('handles invalid operation', async () => {
    const result = await repoOps.execute('invalid', { repositoryName: 'test-repo' });
    expect(result).toEqual({
      status: 'failure',
      message: 'Unsupported operation: invalid'
    });
  });

  test('handles invalid repository name', async () => {
    const options: RepoOperationOptions = {
      repositoryName: 'invalid repo name',
      isPrivate: true
    };

    await expect(repoOps.execute('create', options)).rejects.toThrow(
      'Invalid repository name. Use only letters, numbers, dots, hyphens, and underscores.'
    );
  });
});
