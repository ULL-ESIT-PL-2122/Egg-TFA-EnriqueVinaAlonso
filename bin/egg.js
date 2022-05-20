#!/usr/bin/env node
let fs = require('fs');
const {program} = require('commander');
const { version } = require('../package.json');
let {runFromFile}  = require('../lib/eggvm.js');
let eggRepl = require('../lib/egg-repl');

program
    .version(version)
    .name('eggc')
    .description('Compile a Egg lang file')
    .arguments("[filename]",  'The path of the file to compile')
    .option("-o, --out <fileout>",  "Path for output file. If it isn't specified the path of the origin file will be used,changing the extension to .json")
    .action((filename, options) => {
        if (filename && options) {
            runFromFile(filename);
        } else {
            eggRepl();
        }
    });
program.parse(process.argv);
