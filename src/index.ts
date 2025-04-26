import * as core from '@actions/core';
import { OctokitGitHubClient } from './github-client';
import { RepoOperations } from './repo-operations';
import { RepoOperationOptions } from './types';

export async function run(): Promise<void> {
  try {
    const token = process.env.GH_REPO_TOKEN;
    if (!token) {
      throw new Error('GH_REPO_TOKEN is required');
    }
    const orgName = process.env.GH_ORG_NAME;
    if (!orgName) {
      throw new Error('GH_ORG_NAME is required');
    }

    const operation = core.getInput('operation', { required: true });
    const repositoryName = core.getInput('repository_name', { required: true });

    const client = new OctokitGitHubClient(token, orgName);
    const repoOps = new RepoOperations(client);

    let result;
    let options: RepoOperationOptions;

    switch (operation.toLowerCase()) {
      case 'create':
        options = {
          repositoryName,
          description: core.getInput('description'),
          isPrivate: core.getInput('private') === 'true',
          autoInit: core.getInput('auto_init') === 'true',
          gitignoreTemplate: core.getInput('gitignore_template'),
          licenseTemplate: core.getInput('license_template'),
          homepage: core.getInput('homepage'),
          hasIssues: core.getInput('has_issues') === 'true',
          hasProjects: core.getInput('has_projects') === 'true',
          hasWiki: core.getInput('has_wiki') === 'true',
          hasDiscussions: core.getInput('has_discussions') === 'true',
          teamId: parseInt(core.getInput('team_id') || '0') || undefined,
          allowSquashMerge: core.getInput('allow_squash_merge') === 'true',
          allowMergeCommit: core.getInput('allow_merge_commit') === 'true',
          allowRebaseMerge: core.getInput('allow_rebase_merge') === 'true',
          allowAutoMerge: core.getInput('allow_auto_merge') === 'true',
          deleteBranchOnMerge: core.getInput('delete_branch_on_merge') === 'true',
          allowUpdateBranch: core.getInput('allow_update_branch') === 'true',
          defaultBranch: core.getInput('default_branch') || undefined,
          useSquashPrTitleAsDefault: core.getInput('use_squash_pr_title_as_default') === 'true',
          squashMergeCommitTitle: core.getInput('squash_merge_commit_title') as 'PR_TITLE' | 'COMMIT_OR_PR_TITLE' || undefined,
          squashMergeCommitMessage: core.getInput('squash_merge_commit_message') as 'PR_BODY' | 'COMMIT_MESSAGES' | 'BLANK' || undefined,
          mergeCommitTitle: core.getInput('merge_commit_title') as 'PR_TITLE' | 'MERGE_MESSAGE' || undefined,
          mergeCommitMessage: core.getInput('merge_commit_message') as 'PR_BODY' | 'PR_TITLE' | 'BLANK' || undefined
        };
        result = await repoOps.execute('create', options);
        break;

      case 'delete':
        result = await repoOps.execute('delete', { repositoryName });
        break;

      case 'archive':
        result = await repoOps.execute('archive', { repositoryName });
        break;

      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }

    // Set outputs consistently
    core.setOutput('status', result.status);
    core.setOutput('message', result.message);
    if (result.repositoryUrl) {
      core.setOutput('repository_url', result.repositoryUrl);
    }

    // Handle failures
    if (result.status === 'failure') {
      core.setFailed(result.message);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    core.setOutput('status', 'failure');
    core.setOutput('message', message);
    core.setFailed(message);
  }
}

// Only run if this file is being executed directly
if (require.main === module) {
  void run();
}
