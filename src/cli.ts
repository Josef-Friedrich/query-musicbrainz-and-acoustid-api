#! /usr/bin/env node

import { Command } from 'commander'

import { openAcoustIdWithMultipleRecordings } from './lib.js'

const program = new Command()

program
  .name('musicbrainz.js')
  .description('CLI to some JavaScript string utilities')
  .version('0.1.0')

program
  .command('merge-recording')
  .description('Merge recordings of a release')
  .argument('<musicbrainz-release-id>', 'A musicbrainz release id')
  .action(async (releaseId: string) => {
    await openAcoustIdWithMultipleRecordings(releaseId)
  })

program.parse()
