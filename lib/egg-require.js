var fs = require('fs');
var readFile = (x) => fs.readFileSync(x, 'utf-8');
let insp = require("util").inspect;
let ins = (x) => insp(x, {depth:null});
const {specialForms, topEnv} = require("./registry.js");
const path = require("path");
let {json2AST} = require('./j2a.js')

let parser = require('@ull-esit-pl-2122/egg-oop-parser-enrique-vina-alonso-alu0101337760');
let parse = parser.parse;


function REQUIRE(args, env) {
  let name = args[0].value;
  if (name in REQUIRE.cache) {
    return REQUIRE.cache[name];
  }

  let program = readFile(name);
  let localEnv = Object.create(env);
  let tree = parse(program);
  let js = json2AST(tree);
  let result = js.evaluate(localEnv);
  REQUIRE.cache[name] = result;
  return result;
}
REQUIRE.cache = Object.create(null);

specialForms['require'] = REQUIRE;

module.exports = REQUIRE;



