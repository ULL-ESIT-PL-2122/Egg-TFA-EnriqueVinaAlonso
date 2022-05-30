
const {compileToJsAndBeautify} = require("../../bin/egg.js");
const {runFromFile} = require("../../lib/eggvm.js");

console.log(compileToJsAndBeautify('test/compileToJS-tests/object.egg'));
