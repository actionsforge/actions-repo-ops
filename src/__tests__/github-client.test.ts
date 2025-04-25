import { OctokitGitHubClient } from '../github-client';

describe('OctokitGitHubClient', () => {
  let client: OctokitGitHubClient;
  let mockOctokit: { rest: { repos: { get: jest.Mock; createInOrg: jest.Mock; delete: jest.Mock; update: jest.Mock } } };

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create mock Octokit instance
    mockOctokit = {
      rest: {
        repos: {
          get: jest.fn(),
          createInOrg: jest.fn(),
          delete: jest.fn(),
          update: jest.fn()
        }
      }
    };

    // Create client with mock
    client = new OctokitGitHubClient('test-token', 'test-org');
    // Replace the internal Octokit instance
    (client as unknown as { octokit: typeof mockOctokit }).octokit = mockOctokit;
  });

  describe('createRepository', () => {
    const options = {
      repositoryName: 'test-repo',
      description: 'Test repository',
      isPrivate: true,
      autoInit: true
    };

    test('creates repository successfully', async () => {
      // Mock get to return 404 (repository doesn't exist)
      mockOctokit.rest.repos.get.mockRejectedValueOnce(new Error('Not Found'));

      // Mock successful creation
      mockOctokit.rest.repos.createInOrg.mockResolvedValueOnce({
        data: {
          html_url: 'https://github.com/test-org/test-repo'
        }
      });

      const result = await client.createRepository(options);
      expect(result.status).toBe('success');
      expect(result.message).toBe('Repository test-repo created successfully');
      expect(result.repositoryUrl).toBe('https://github.com/test-org/test-repo');
    });

    test('handles repository already exists via get', async () => {
      // Mock get to return success (repository exists)
      mockOctokit.rest.repos.get.mockResolvedValueOnce({
        data: {
          name: 'test-repo',
          owner: { login: 'test-org' },
          html_url: 'https://github.com/test-org/test-repo'
        }
      });

      const result = await client.createRepository(options);
      expect(result.status).toBe('success');
      expect(result.message).toBe('Repository test-repo already exists');
      expect(result.repositoryUrl).toBe('https://github.com/test-org/test-repo');
    });

    test('handles repository already exists via create', async () => {
      // Mock get to return 404
      mockOctokit.rest.repos.get.mockRejectedValueOnce(new Error('Not Found'));

      // Mock creation to fail with "already exists" error
      mockOctokit.rest.repos.createInOrg.mockRejectedValueOnce({
        message: 'name already exists on this account'
      });

      const result = await client.createRepository(options);
      expect(result.status).toBe('success');
      expect(result.message).toBe('Repository test-repo already exists');
      expect(result.repositoryUrl).toBe('https://github.com/test-org/test-repo');
    });

    test('handles API error during creation', async () => {
      // Mock get to return 404
      mockOctokit.rest.repos.get.mockRejectedValueOnce(new Error('Not Found'));

      // Mock creation error
      mockOctokit.rest.repos.createInOrg.mockRejectedValueOnce(new Error('API rate limit exceeded'));

      const result = await client.createRepository(options);
      expect(result.status).toBe('failure');
      expect(result.message).toBe('API rate limit exceeded');
    });

    test('handles non-Error object during creation', async () => {
      // Mock get to return 404
      mockOctokit.rest.repos.get.mockRejectedValueOnce(new Error('Not Found'));

      // Mock creation to throw a non-Error object
      mockOctokit.rest.repos.createInOrg.mockRejectedValueOnce('Permission denied');

      const result = await client.createRepository({
        repositoryName: 'test-repo',
        description: 'Test repository',
        isPrivate: true,
        autoInit: true
      });
      expect(result.status).toBe('failure');
      expect(result.message).toBe('Failed to create repository');
    });

    test('handles repository with missing html_url', async () => {
      // Mock get to return success (repository exists) but without html_url
      mockOctokit.rest.repos.get.mockResolvedValueOnce({
        data: {
          name: 'test-repo',
          owner: { login: 'test-org' }
          // No html_url property
        }
      });

      const result = await client.createRepository({
        repositoryName: 'test-repo',
        description: 'Test repository',
        isPrivate: true,
        autoInit: true
      });
      expect(result.status).toBe('success');
      expect(result.message).toBe('Repository test-repo already exists');
      expect(result.repositoryUrl).toBe('https://github.com/test-org/test-repo');
    });
  });

  describe('deleteRepository', () => {
    test('deletes repository successfully', async () => {
      // Mock get to return success (repository exists)
      mockOctokit.rest.repos.get.mockResolvedValueOnce({
        data: {
          name: 'test-repo',
          owner: { login: 'test-org' }
        }
      });

      // Mock successful deletion
      mockOctokit.rest.repos.delete.mockResolvedValueOnce({});

      const result = await client.deleteRepository('test-repo');
      expect(result.status).toBe('success');
      expect(result.message).toBe('Repository test-repo deleted successfully');
    });

    test('handles repository not found', async () => {
      // Mock get to return 404
      mockOctokit.rest.repos.get.mockRejectedValueOnce(new Error('Not Found'));

      const result = await client.deleteRepository('test-repo');
      expect(result.status).toBe('success');
      expect(result.message).toBe('Repository test-repo does not exist');
    });

    test('handles API error during deletion', async () => {
      // Mock get to return success
      mockOctokit.rest.repos.get.mockResolvedValueOnce({
        data: {
          name: 'test-repo',
          owner: { login: 'test-org' }
        }
      });

      // Mock deletion error
      mockOctokit.rest.repos.delete.mockRejectedValueOnce(new Error('Permission denied'));

      const result = await client.deleteRepository('test-repo');
      expect(result.status).toBe('failure');
      expect(result.message).toBe('Permission denied');
    });

    test('handles Not Found error from API', async () => {
      // Mock get to return success (repository exists)
      mockOctokit.rest.repos.get.mockResolvedValueOnce({
        data: {
          name: 'test-repo',
          owner: { login: 'test-org' }
        }
      });

      // Mock delete to throw Not Found error
      mockOctokit.rest.repos.delete.mockRejectedValueOnce({
        message: 'Not Found'
      });

      const result = await client.deleteRepository('test-repo');
      expect(result.status).toBe('success');
      expect(result.message).toBe('Repository test-repo does not exist');
    });

    test('handles non-Error object during deletion', async () => {
      // Mock get to return success (repository exists)
      mockOctokit.rest.repos.get.mockResolvedValueOnce({
        data: {
          name: 'test-repo',
          owner: { login: 'test-org' }
        }
      });

      // Mock delete to throw a non-Error object
      mockOctokit.rest.repos.delete.mockRejectedValueOnce('Permission denied');

      const result = await client.deleteRepository('test-repo');
      expect(result.status).toBe('failure');
      expect(result.message).toBe('Failed to delete repository');
    });
  });

  describe('archiveRepository', () => {
    test('archives repository successfully', async () => {
      // Mock get to return success (repository exists and not archived)
      mockOctokit.rest.repos.get.mockResolvedValueOnce({
        data: {
          name: 'test-repo',
          owner: { login: 'test-org' },
          archived: false
        }
      });

      // Mock successful archive
      mockOctokit.rest.repos.update.mockResolvedValueOnce({});

      const result = await client.archiveRepository('test-repo');
      expect(result.status).toBe('success');
      expect(result.message).toBe('Repository test-repo archived successfully');
    });

    test('handles already archived repository', async () => {
      // Mock get to return already archived repository
      mockOctokit.rest.repos.get.mockResolvedValueOnce({
        data: {
          name: 'test-repo',
          owner: { login: 'test-org' },
          archived: true
        }
      });

      const result = await client.archiveRepository('test-repo');
      expect(result.status).toBe('success');
      expect(result.message).toBe('Repository test-repo is already archived');
    });

    test('handles repository not found', async () => {
      // Mock get to return 404
      mockOctokit.rest.repos.get.mockRejectedValueOnce(new Error('Not Found'));

      const result = await client.archiveRepository('test-repo');
      expect(result.status).toBe('success');
      expect(result.message).toBe('Repository test-repo does not exist');
    });

    test('handles API error during archiving', async () => {
      // Mock get to return success
      mockOctokit.rest.repos.get.mockResolvedValueOnce({
        data: {
          name: 'test-repo',
          owner: { login: 'test-org' },
          archived: false
        }
      });

      // Mock archive error
      mockOctokit.rest.repos.update.mockRejectedValueOnce(new Error('Permission denied'));

      const result = await client.archiveRepository('test-repo');
      expect(result.status).toBe('failure');
      expect(result.message).toBe('Permission denied');
    });

    test('handles Not Found error from API', async () => {
      // Mock get to return success (repository exists)
      mockOctokit.rest.repos.get.mockResolvedValueOnce({
        data: {
          name: 'test-repo',
          owner: { login: 'test-org' },
          archived: false
        }
      });

      // Mock update to throw Not Found error
      mockOctokit.rest.repos.update.mockRejectedValueOnce({
        message: 'Not Found'
      });

      const result = await client.archiveRepository('test-repo');
      expect(result.status).toBe('success');
      expect(result.message).toBe('Repository test-repo does not exist');
    });

    test('handles non-Error object during archiving', async () => {
      // Mock get to return success (repository exists)
      mockOctokit.rest.repos.get.mockResolvedValueOnce({
        data: {
          name: 'test-repo',
          owner: { login: 'test-org' },
          archived: false
        }
      });

      // Mock update to throw a non-Error object
      mockOctokit.rest.repos.update.mockRejectedValueOnce('Permission denied');

      const result = await client.archiveRepository('test-repo');
      expect(result.status).toBe('failure');
      expect(result.message).toBe('Failed to archive repository');
    });
  });

  describe('updateRepository', () => {
    const options = {
      repositoryName: 'test-repo',
      description: 'Updated description'
    };

    test('updates repository successfully', async () => {
      // Mock get to return success (repository exists)
      mockOctokit.rest.repos.get.mockResolvedValueOnce({
        data: {
          name: 'test-repo',
          owner: { login: 'test-org' }
        }
      });

      // Mock successful update
      mockOctokit.rest.repos.update.mockResolvedValueOnce({});

      const result = await client.updateRepository(options);
      expect(result.status).toBe('success');
      expect(result.message).toBe('Repository test-repo updated successfully');
    });

    test('handles repository not found', async () => {
      // Mock get to return 404
      mockOctokit.rest.repos.get.mockRejectedValueOnce(new Error('Not Found'));

      const result = await client.updateRepository(options);
      expect(result.status).toBe('success');
      expect(result.message).toBe('Repository test-repo does not exist');
    });

    test('handles API error during update', async () => {
      // Mock get to return success
      mockOctokit.rest.repos.get.mockResolvedValueOnce({
        data: {
          name: 'test-repo',
          owner: { login: 'test-org' }
        }
      });

      // Mock update error
      mockOctokit.rest.repos.update.mockRejectedValueOnce(new Error('Permission denied'));

      const result = await client.updateRepository(options);
      expect(result.status).toBe('failure');
      expect(result.message).toBe('Permission denied');
    });

    test('handles Not Found error from API', async () => {
      // Mock get to return success (repository exists)
      mockOctokit.rest.repos.get.mockResolvedValueOnce({
        data: {
          name: 'test-repo',
          owner: { login: 'test-org' }
        }
      });

      // Mock update to throw Not Found error
      mockOctokit.rest.repos.update.mockRejectedValueOnce({
        message: 'Not Found'
      });

      const result = await client.updateRepository({
        repositoryName: 'test-repo',
        description: 'Updated description'
      });
      expect(result.status).toBe('success');
      expect(result.message).toBe('Repository test-repo does not exist');
    });

    test('handles non-Error object during update', async () => {
      // Mock get to return success (repository exists)
      mockOctokit.rest.repos.get.mockResolvedValueOnce({
        data: {
          name: 'test-repo',
          owner: { login: 'test-org' }
        }
      });

      // Mock update to throw a non-Error object
      mockOctokit.rest.repos.update.mockRejectedValueOnce('Permission denied');

      const result = await client.updateRepository({
        repositoryName: 'test-repo',
        description: 'Updated description'
      });
      expect(result.status).toBe('failure');
      expect(result.message).toBe('Failed to update repository');
    });
  });

  describe('getRepository', () => {
    test('handles non-Not Found error', async () => {
      // Mock get to throw a non-Not Found error
      mockOctokit.rest.repos.get.mockRejectedValueOnce(new Error('API rate limit exceeded'));

      await expect(client['getRepository']('test-repo')).rejects.toThrow('API rate limit exceeded');
    });
  });
});
