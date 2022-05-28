#!/usr/bin/env node
let fs = require('fs');
const { program } = require('commander');
const { version } = require('../package.json');
let { runFromFile, compileToJS } = require('../lib/eggvm.js');
const jsBeautify = require('js-beautify');
const jsBeautifyConfig = {
  indent_size: 2,
  space_in_empty_paren: true,
  end_with_newline: true,
  preserve_newlines: false
}

const compileToJsAndBeautify = (eggFile) => {
  let compiledJS = `
    const path = require('path');
    const runtimeSupport = require(
      path.join(
        '${__dirname}', 
        "..", 
        "lib", 
        "runtime-support"
      )
    );
    
    ${compileToJS(eggFile)}
    `;

  let compiledJSBW = jsBeautify(compiledJS, jsBeautifyConfig);
  return compiledJSBW;
}

program
  .version(version)
  .name('eggc')
  .description('Compile a Egg lang file')
  .arguments("[filename]", 'The path of the file to compile')
  .option("-j, --js <fileout>", "Path for output file. If it isn't specified the path of the origin file will be used,changing the extension to .js")
  .action((filename, options) => {
    if (filename && options.js) {
      let compiledJS = compileToJsAndBeautify(filename);
      console.log(compiledJS);
      console.log('\n\nResult = ' + eval(compiledJS));

    } else if (filename) {
      runFromFile(filename);
    }
    else {
      console.log('No file specified');
    }
  });
program.parse(process.argv);


