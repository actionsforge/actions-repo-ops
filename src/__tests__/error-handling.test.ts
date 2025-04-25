import { RepoOperations } from '../repo-operations';
import { OctokitGitHubClient } from '../github-client';

jest.mock('../github-client');

describe('Error Handling', () => {
  let repoOps: RepoOperations;
  let mockClient: jest.Mocked<OctokitGitHubClient>;

  beforeEach(() => {
    mockClient = new OctokitGitHubClient('token', 'test-org') as jest.Mocked<OctokitGitHubClient>;
    repoOps = new RepoOperations(mockClient);
  });

  test('handles API errors gracefully', async () => {
    const options = {
      repositoryName: 'test-repo',
      description: 'Test repository'
    };

    // Mock API errors
    mockClient.createRepository.mockResolvedValueOnce({
      status: 'failure',
      message: 'API Error'
    });

    mockClient.deleteRepository.mockResolvedValueOnce({
      status: 'failure',
      message: 'API Error'
    });

    mockClient.archiveRepository.mockResolvedValueOnce({
      status: 'failure',
      message: 'API Error'
    });

    let result = await repoOps.execute('create', options);
    expect(result.status).toBe('failure');
    expect(result.message).toBe('API Error');

    result = await repoOps.execute('delete', options);
    expect(result.status).toBe('failure');
    expect(result.message).toBe('API Error');

    result = await repoOps.execute('archive', options);
    expect(result.status).toBe('failure');
    expect(result.message).toBe('API Error');
  });

  test('validates repository names strictly', () => {
    const invalidNames = [
      'test repo',      // Contains space
      'test/repo',      // Contains slash
      'test$repo',      // Contains special char
      'TEST@REPO',      // Contains @
      '',               // Empty string
      'a'.repeat(101)   // Too long
    ];

    invalidNames.forEach(name => {
      expect(() => repoOps.validateRepoName(name)).toThrow();
    });
  });
});
