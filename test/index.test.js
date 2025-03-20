import { expect, test, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs/promises';
import { validateChangelog } from '../index.js';
import * as core from '@actions/core';

// Mock @actions/core
vi.mock('@actions/core', () => ({
  summary: {
    addRaw: vi.fn().mockReturnThis(),
    addList: vi.fn().mockReturnThis(),
    write: vi.fn().mockResolvedValue(undefined)
  }
}));

beforeEach(async () => {
  // Create a temporary CHANGELOG.md for testing
  const validChangelog = `# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

### Added
- New feature pending

### Changed
- Updated documentation

### Fixed
- Fixed a bug

## [1.0.0] - 2023-12-20
### Added
- Initial release
`;

  await fs.writeFile('CHANGELOG.md', validChangelog);
});

afterEach(async () => {
  // Clean up the temporary file
  try {
    await fs.unlink('CHANGELOG.md');
  } catch (error) {
    // Ignore errors if file doesn't exist
  }
  // Clear all mocks
  vi.clearAllMocks();
});

test('validates a correct changelog', async () => {
  const result = await validateChangelog();
  expect(result).toBe(true);
});

test('fails on missing changelog', async () => {
  await fs.unlink('CHANGELOG.md');
  await expect(() => validateChangelog()).rejects.toThrow();
});

test('fails on empty changelog', async () => {
  await fs.writeFile('CHANGELOG.md', '');
  await expect(() => validateChangelog()).rejects.toThrow();
});

test('validates unreleased section format', async () => {
  const invalidChangelog = `# Change Log

## [Unreleased]
- Invalid format
`;

  await fs.writeFile('CHANGELOG.md', invalidChangelog);
  await expect(() => validateChangelog()).rejects.toThrow();
});

test('validates unreleased sections are not all empty', async () => {
  const emptyUnreleasedChangelog = `# Change Log

## [Unreleased]

### Added

### Changed

### Fixed

## [1.0.0] - 2023-12-20
- Initial release
`;

  await fs.writeFile('CHANGELOG.md', emptyUnreleasedChangelog);
  await expect(() => validateChangelog()).rejects.toThrow();
});