#!/usr/bin/env node
let fs = require('fs');
const { program } = require('commander');
const { version } = require('../package.json');
let { runFromFile, translateToJs } = require('../lib/eggvm.js');
let eggRepl = require('../lib/egg-repl');

program
    .version(version)
    .name('eggc')
    .description('Compile a Egg lang file')
    .arguments("[filename]", 'The path of the file to compile')
    .option("-j, --js <fileout>", "Path for output file. If it isn't specified the path of the origin file will be used,changing the extension to .js")
    .action((filename, options) => {
        if (filename && options.js) {
           console.log(translateToJs(filename));
        } else if (filename) {
            runFromFile(filename);
        } else {
            eggRepl();
        }
    });
program.parse(process.argv);
