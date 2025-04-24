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
    const description = core.getInput('description');
    const isPrivate = core.getInput('private') === 'true';
    const autoInit = core.getInput('auto_init') === 'true';
    const gitignoreTemplate = core.getInput('gitignore_template');
    const licenseTemplate = core.getInput('license_template');

    const client = new OctokitGitHubClient(token, orgName);
    const repoOps = new RepoOperations(client);

    let result;
    switch (operation.toLowerCase()) {
      case 'create':
        const options: RepoOperationOptions = {
          repositoryName,
          description,
          isPrivate,
          autoInit,
          gitignoreTemplate,
          licenseTemplate
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

    // Log result
    console.log(result.message);

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
  run();
}
