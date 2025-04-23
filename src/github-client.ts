import { getOctokit } from '@actions/github';
import { GitHubClient, RepoOperationOptions, RepoOperationResult, RepoUpdateOptions } from './types';

export class OctokitGitHubClient implements GitHubClient {
  private octokit;
  private orgName: string;

  constructor(token: string, orgName: string) {
    this.octokit = getOctokit(token);
    this.orgName = orgName;
  }

  async createRepository(options: RepoOperationOptions): Promise<RepoOperationResult> {
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
      return {
        status: 'failure',
        message: error instanceof Error ? error.message : 'Failed to create repository'
      };
    }
  }

  async deleteRepository(name: string): Promise<RepoOperationResult> {
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
      return {
        status: 'failure',
        message: error instanceof Error ? error.message : 'Failed to delete repository'
      };
    }
  }

  async archiveRepository(name: string): Promise<RepoOperationResult> {
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
      return {
        status: 'failure',
        message: error instanceof Error ? error.message : 'Failed to archive repository'
      };
    }
  }

  async updateRepository(options: RepoUpdateOptions): Promise<RepoOperationResult> {
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
      return {
        status: 'failure',
        message: error instanceof Error ? error.message : 'Failed to update repository'
      };
    }
  }
}
