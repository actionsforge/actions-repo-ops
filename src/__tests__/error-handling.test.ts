import { RepoOperations } from '../repo-operations';
import { OctokitGitHubClient } from '../github-client';
import { RepoOperationOptions } from '../types';

// Mock with error responses
jest.mock('@actions/github', () => ({
  getOctokit: jest.fn(() => ({
    rest: {
      repos: {
        createInOrg: jest.fn().mockRejectedValue(new Error('API Error')),
        delete: jest.fn().mockRejectedValue(new Error('Not Found')),
        update: jest.fn().mockRejectedValue(new Error('Permission Denied'))
      }
    }
  }))
}));

describe('Error Handling', () => {
  const token = 'fake-token';
  const orgName = 'test-org';
  let client: OctokitGitHubClient;
  let repoOps: RepoOperations;

  beforeEach(() => {
    client = new OctokitGitHubClient(token, orgName);
    repoOps = new RepoOperations(client);
  });

  test('handles API errors gracefully', async () => {
    const options: RepoOperationOptions = {
      repositoryName: 'test-repo'
    };

    // Test create error
    let result = await repoOps.execute('create', options);
    expect(result.status).toBe('failure');
    expect(result.message).toBe('API Error');

    // Test delete error
    result = await repoOps.execute('delete', options);
    expect(result.status).toBe('failure');
    expect(result.message).toBe('Not Found');

    // Test archive error
    result = await repoOps.execute('archive', options);
    expect(result.status).toBe('failure');
    expect(result.message).toBe('Permission Denied');
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
