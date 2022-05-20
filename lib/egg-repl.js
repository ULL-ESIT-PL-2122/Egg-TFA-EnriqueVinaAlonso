const XRegExp = require('xregexp');
let inspect = require("util").inspect;
let ins = (x) => inspect(x, {depth: null});
let readline = require('readline');
let egg  = require('./eggvm.js');
const {eggExit, help} = require("./extensions"); // extend eggvm
let topEnv = egg.topEnv;
let specialForms = egg.specialForms;
let parser = egg.parser;
let parse = parser.parse;
const {BLUE, RED, DEFAULT, blue, red} = require("./colors.js");
const PROMPT = DEFAULT+"> ";


// Check if program is empty
const ALLWHITE = new XRegExp("^"+egg.parser.SPACE.source+"$");
const LP = parser.LP;
const RP = parser.RP;
const getTokens = parser.getTokens;
const parBalance = parser.parBalance;

const put = egg.topEnv.print; /* (r) => {
  if (typeof r === 'string') console.log(r)
  else console.log(ins(r));
}; */

function eggRepl() {
  let program = "";
  let stack = 0;
  try {
    // rl interface
    let rl = readline.createInterface({input: process.stdin, output: process.stdout, completer});
    rl.prompt(PROMPT); console.log("Version "+topEnv["version"]);
    rl.prompt();

    rl.on('line', function(line) {
      stack += parBalance(line);

      /* line  does not include the \n */
      line = line + '\n';
      program += line;

      if (stack <= 0 && !ALLWHITE.test(program)) {
        try {
          let r = parse(program).evaluate(topEnv);
          //console.log(program);
          put(r);
        } catch (e) {
          console.log(red(e.message));
        }
        program = "";
        stack = 0;
      }
      rl.setPrompt(PROMPT + "..".repeat(stack));
      rl.prompt();

    });
    rl.on('close', eggExit);
    
    rl.on('SIGINT', () => {
      console.log(red("Expression discarded!"));
      program = "";
      stack = 0;
      rl.clearLine(process.stdout)
      rl.setPrompt(PROMPT);
      rl.prompt();
    });
   

  }
  catch (err) {
    console.log(red(err));
    help();
  }

  process.stdin.on("end", eggExit);


  /*
     Used for Tab autocompletion 
     The completer function takes the current line entered by the user as an argument,
     and returns an Array with 2 entries:
        - An Array with matching entries for the completion.
        - The substring that was used for the matching.
  */
  function completer(line) {
    let tokens = getTokens(line);
    var word = tokens.filter((t) => t && t.type === 'WORD').pop().value;
    
    let allKeys = Object.keys(specialForms).concat(Object.keys(topEnv));
    var hits = allKeys.filter((key) => key.startsWith(word));
    return [hits, word];
  }
}

module.exports = eggRepl;


