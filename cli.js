#!/usr/bin/env node

import { Command } from 'commander';
import { validateChangelog } from './index.js';

const program = new Command();

program
  .name('changelog-validator')
  .description('Validates the presence and format of CHANGELOG.md')
  .option('-p, --path <path>', 'path to changelog file', 'CHANGELOG.md')
  .option('-u, --check-updated', 'check if changelog was updated in PR', false)
  .action(async (options) => {
    await validateChangelog(options.path, options.checkUpdated);
  });

program.parse();