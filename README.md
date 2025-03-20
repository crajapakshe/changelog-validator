# Changelog Validator

A GitHub Action and CLI tool to validate changelog files following the [Keep a Changelog](http://keepachangelog.com/) format.

## Features

- Validates the existence and format of CHANGELOG.md
- Ensures proper semantic versioning headers
- Validates Unreleased section structure (Added, Changed, Fixed)
- Checks if changelog was updated in pull requests
- Provides detailed validation feedback in GitHub Actions summary
- Can be used as both a CLI tool and GitHub Action

## Usage as a GitHub Action

```yaml
name: Validate Changelog

on:
  pull_request:
    branches:
      - main
      - master

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Required for checking changelog updates
      
      - name: Validate Changelog
        uses: ./
        with:
          changelog-path: 'CHANGELOG.md'
          check-updated: 'true'
```

### Action Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `changelog-path` | Path to the changelog file | No | `CHANGELOG.md` |
| `check-updated` | Check if changelog was updated in PR | No | `true` |

## Usage as CLI Tool

```bash
# Install globally
npm install -g changelog-validator

# Run validation
changelog-validator

# Specify custom path
changelog-validator --path ./docs/CHANGELOG.md

# Check if updated (in git repository)
changelog-validator --check-updated
```

## Validation Rules

The validator ensures your changelog follows these rules:

1. File Requirements:
   - CHANGELOG.md must exist
   - File must not be empty
   - Must have a "Change Log" header

2. Version Headers:
   - Must contain at least one semantic version header (e.g., `## [1.0.0]`)
   - Must include an Unreleased section

3. Unreleased Section Format:
   - Must have three subsections: Added, Changed, Fixed
   - At least one of these sections must contain changes
   - Proper formatting required:
     ```markdown
     ## [Unreleased]
     
     ### Added
     - New features
     
     ### Changed
     - Changes in existing functionality
     
     ### Fixed
     - Bug fixes
     ```

4. Pull Request Validation:
   - When `check-updated` is enabled, ensures CHANGELOG.md was modified in the PR
   - Helps enforce changelog updates with each significant change

## GitHub Actions Integration

The validator can be used in two ways:

1. Standalone Changelog Validation:
```yaml
name: Validate Changelog
on: [pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: ./
        with:
          changelog-path: 'CHANGELOG.md'
          check-updated: 'true'
```

2. As Part of CI Pipeline:
```yaml
name: CI
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
      - uses: ./
        with:
          changelog-path: 'CHANGELOG.md'
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test
```

## License

MIT
```