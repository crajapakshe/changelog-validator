# Changelog Validator

A GitHub Action and CLI tool to validate changelog files following the [Keep a Changelog](http://keepachangelog.com/) format.

## Features

- Validates the existence and format of CHANGELOG.md
- Ensures proper semantic versioning headers
- Validates Unreleased section structure (Added, Changed, Fixed)
- Checks if changelog was updated in pull requests
- Provides detailed validation feedback in GitHub Actions summary
- Can be used as both a CLI tool and GitHub Action

## CHANGELOG.md Format
```markdown
# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased] - yyyy-mm-dd

### Added

### Changed

### Fixed

## [1.0.0] - 2025-03-18

### Added

### Changed

### Fixed
```

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

## Local Docker Testing

To test the action locally using Docker:

1. Build the Docker image:
```bash
docker build -t changelog-validator .
```

2. Run the validator on a local changelog:
```bash
# Basic validation
docker run --rm -v $(pwd):/workspace -w /workspace changelog-validator

# With custom path
docker run --rm -v $(pwd):/workspace -w /workspace changelog-validator --path ./docs/CHANGELOG.md

# Check if updated (requires git)
docker run --rm -v $(pwd):/workspace -w /workspace changelog-validator --check-updated
```

Note: The `-v $(pwd):/workspace` flag mounts your current directory into the container's `/workspace` directory, making your files accessible to the validator.

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

### Test output
```markdown
stdout | test/index.test.js > validates a correct changelog
✅ Changelog validation passed

stderr | test/index.test.js > fails on missing changelog
❌ CHANGELOG.md file not found

stderr | test/index.test.js > fails on empty changelog
❌ Changelog validation failed:
  - Changelog cannot be empty
  - Changelog must have a "Change Log" header
  - Changelog must contain at least one semantic version header
  - Changelog must contain an Unreleased section
  - Unreleased section must follow the format: Added, Changed, Fixed

stderr | test/index.test.js > fails on empty changelog
❌ Error: process.exit unexpectedly called with "1"

stderr | test/index.test.js > validates unreleased section format
❌ Changelog validation failed:
  - Changelog must contain at least one semantic version header
  - Unreleased section must follow the format: Added, Changed, Fixed

stderr | test/index.test.js > validates unreleased section format
❌ Error: process.exit unexpectedly called with "1"

stderr | test/index.test.js > validates unreleased sections are not all empty
❌ Changelog validation failed:
  - At least one of the sections (Added, Changed, Fixed) must contain changes

stderr | test/index.test.js > validates unreleased sections are not all empty
❌ Error: process.exit unexpectedly called with "1"

 ✓ test/index.test.js (5 tests) 13ms

 Test Files  1 passed (1)
      Tests  5 passed (5)
   Start at  19:21:16
   Duration  317ms (transform 92ms, setup 0ms, collect 60ms, tests 13ms, environment 0ms, prepare 89ms)
```

## Contributions
Welcome contributions! Please visit [Contributing Guide](https://github.com/crajapakshe/changelog-validator/blob/main/CONTRIBUTING.md) for more details on how to get started.

Thank you to all the contributors who have helped make this project better:

[![Contributors](https://contrib.rocks/image?repo=crajapakshe/changelog-validator)](https://github.com/crajapakshe/changelog-validator/graphs/contributors)
