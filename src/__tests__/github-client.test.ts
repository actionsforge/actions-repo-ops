import { OctokitGitHubClient } from '../github-client';
import { RepoOperationOptions, RepoUpdateOptions } from '../types';
import { getOctokit } from '@actions/github';

// Mock @actions/github
jest.mock('@actions/github');

describe('OctokitGitHubClient', () => {
  let client: OctokitGitHubClient;
  let mockCreateInOrg: jest.Mock;
  let mockDelete: jest.Mock;
  let mockUpdate: jest.Mock;

  beforeEach(() => {
    // Reset mocks
    mockCreateInOrg = jest.fn();
    mockDelete = jest.fn();
    mockUpdate = jest.fn();

    // Setup default mock implementation
    (getOctokit as jest.Mock).mockReturnValue({
      rest: {
        repos: {
          createInOrg: mockCreateInOrg,
          delete: mockDelete,
          update: mockUpdate
        }
      }
    });

    client = new OctokitGitHubClient('fake-token', 'test-org');
  });

  describe('createRepository', () => {
    test('creates repository successfully', async () => {
      mockCreateInOrg.mockResolvedValue({
        data: { html_url: 'https://github.com/test-org/test-repo' }
      });

      const options: RepoOperationOptions = {
        repositoryName: 'test-repo',
        isPrivate: true,
        description: 'Test repo',
        autoInit: true,
        gitignoreTemplate: 'Node',
        licenseTemplate: 'MIT'
      };

      const result = await client.createRepository(options);

      expect(result.status).toBe('success');
      expect(result.message).toBe('Repository test-repo created successfully');
      expect(result.repositoryUrl).toBe('https://github.com/test-org/test-repo');

      // Verify correct parameters were passed
      expect(mockCreateInOrg).toHaveBeenCalledWith({
        org: 'test-org',
        name: 'test-repo',
        private: true,
        description: 'Test repo',
        auto_init: true,
        gitignore_template: 'Node',
        license_template: 'MIT'
      });
    });

    test('handles API error during creation', async () => {
      mockCreateInOrg.mockRejectedValue(new Error('API rate limit exceeded'));

      const options: RepoOperationOptions = {
        repositoryName: 'test-repo'
      };

      const result = await client.createRepository(options);

      expect(result.status).toBe('failure');
      expect(result.message).toBe('API rate limit exceeded');
    });

    test('handles non-Error objects during creation', async () => {
      mockCreateInOrg.mockRejectedValue('Unknown error');

      const options: RepoOperationOptions = {
        repositoryName: 'test-repo'
      };

      const result = await client.createRepository(options);

      expect(result.status).toBe('failure');
      expect(result.message).toBe('Failed to create repository');
    });
  });

  describe('deleteRepository', () => {
    test('deletes repository successfully', async () => {
      mockDelete.mockResolvedValue({});

      const result = await client.deleteRepository('test-repo');

      expect(result.status).toBe('success');
      expect(result.message).toBe('Repository test-repo deleted successfully');

      // Verify correct parameters
      expect(mockDelete).toHaveBeenCalledWith({
        owner: 'test-org',
        repo: 'test-repo'
      });
    });

    test('handles API error during deletion', async () => {
      mockDelete.mockRejectedValue(new Error('Repository not found'));

      const result = await client.deleteRepository('test-repo');

      expect(result.status).toBe('failure');
      expect(result.message).toBe('Repository not found');
    });

    test('handles non-Error objects during deletion', async () => {
      mockDelete.mockRejectedValue('Unknown error');

      const result = await client.deleteRepository('test-repo');

      expect(result.status).toBe('failure');
      expect(result.message).toBe('Failed to delete repository');
    });
  });

  describe('archiveRepository', () => {
    test('archives repository successfully', async () => {
      mockUpdate.mockResolvedValue({});

      const result = await client.archiveRepository('test-repo');

      expect(result.status).toBe('success');
      expect(result.message).toBe('Repository test-repo archived successfully');

      // Verify correct parameters
      expect(mockUpdate).toHaveBeenCalledWith({
        owner: 'test-org',
        repo: 'test-repo',
        archived: true
      });
    });

    test('handles API error during archiving', async () => {
      mockUpdate.mockRejectedValue(new Error('Permission denied'));

      const result = await client.archiveRepository('test-repo');

      expect(result.status).toBe('failure');
      expect(result.message).toBe('Permission denied');
    });

    test('handles non-Error objects during archiving', async () => {
      mockUpdate.mockRejectedValue('Unknown error');

      const result = await client.archiveRepository('test-repo');

      expect(result.status).toBe('failure');
      expect(result.message).toBe('Failed to archive repository');
    });
  });

  describe('updateRepository', () => {
    test('updates repository successfully', async () => {
      mockUpdate.mockResolvedValue({});

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

      const result = await client.updateRepository(options);

      expect(result.status).toBe('success');
      expect(result.message).toBe('Repository test-repo updated successfully');

      // Verify correct parameters
      expect(mockUpdate).toHaveBeenCalledWith({
        owner: 'test-org',
        repo: 'test-repo',
        description: 'Updated description',
        private: true,
        has_issues: true,
        has_projects: false,
        has_wiki: true,
        has_discussions: true,
        default_branch: 'main'
      });
    });

    test('handles API error during update', async () => {
      mockUpdate.mockRejectedValue(new Error('Repository not found'));

      const result = await client.updateRepository({ repositoryName: 'test-repo' });

      expect(result.status).toBe('failure');
      expect(result.message).toBe('Repository not found');
    });

    test('handles non-Error objects during update', async () => {
      mockUpdate.mockRejectedValue('Unknown error');

      const result = await client.updateRepository({ repositoryName: 'test-repo' });

      expect(result.status).toBe('failure');
      expect(result.message).toBe('Failed to update repository');
    });
  });

  describe('initialization', () => {
    test('creates client with token and org name', () => {
      expect(getOctokit).toHaveBeenCalledWith('fake-token');
    });
  });
});
