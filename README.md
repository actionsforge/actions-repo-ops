# actions-repo-ops

![Test](https://github.com/actionsforge/actions-repo-ops/actions/workflows/test.yml/badge.svg)
[![Build and Release](https://github.com/actionsforge/actions-repo-ops/actions/workflows/build-and-release.yml/badge.svg)](https://github.com/actionsforge/actions-repo-ops/actions/workflows/build-and-release.yml)

GitHub Action to manage repository operations (create, delete, archive) via the GitHub API

## Features

- Create new repositories with comprehensive settings
- Delete repositories safely
- Archive repositories while maintaining data
- Configurable repository settings including:
  - Basic settings (description, visibility, initialization)
  - Features (issues, projects, wiki, discussions)
  - Merge settings (squash, merge, rebase)
  - Branch protection rules
  - Team access control

## Required Permissions

The GitHub token used (`GH_REPO_TOKEN`) requires the following permissions:

### For Personal Access Tokens (Classic)

- `repo` - Required for all private repository operations
- `public_repo` - Required for public repository operations (can be used instead of `repo` for public repos)
- `delete_repo` - Required for repository deletion
- `write:org` - Required for managing team access to repositories
- `read:org` - Required for reading team information

Note: The following permissions are not required but may be included in your token:

- `repo:status` - For commit status access
- `repo_deployment` - For deployment status access
- `repo:invite` - For repository invitations
- `security_events` - For security events access

### For Fine-Grained Access Tokens

- "Administration" repository permissions (write) - Required for repository management
- "Organization" permissions (read and write) - Required for team access management

### Token Setup

1. Go to your GitHub organization settings
2. Navigate to "Developer settings" > "Personal access tokens" > "Tokens (classic)"
3. Generate a new token with the required scopes
4. Store the token securely in your repository secrets as `GH_REPO_TOKEN`

Note: For security best practices:

- Use the minimum required permissions
- Regularly rotate your tokens
- Never commit tokens to your repository
- Use repository secrets for token storage

## Usage

### Creating a Repository

```yaml
name: Create Repository

on:
  workflow_dispatch:
    inputs:
      repository_name:
        description: 'Name of the repository to create'
        required: true
        default: 'sample-repo'

jobs:
  create-repo:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Create Repository
        uses: actionsforge/actions-repo-ops@v1
        env:
          GH_REPO_TOKEN: ${{ secrets.GH_REPO_TOKEN }}
          GH_ORG_NAME: ${{ secrets.GH_ORG_NAME }}
        with:
          operation: create
          repository_name: ${{ inputs.repository_name }}
          description: "Created via GitHub Actions"
          private: true
          auto_init: true
          gitignore_template: Node
          license_template: mit
          homepage: "https://example.com"
          has_issues: true
          has_projects: true
          has_wiki: true
          has_discussions: true
          team_id: 123456
          allow_squash_merge: true
          allow_merge_commit: true
          allow_rebase_merge: true
          allow_auto_merge: true
          delete_branch_on_merge: true
          allow_update_branch: true
          default_branch: main
          use_squash_pr_title_as_default: true
          squash_merge_commit_title: PR_TITLE
          squash_merge_commit_message: PR_BODY
          merge_commit_title: PR_TITLE
          merge_commit_message: PR_BODY
```

---

### Deleting a repository

```yaml
name: Delete Repository

on:
  workflow_dispatch:
    inputs:
      repository_name:
        description: "Name of the repository to delete"
        required: true
        default: sample-repo

jobs:
  delete-repo:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Delete Repository
        uses: actionsforge/actions-repo-ops@v1
        env:
          GH_REPO_TOKEN: ${{ secrets.GH_REPO_TOKEN }}
          GH_ORG_NAME: ${{ secrets.GH_ORG_NAME }}
        with:
          operation: delete
          repository_name: ${{ inputs.repository_name }}
```

---

### Archiving a Repository

```yaml
name: Archive Repository

on:
  workflow_dispatch:
    inputs:
      repository_name:
        description: "Name of the repository to archive"
        required: true
        default: sample-repo

jobs:
  archive-repo:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Archive Repository
        uses: actionsforge/actions-repo-ops@v1
        env:
          GH_REPO_TOKEN: ${{ secrets.GH_REPO_TOKEN }}
          GH_ORG_NAME: ${{ secrets.GH_ORG_NAME }}
        with:
          operation: archive
          repository_name: ${{ inputs.repository_name }}
```

## Inputs

### Required Inputs

| Input | Description | Default |
|-------|-------------|---------|
| `operation` | Operation to perform (create/delete/archive) | - |
| `repository_name` | Name of the repository | - |
| `github_token` | GitHub token with repo scope | - |

### Optional Inputs

#### Basic Settings

| Input | Description | Default |
|-------|-------------|---------|
| `description` | Repository description | - |
| `private` | Make repository private | `false` |
| `auto_init` | Initialize with README | `false` |
| `gitignore_template` | Add .gitignore template | - |
| `license_template` | Add license template | - |
| `homepage` | Repository homepage URL | - |

#### Feature Settings

| Input | Description | Default |
|-------|-------------|---------|
| `has_issues` | Enable issues | `true` |
| `has_projects` | Enable projects | `true` |
| `has_wiki` | Enable wiki | `true` |
| `has_discussions` | Enable discussions | `false` |
| `team_id` | Team ID to grant access | - |

#### Merge Settings

| Input | Description | Default |
|-------|-------------|---------|
| `allow_squash_merge` | Allow squash merging | `true` |
| `allow_merge_commit` | Allow merge commits | `true` |
| `allow_rebase_merge` | Allow rebase merging | `true` |
| `allow_auto_merge` | Allow auto-merge | `false` |
| `delete_branch_on_merge` | Delete branch after merge | `false` |
| `allow_update_branch` | Allow branch updates | `false` |
| `default_branch` | Default branch name | `main` |
| `use_squash_pr_title_as_default` | Use PR title for squash merge | `false` |

#### Merge Commit Settings

| Input | Description | Options | Default |
|-------|-------------|---------|---------|
| `squash_merge_commit_title` | Squash merge commit title | `PR_TITLE`, `COMMIT_OR_PR_TITLE` | - |
| `squash_merge_commit_message` | Squash merge commit message | `PR_BODY`, `COMMIT_MESSAGES`, `BLANK` | - |
| `merge_commit_title` | Merge commit title | `PR_TITLE`, `MERGE_MESSAGE` | - |
| `merge_commit_message` | Merge commit message | `PR_BODY`, `PR_TITLE`, `BLANK` | - |

## Running via CLI

You can run repository operations directly via the command line by setting the required environment variables:

```bash
# Required environment variables
export GH_REPO_TOKEN="your-github-token"  # GitHub token with repo scope
export GH_ORG_NAME="your-org-name"        # Target organization name

# Run the action with required inputs
INPUT_OPERATION=create \
INPUT_REPOSITORY_NAME=test-repo \
INPUT_DESCRIPTION="Test repository" \
INPUT_PRIVATE=true \
INPUT_AUTO_INIT=true \
INPUT_GITIGNORE_TEMPLATE=Node \
INPUT_LICENSE_TEMPLATE=mit \
INPUT_HOMEPAGE="https://example.com" \
INPUT_HAS_ISSUES=true \
INPUT_HAS_PROJECTS=true \
INPUT_HAS_WIKI=true \
INPUT_HAS_DISCUSSIONS=true \
INPUT_TEAM_ID=123456 \
INPUT_ALLOW_SQUASH_MERGE=true \
INPUT_ALLOW_MERGE_COMMIT=true \
INPUT_ALLOW_REBASE_MERGE=true \
INPUT_ALLOW_AUTO_MERGE=true \
INPUT_DELETE_BRANCH_ON_MERGE=true \
INPUT_ALLOW_UPDATE_BRANCH=true \
INPUT_DEFAULT_BRANCH=main \
INPUT_USE_SQUASH_PR_TITLE_AS_DEFAULT=true \
INPUT_SQUASH_MERGE_COMMIT_TITLE=PR_TITLE \
INPUT_SQUASH_MERGE_COMMIT_MESSAGE=PR_BODY \
INPUT_MERGE_COMMIT_TITLE=PR_TITLE \
INPUT_MERGE_COMMIT_MESSAGE=PR_BODY \
node dist/index.js
```

### Available CLI Options

All inputs can be set as environment variables with the `INPUT_` prefix. See the Inputs section above for all available options.

## Outputs

| Output | Description |
|--------|-------------|
| `status` | Operation status (success/failure) |
| `message` | Operation result message |
| `repository_url` | URL of the created repository (create operation only) |

## Error Handling

The action handles various error cases gracefully:

- Repository already exists (treated as success)
- Repository not found (treated as success for delete/archive)
- Permission errors
- Invalid input parameters
- API rate limits
- Network errors

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
