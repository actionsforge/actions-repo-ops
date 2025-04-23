# actions-repo-ops

![Test](https://github.com/actionsforge/actions-repo-ops/actions/workflows/test.yml/badge.svg)
[![Build and Release](https://github.com/actionsforge/actions-repo-ops/actions/workflows/build-and-release.yml/badge.svg)](https://github.com/actionsforge/actions-repo-ops/actions/workflows/build-and-release.yml)

GitHub Action to manage repository operations (create, delete, archive) using standardized configurations via GitHub API.

## Features

- Create new repositories with standardized settings
- Support for repository templates via configuration files
- Delete repositories safely
- Archive repositories while maintaining data
- Configurable repository settings (visibility, init files, etc.)

## Usage

### Using Configuration Files

You can define repository templates in YAML configuration files:

```yaml
# .github/repo-templates/service-template.yml
name: service-{name}
description: "Microservice for {description}"
visibility: private
settings:
  has_issues: true
  has_projects: true
  has_wiki: false
  delete_branch_on_merge: true
  allow_squash_merge: true
  allow_merge_commit: false
  allow_rebase_merge: false
branches:
  main:
    protection:
      required_status_checks:
        strict: true
        contexts: ["build", "test"]
      required_pull_request_reviews:
        required_approving_review_count: 1
      enforce_admins: true
files:
  - path: .github/workflows/ci.yml
    content: |
      name: CI
      on: [push, pull_request]
      jobs:
        build:
          runs-on: ubuntu-latest
          steps:
            - uses: actions/checkout@v4
  - path: README.md
    content: |
      # {name}
      {description}
```

### Creating a Repository from Template

```yaml
name: Create Service Repository
on:
  workflow_dispatch:
    inputs:
      name:
        description: 'Service name'
        required: true
      description:
        description: 'Service description'
        required: true

jobs:
  create-repo:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Create Repository from Template
        uses: actionsforge/actions-repo-ops@v1
        with:
          operation: create
          template_file: .github/repo-templates/service-template.yml
          template_vars: |
            name: ${{ github.event.inputs.name }}
            description: ${{ github.event.inputs.description }}
          github_token: ${{ secrets.GH_GITHUB_TOKEN }}
```

### Bulk Repository Creation

You can also create multiple repositories using a configuration file:

```yaml
# repos-config.yml
repositories:
  - name: frontend-service
    template: service-template
    vars:
      description: "Frontend application service"
  - name: auth-service
    template: service-template
    vars:
      description: "Authentication service"
  - name: api-gateway
    template: service-template
    vars:
      description: "API Gateway service"
```

```yaml
name: Create Multiple Repositories
on:
  workflow_dispatch:

jobs:
  create-repos:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Create Repositories
        uses: actionsforge/actions-repo-ops@v1
        with:
          operation: create-bulk
          config_file: repos-config.yml
          github_token: ${{ secrets.GH_GITHUB_TOKEN }}
```

## Configuration File Reference

### Template Variables

Templates support the following variable substitutions:

- `{name}`: Repository name
- `{description}`: Repository description
- `{year}`: Current year
- `{owner}`: Organization or user name
- Custom variables via `template_vars`

### Repository Settings

```yaml
# Full configuration reference
name: string                 # Required: Repository name
description: string         # Optional: Repository description
visibility: string         # Optional: private or public
settings:
  has_issues: boolean
  has_projects: boolean
  has_wiki: boolean
  has_downloads: boolean
  delete_branch_on_merge: boolean
  allow_squash_merge: boolean
  allow_merge_commit: boolean
  allow_rebase_merge: boolean
  allow_auto_merge: boolean
branches:
  main:                    # Branch name
    protection:
      required_status_checks:
        strict: boolean
        contexts: string[]
      required_pull_request_reviews:
        required_approving_review_count: number
      enforce_admins: boolean
files:                     # Files to create
  - path: string
    content: string
labels:                    # Issue labels to create
  - name: string
    color: string
    description: string
topics: string[]           # Repository topics
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `operation` | Operation to perform (create/create-bulk/delete/archive) | Yes | - |
| `template_file` | Path to template file | No | - |
| `config_file` | Path to bulk configuration file | No | - |
| `template_vars` | YAML/JSON string of template variables | No | - |
| `repository_name` | Name of the repository (not needed with config_file) | No | - |
| `github_token` | GitHub token with repo scope | Yes | - |

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
