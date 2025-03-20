import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import simpleGit from 'simple-git';
import * as core from '@actions/core';

function validateUnreleasedSection(content) {
  const unreleasedMatch = content.match(/## \[Unreleased\][^\n]*\n\n### Added\n([^#]*)\n### Changed\n([^#]*)\n### Fixed\n([^#]*)/);
  
  if (!unreleasedMatch) {
    return {
      valid: false,
      message: 'Unreleased section must follow the format: Added, Changed, Fixed'
    };
  }

  const [_, added, changed, fixed] = unreleasedMatch;
  const sections = {
    Added: added.trim(),
    Changed: changed.trim(),
    Fixed: fixed.trim()
  };

  const emptySections = Object.entries(sections)
    .filter(([_, content]) => !content)
    .map(([name]) => name);

  if (emptySections.length === 3) {
    return {
      valid: false,
      message: 'At least one of the sections (Added, Changed, Fixed) must contain changes'
    };
  }

  return { valid: true };
}

export async function validateChangelog(changelogPath = 'CHANGELOG.md', checkUpdated = false) {
  try {
    // Check if changelog exists
    const stats = await fs.stat(changelogPath);
    
    if (!stats.isFile()) {
      throw new Error('CHANGELOG.md is not a file');
    }

    // Read changelog content
    const content = await fs.readFile(changelogPath, 'utf8');

    // Basic validation rules
    const validationRules = [
      {
        test: content.length > 0,
        message: 'Changelog cannot be empty'
      },
      {
        test: content.includes('# Change Log'),
        message: 'Changelog must have a "Change Log" header'
      },
      {
        test: /## \[\d+\.\d+\.\d+\]/.test(content),
        message: 'Changelog must contain at least one semantic version header'
      },
      {
        test: content.includes('## [Unreleased]'),
        message: 'Changelog must contain an Unreleased section'
      }
    ];

    const failures = validationRules
      .filter(rule => !rule.test)
      .map(rule => rule.message);

    // Validate Unreleased section content
    const unreleasedValidation = validateUnreleasedSection(content);
    if (!unreleasedValidation.valid) {
      failures.push(unreleasedValidation.message);
    }

    // Check if changelog was updated in PR
    if (checkUpdated) {
      const git = simpleGit();
      const isGitRepo = await git.checkIsRepo();
      
      if (!isGitRepo) {
        const warning = '⚠️ Not a git repository, skipping update check';
        console.warn(chalk.yellow(warning));
        if (process.env.GITHUB_ACTIONS) {
          await core.summary.addRaw('### Warning\n').addRaw(warning).write();
        }
      } else {
        try {
          const diff = await git.diff(['origin/main', '--', changelogPath]);
          if (!diff) {
            failures.push('Changelog must be updated in this PR');
          }
        } catch (error) {
          const warning = `⚠️ Could not check changelog updates: ${error.message}`;
          console.warn(chalk.yellow(warning));
          if (process.env.GITHUB_ACTIONS) {
            await core.summary.addRaw('### Warning\n').addRaw(warning).write();
          }
        }
      }
    }

    if (failures.length > 0) {
      console.error(chalk.red('❌ Changelog validation failed:'));
      failures.forEach(failure => {
        console.error(chalk.red(`  - ${failure}`));
      });

      if (process.env.GITHUB_ACTIONS) {
        await core.summary
          .addRaw('### ❌ Changelog Validation Failed\n\n')
          .addRaw('The following issues were found:\n\n')
          .addList(failures)
          .write();
      }

      process.exit(1);
    }

    console.log(chalk.green('✅ Changelog validation passed'));
    
    if (process.env.GITHUB_ACTIONS) {
      await core.summary
        .addRaw('### ✅ Changelog Validation Passed\n\n')
        .addRaw(`- File: \`${changelogPath}\`\n`)
        .addRaw('- All validation rules passed\n')
        .write();
    }

    return true;
  } catch (error) {
    const errorMessage = error.code === 'ENOENT' 
      ? '❌ CHANGELOG.md file not found'
      : `❌ Error: ${error.message}`;

    console.error(chalk.red(errorMessage));

    if (process.env.GITHUB_ACTIONS) {
      await core.summary
        .addRaw('### ❌ Changelog Validation Error\n\n')
        .addRaw(errorMessage)
        .write();
    }

    process.exit(1);
  }
}