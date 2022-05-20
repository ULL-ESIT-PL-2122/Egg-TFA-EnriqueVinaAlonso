#!/usr/bin/env node
var {runFromEVM}  = require('../lib/eggvm.js');
const {program} = require('commander');
const { version } = require('../package.json');

program
    .version(version)
    .name('eggc')
    .description('Compile a Egg lang file')
    .arguments("[filename]",  'The path of the file to compile')
    .option("-o, --out <fileout>",  "Path for output file. If it isn't specified the path of the origin file will be used,changing the extension to .json")
    .action((filename, options) => {
        if (filename && options) {
            runFromEVM(filename);
        } else {
            console.log("No se especifico argumentos");
        }
    });
program.parse(process.argv);