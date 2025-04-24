import * as core from '@actions/core';
import { run } from '../index';

// Mock @actions/core
jest.mock('@actions/core');

// Mock the GitHub client to avoid actual API calls
const mockClient = {
  createRepository: jest.fn(),
  deleteRepository: jest.fn(),
  archiveRepository: jest.fn()
};

jest.mock('../github-client', () => ({
  OctokitGitHubClient: jest.fn().mockImplementation(() => mockClient)
}));

describe('GitHub Action', () => {
  const mockGetInput = core.getInput as jest.MockedFunction<typeof core.getInput>;
  const mockSetOutput = core.setOutput as jest.MockedFunction<typeof core.setOutput>;
  const mockSetFailed = core.setFailed as jest.MockedFunction<typeof core.setFailed>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Reset environment variables
    delete process.env.GH_REPO_TOKEN;
    delete process.env.GH_ORG_NAME;

    // Reset mock implementations
    mockClient.createRepository.mockResolvedValue({
      status: 'success',
      message: 'Repository test-repo created successfully',
      repositoryUrl: 'https://github.com/test-org/test-repo'
    });
    mockClient.deleteRepository.mockResolvedValue({
      status: 'success',
      message: 'Repository test-repo deleted successfully'
    });
    mockClient.archiveRepository.mockResolvedValue({
      status: 'success',
      message: 'Repository test-repo archived successfully'
    });

    // Default mock implementations for inputs
    mockGetInput.mockImplementation((name) => {
      switch (name) {
        case 'operation':
          return 'create';
        case 'repository_name':
          return 'test-repo';
        default:
          return '';
      }
    });
  });

  test('validates required environment variables', async () => {
    await run();

    expect(mockSetFailed).toHaveBeenCalledWith('GH_REPO_TOKEN is required');
    expect(mockSetOutput).toHaveBeenCalledWith('status', 'failure');
    expect(mockSetOutput).toHaveBeenCalledWith('message', 'GH_REPO_TOKEN is required');

    process.env.GH_REPO_TOKEN = 'fake-token';
    await run();

    expect(mockSetFailed).toHaveBeenCalledWith('GH_ORG_NAME is required');
    expect(mockSetOutput).toHaveBeenCalledWith('status', 'failure');
    expect(mockSetOutput).toHaveBeenCalledWith('message', 'GH_ORG_NAME is required');
  });

  test('validates required action inputs', async () => {
    process.env.GH_REPO_TOKEN = 'fake-token';
    process.env.GH_ORG_NAME = 'test-org';

    mockGetInput.mockImplementation((name) => {
      if (name === 'operation') return '';
      return '';
    });

    await run();

    expect(mockSetFailed).toHaveBeenCalled();
    expect(mockSetOutput).toHaveBeenCalledWith('status', 'failure');
  });

  test('handles successful repository creation', async () => {
    process.env.GH_REPO_TOKEN = 'fake-token';
    process.env.GH_ORG_NAME = 'test-org';

    mockGetInput.mockImplementation((name) => {
      switch (name) {
        case 'operation':
          return 'create';
        case 'repository_name':
          return 'test-repo';
        case 'description':
          return 'Test repository';
        case 'private':
          return 'true';
        case 'auto_init':
          return 'true';
        case 'gitignore_template':
          return 'Node';
        case 'license_template':
          return 'MIT';
        default:
          return '';
      }
    });

    await run();

    expect(mockSetOutput).toHaveBeenCalledWith('status', 'success');
    expect(mockSetOutput).toHaveBeenCalledWith('message', expect.stringContaining('created successfully'));
    expect(mockSetOutput).toHaveBeenCalledWith('repository_url', expect.stringContaining('test-repo'));
  });

  test('handles successful repository deletion', async () => {
    process.env.GH_REPO_TOKEN = 'fake-token';
    process.env.GH_ORG_NAME = 'test-org';

    mockGetInput.mockImplementation((name) => {
      switch (name) {
        case 'operation':
          return 'delete';
        case 'repository_name':
          return 'test-repo';
        default:
          return '';
      }
    });

    await run();

    expect(mockSetOutput).toHaveBeenCalledWith('status', 'success');
    expect(mockSetOutput).toHaveBeenCalledWith('message', expect.stringContaining('deleted successfully'));
  });

  test('handles successful repository archive', async () => {
    process.env.GH_REPO_TOKEN = 'fake-token';
    process.env.GH_ORG_NAME = 'test-org';

    mockGetInput.mockImplementation((name) => {
      switch (name) {
        case 'operation':
          return 'archive';
        case 'repository_name':
          return 'test-repo';
        default:
          return '';
      }
    });

    await run();

    expect(mockSetOutput).toHaveBeenCalledWith('status', 'success');
    expect(mockSetOutput).toHaveBeenCalledWith('message', expect.stringContaining('archived successfully'));
  });

  test('handles operation failure', async () => {
    process.env.GH_REPO_TOKEN = 'fake-token';
    process.env.GH_ORG_NAME = 'test-org';

    // Mock the create operation to return failure
    mockClient.createRepository.mockResolvedValue({
      status: 'failure',
      message: 'Operation failed'
    });

    mockGetInput.mockImplementation((name) => {
      switch (name) {
        case 'operation':
          return 'create';
        case 'repository_name':
          return 'test-repo';
        default:
          return '';
      }
    });

    await run();

    expect(mockSetOutput).toHaveBeenCalledWith('status', 'failure');
    expect(mockSetOutput).toHaveBeenCalledWith('message', 'Operation failed');
    expect(mockSetFailed).toHaveBeenCalledWith('Operation failed');
  });

  test('handles non-Error objects in catch block', async () => {
    process.env.GH_REPO_TOKEN = 'fake-token';
    process.env.GH_ORG_NAME = 'test-org';

    mockGetInput.mockImplementation(() => {
      // TypeScript-compliant way to trigger non-Error object handling
      throw Object.create(null); // Creates a bare object with no prototype
    });

    await run();

    expect(mockSetOutput).toHaveBeenCalledWith('status', 'failure');
    expect(mockSetOutput).toHaveBeenCalledWith('message', 'An unknown error occurred');
    expect(mockSetFailed).toHaveBeenCalledWith('An unknown error occurred');
  });
});
