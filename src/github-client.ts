import { getOctokit } from '@actions/github';
import { GitHubClient, RepoOperationOptions, RepoOperationResult, RepoUpdateOptions } from './types';

interface RepositoryData {
  name: string;
  owner: { login: string };
  html_url: string;
  archived?: boolean;
}

export class OctokitGitHubClient implements GitHubClient {
  private octokit;
  private orgName: string;

  constructor(token: string, orgName: string) {
    this.octokit = getOctokit(token);
    this.orgName = orgName;
  }

  private async getRepository(name: string): Promise<{ exists: boolean; data: RepositoryData | null }> {
    try {
      const response = await this.octokit.rest.repos.get({
        owner: this.orgName,
        repo: name
      });
      return { exists: true, data: response.data };
    } catch (error) {
      if (error instanceof Error && error.message.includes('Not Found')) {
        return { exists: false, data: null };
      }
      throw error;
    }
  }

  async createRepository(options: RepoOperationOptions): Promise<RepoOperationResult> {
    try {
      const { exists, data } = await this.getRepository(options.repositoryName);
      if (exists) {
        return {
          status: 'success',
          message: `Repository ${options.repositoryName} already exists`,
          repositoryUrl: data?.html_url || `https://github.com/${this.orgName}/${options.repositoryName}`
        };
      }

      try {
        const result = await this.octokit.rest.repos.createInOrg({
          org: this.orgName,
          name: options.repositoryName,
          description: options.description,
          private: options.isPrivate,
          auto_init: options.autoInit,
          gitignore_template: options.gitignoreTemplate,
          license_template: options.licenseTemplate
        });

        return {
          status: 'success',
          message: `Repository ${options.repositoryName} created successfully`,
          repositoryUrl: result.data.html_url
        };
      } catch (error) {
        // Handle GitHub API errors
        if (error && typeof error === 'object' && 'message' in error) {
          const errorMessage = error.message as string;
          if (errorMessage.includes('name already exists')) {
            return {
              status: 'success',
              message: `Repository ${options.repositoryName} already exists`,
              repositoryUrl: `https://github.com/${this.orgName}/${options.repositoryName}`
            };
          }
        }
        throw error;
      }
    } catch (error) {
      return {
        status: 'failure',
        message: error instanceof Error ? error.message : 'Failed to create repository'
      };
    }
  }

  async deleteRepository(name: string): Promise<RepoOperationResult> {
    try {
      const { exists } = await this.getRepository(name);
      if (!exists) {
        return {
          status: 'success',
          message: `Repository ${name} does not exist`
        };
      }

      try {
        await this.octokit.rest.repos.delete({
          owner: this.orgName,
          repo: name
        });

        return {
          status: 'success',
          message: `Repository ${name} deleted successfully`
        };
      } catch (error) {
        // Handle GitHub API errors
        if (error && typeof error === 'object' && 'message' in error) {
          const errorMessage = error.message as string;
          if (errorMessage.includes('Not Found')) {
            return {
              status: 'success',
              message: `Repository ${name} does not exist`
            };
          }
        }
        throw error;
      }
    } catch (error) {
      return {
        status: 'failure',
        message: error instanceof Error ? error.message : 'Failed to delete repository'
      };
    }
  }

  async archiveRepository(name: string): Promise<RepoOperationResult> {
    try {
      const { exists, data } = await this.getRepository(name);
      if (!exists) {
        return {
          status: 'success',
          message: `Repository ${name} does not exist`
        };
      }

      if (data?.archived) {
        return {
          status: 'success',
          message: `Repository ${name} is already archived`
        };
      }

      try {
        await this.octokit.rest.repos.update({
          owner: this.orgName,
          repo: name,
          archived: true
        });

        return {
          status: 'success',
          message: `Repository ${name} archived successfully`
        };
      } catch (error) {
        // Handle GitHub API errors
        if (error && typeof error === 'object' && 'message' in error) {
          const errorMessage = error.message as string;
          if (errorMessage.includes('Not Found')) {
            return {
              status: 'success',
              message: `Repository ${name} does not exist`
            };
          }
        }
        throw error;
      }
    } catch (error) {
      return {
        status: 'failure',
        message: error instanceof Error ? error.message : 'Failed to archive repository'
      };
    }
  }

  async updateRepository(options: RepoUpdateOptions): Promise<RepoOperationResult> {
    try {
      const { exists } = await this.getRepository(options.repositoryName);
      if (!exists) {
        return {
          status: 'success',
          message: `Repository ${options.repositoryName} does not exist`
        };
      }

      try {
        await this.octokit.rest.repos.update({
          owner: this.orgName,
          repo: options.repositoryName,
          description: options.description,
          homepage: options.homepage,
          private: options.private,
          has_issues: options.hasIssues,
          has_projects: options.hasProjects,
          has_wiki: options.hasWiki,
          has_discussions: options.hasDiscussions,
          default_branch: options.defaultBranch
        });

        return {
          status: 'success',
          message: `Repository ${options.repositoryName} updated successfully`
        };
      } catch (error) {
        // Handle GitHub API errors
        if (error && typeof error === 'object' && 'message' in error) {
          const errorMessage = error.message as string;
          if (errorMessage.includes('Not Found')) {
            return {
              status: 'success',
              message: `Repository ${options.repositoryName} does not exist`
            };
          }
        }
        throw error;
      }
    } catch (error) {
      return {
        status: 'failure',
        message: error instanceof Error ? error.message : 'Failed to update repository'
      };
    }
  }
}
