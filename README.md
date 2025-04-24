# actions-repo-ops

![Test](https://github.com/actionsforge/actions-repo-ops/actions/workflows/test.yml/badge.svg)
[![Build and Release](https://github.com/actionsforge/actions-repo-ops/actions/workflows/build-and-release.yml/badge.svg)](https://github.com/actionsforge/actions-repo-ops/actions/workflows/build-and-release.yml)

GitHub Action to manage repository operations (create, delete, archive) via the GitHub API

## Features

- Create new repositories with standard settings
- Delete repositories safely
- Archive repositories while maintaining data
- Configurable basic repository settings (visibility, init files, etc.)

## Usage

### Creating a Repository (Inline YAML Input)

```yaml
name: Create Repository
on:
  workflow_dispatch:
    inputs:
      repositories:
        description: 'Repository configurations'
        required: true

jobs:
  create-repo:
    runs-on: ubuntu-latest
    steps:
      - name: Create Repository
        uses: actionsforge/actions-repo-ops@v1
        with:
          operation: create
          repositories: ${{ github.event.inputs.repositories }}
          github_token: ${{ secrets.GH_GITHUB_TOKEN }}
```

### Creating a Repository from File

```yaml
# repos.yml
repositories:
  - name: service-a
    description: "Service A Repository"
    private: true
    auto_init: true
    gitignore_template: Node
    license_template: mit
  - name: service-b
    description: "Service B Repository"
    private: true
    auto_init: true
```

---

```yaml
name: Create Repository from File
on:
  workflow_dispatch:
    inputs:
      config_file:
        description: 'Path to repository configuration file'
        required: true
        default: 'repos.yml'

jobs:
  create-repos:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Read config file
        id: config
        uses: actions/github-script@v7
        with:
          script: |
            const yaml = require('yaml')
            const fs = require('fs')
            const config = yaml.parse(fs.readFileSync('${{ github.event.inputs.config_file }}', 'utf8'))
            return config.repositories

      - name: Create Repository
        uses: actionsforge/actions-repo-ops@v1
        env:
          REPOS: ${{ steps.config.outputs.result }}
        with:
          operation: create
          config_file: ${{ github.event.inputs.config_file }}
          github_token: ${{ secrets.GH_GITHUB_TOKEN }}
```

### Deleting a repository (Inline YAML Input)

```yaml
name: Delete Repository
on:
  workflow_dispatch:
    inputs:
      repositories:
        description: 'Repository configurations (names only)'
        required: true
        default: |
          - name: service-a
          - name: service-b

jobs:
  delete-repos:
    runs-on: ubuntu-latest
    steps:
      - name: Delete Repository
        uses: actionsforge/actions-repo-ops@v1
        with:
          operation: delete
          repositories: ${{ github.event.inputs.repositories }}
          github_token: ${{ secrets.GH_GITHUB_TOKEN }}
```

---

### Deleting a Repository from File

```yaml
# repos.yml
repositories:
  - name: service-a
  - name: service-b
```

---

```yaml

name: Delete Repository from File
on:
  workflow_dispatch:
    inputs:
      config_file:
        description: 'Path to repository configuration file'
        required: true
        default: 'repos.yml'

jobs:
  delete-repos:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Read config file
        id: config
        uses: actions/github-script@v7
        with:
          script: |
            const yaml = require('yaml')
            const fs = require('fs')
            const config = yaml.parse(fs.readFileSync('${{ github.event.inputs.config_file }}', 'utf8'))
            return config.repositories

      - name: Delete Repositories
        uses: actionsforge/actions-repo-ops@v1
        env:
          REPOS: ${{ steps.config.outputs.result }}
        with:
          operation: delete
          config_file: ${{ github.event.inputs.config_file }}
          github_token: ${{ secrets.GH_GITHUB_TOKEN }}
```

---

### Archiving a Repository (Inline YAML Input)

```yaml
name: Archive Repository
on:
  workflow_dispatch:
    inputs:
      name:
        description: 'Repository name'
        required: true

jobs:
  archive-repo:
    runs-on: ubuntu-latest
    steps:
      - name: Archive Repository
        uses: actionsforge/actions-repo-ops@v1
        with:
          operation: archive
          repository_name: ${{ github.event.inputs.name }}
          github_token: ${{ secrets.GH_GITHUB_TOKEN }}
```

---

### Archiving a Repository from File (Inline YAML Input)

```yaml
name: Archive Repository from File
on:
  workflow_dispatch:
    inputs:
      config_file:
        description: 'Path to repository configuration file'
        required: true
        default: 'repos.yml'

jobs:
  archive-repos:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Read config file
        id: config
        uses: actions/github-script@v7
        with:
          script: |
            const yaml = require('yaml')
            const fs = require('fs')
            const config = yaml.parse(fs.readFileSync('${{ github.event.inputs.config_file }}', 'utf8'))
            return config.repositories

      - name: Archive Repository
        uses: actionsforge/actions-repo-ops@v1
        env:
          REPOS: ${{ steps.config.outputs.result }}
        with:
          operation: archive
          config_file: ${{ github.event.inputs.config_file }}
          github_token: ${{ secrets.GH_GITHUB_TOKEN }}
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `operation` | Operation to perform (create/delete/archive) | Yes | - |
| `repository_name` | Name of the repository | Yes | - |
| `description` | Repository description | No | - |
| `private` | Make repository private | No | `false` |
| `auto_init` | Initialize with README | No | `false` |
| `gitignore_template` | Add .gitignore template | No | - |
| `license_template` | Add license template | No | - |
| `github_token` | GitHub token with repo scope | Yes | - |

## Running via CLI

You can run repository operations directly via the command line by setting the required environment variables:

```bash
# Required environment variables
export GH_ORG_TOKEN="your-github-token"  # GitHub token with repo scope
export GH_ORG_NAME="your-org-name"       # Target organization name

# Run the action with required inputs
INPUT_OPERATION=create \
INPUT_REPOSITORY_NAME=test-repo \
node dist/index.js
```

### Available CLI Options

Set these as environment variables with the `INPUT_` prefix:

| Environment Variable        | Description                              | Required | Example           |
|----------------------------|------------------------------------------|----------|-------------------|
| `INPUT_OPERATION`          | Operation to perform (create/delete/archive) | Yes      | `create`          |
| `INPUT_REPOSITORY_NAME`    | Name of the repository                   | Yes      | `test-repo`       |
| `INPUT_DESCRIPTION`        | Repository description                   | No       | `"Test repository"` |
| `INPUT_PRIVATE`            | Make repository private                  | No       | `true`            |
| `INPUT_AUTO_INIT`          | Initialize with README                   | No       | `true`            |
| `INPUT_GITIGNORE_TEMPLATE` | Add .gitignore template                  | No       | `Node`            |
| `INPUT_LICENSE_TEMPLATE`   | Add license template                     | No       | `mit`             |
| `INPUT_GITHUB_TOKEN`       | GitHub token with repo scope             | Yes      | `${{ secrets.GH_GITHUB_TOKEN }}` |
| `INPUT_REPOSITORIES`       | YAML list of repositories (inline mode)  | Yes (if file not used) | `- name: repo-a` |
| `INPUT_CONFIG_FILE`        | Path to config file (file mode)          | Yes (if inline not used) | `repos.yml`     |
