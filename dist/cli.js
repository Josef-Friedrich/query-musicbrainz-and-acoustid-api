#! /usr/bin/env node
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Command } from 'commander';
import { openAcoustIdWithMultipleRecordings } from './lib.js';
const program = new Command();
program
    .name('musicbrainz.js')
    .description('CLI to some JavaScript string utilities')
    .version('0.1.0');
program
    .command('merge-recording')
    .description('Merge recordings of a release')
    .argument('<musicbrainz-release-id>', 'A musicbrainz release id')
    .action((releaseId) => __awaiter(void 0, void 0, void 0, function* () {
    yield openAcoustIdWithMultipleRecordings(releaseId);
}));
program.parse();
