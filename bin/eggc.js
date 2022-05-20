#!/usr/bin/env node
'use strict';

 const fs = require('fs');
 const {program} = require('commander');
 const { parseFromFile } = require("../lib/eggvm.js");

 const {version} = require('../package.json');

 /**
 * A function that compiles a eggc file
 * @param {string} origin The name of the origin file
 * @param {string} destination The name of the destination file
 * @throws Will throw if there are errors in the program or if the files
 *     can't be opened
 */
const compile = (origin, destination = undefined) => {
  if (destination == undefined) {
    destination = origin.match(/^[^\.]*/)[0] + '.json';
  }

  const ast = parseFromFile(origin);

  console.log(ast);
  const astString = JSON.stringify(ast, null, 2);

  fs.writeFileSync(destination, astString);
};

 program
     .version(version)
     .arguments('<origin>')
     .option(
         '-o, --out <destination>', 'Path for output file. If it isn\'t ' +
         'specified the path of the origin file will be used,' +
         'changing the extension to .json',
     )
     .description(
         'Compile a Egg lang file',
         {
           origin: 'The path of the file to compile',
         },
     )
     .action((origin, options) => {
       try {
         compile(origin, options.out);
       } catch (err) {
         console.log('There was an error: ' + err.message);
       }
     });
 
 program.parse(process.argv);
