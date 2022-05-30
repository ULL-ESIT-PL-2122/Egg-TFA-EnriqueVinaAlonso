let insp = require("util").inspect;
let ins = (x) => insp(x, { depth: null });
let fs = require("fs");

const { specialForms, topEnv, cache, checkNegativeIndex } = require("./registry.js");
const { checkDeclarationsIn } = require("./scope.js");
const { Value, Word, Apply, Property } = require("./ast.js");
const { j2a, json2AST } = require('./j2a');

require("./egg-require.js");
require("./monkey-patch.js");

const parser = require('@ull-esit-pl-2122/egg-oop-parser-enrique-vina-alonso-alu0101337760');
const { parse, parseFromFile } = parser;


function evaluate(expr, env) {
  expr.evaluate(env);
}

specialForms['if'] = function (args, env) {
  if (args.length != 3) {
    throw new SyntaxError('Bad number of args to if');
  }

  if (args[0].evaluate(env) !== false) {
    return args[1].evaluate(env);
  } else {
    return args[2].evaluate(env);
  }
};

specialForms['while'] = function (args, env) {
  if (args.length !== 2) throw new Error('while requires two arguments');
  let condition = args[0];
  let body = args[1];

  while (condition.evaluate(env) !== false) {
    body.evaluate(env);
  }
  return false;
};

specialForms['do'] = function (args, env) {
  let value;

  argsdforEach(function (arg) {
    value = arg.evaluate(env);
  });

  return value;
};

specialForms[':='] = specialForms['def'] = specialForms['define'] = function (args, env) {
  if (args.length != 2 || (args[0].type != 'word' && args[0].type != 'property')) {
    throw new SyntaxError('Bad use of define');
  }

  let name = args[0].name;
  if(args[0].type == 'property'){
    name = args[0].evaluate(env).name;
  }

  let value = args[1].evaluate(env);
  env[name] = value;
  return value;
};

specialForms['->'] = specialForms['fun'] = function (args, env) {
  if (!args.length) {
    throw new SyntaxError('Functions need a body.')
  }

  function name(expr) {
    if (expr.type != 'word') {
      throw new SyntaxError('Arg names must be words');
    }

    return expr.name;
  }

  let paramNames = args.slice(0, args.length - 1).map(name);
  let body = args[args.length - 1];

  let jsFun = function (...args) {
    if (args.length > paramNames.length) {
      throw new TypeError(`Wrong number of arguments. Called with ${args.length} arguments and declared ${paramNames.length} parameters`);
    }

    let localEnv = Object.create(env);
    for (let i = 0; i < args.length; i++) {
      localEnv[paramNames[i]] = args[i];
    }

    return body.evaluate(localEnv);
  };
  jsFun.numParams = paramNames.length; // set other JS attributes as toString, etc.
  jsFun.ast = new Apply({ type: 'apply', operator: { type: 'word', name: 'fun' }, args: args })
  return jsFun;
};

specialForms['='] = specialForms['set'] = function (args, env) {
  if (args.length !== 2) {
    throw new SyntaxError(`Bad use of set '${JSON.stringify(args, null, 0)}.substring(0,20)}'`);
  }

  let valueTree = args[args.length - 1];
  let value = valueTree.evaluate(env);

  let leftSide = args[0];
  let [s, ...index] = leftSide.leftEvaluate(env);

  let last = index.length - 1
  for (let j = 0; j < last; j++) {
    index[j] = checkNegativeIndex(s, index[j]);
    s = s[index[j]];
  }
  index[last] = checkNegativeIndex(s, index[last]);
  s[index[last]] = value;

  return value;
}

specialForms['class'] = (args, env) => {
  if (args.length < 2) throw new SyntaxError('Error!: Class number of parameters must be at least 2');

  if (args[0].type !== 'word') throw new SyntaxError('Error!: First parameter must be a word');

  let className = args[0].name;
  args.shift();


  let propertiesTree = args;
  let newClass = {};
  newClass.new = function (...constructorArgs) {
    const instanceEnv = Object.create(env);
    const instance = {};
    instanceEnv["self"] = instance;
    let constructor;

    for (let i = 0; i < propertiesTree.length; i += 2) {
      let name = propertiesTree[i].getIndex() || propertiesTree[i].evaluate(instanceEnv);      
      let value = propertiesTree[i + 1].evaluate(instanceEnv);
      if (name === "constructor") {
        constructor = value;
        continue;
      }
      instance[name] = instanceEnv[name] = value;
    }

    if (constructor) {
      constructor(constructorArgs);      
    }

    return instance;
  }


  env[className] = newClass;

}

specialForms["object"] = (args, env) => {
  if (args.length % 2) {
    throw new Error("Invalid number of arguments for object");
  }

  const objEnv = Object.create(env);
  const obj = {};
  objEnv["self"] = obj;

  let name;
  let value;
  for (let i = 0; i < args.length; i += 2) {
    name = args[i].getIndex() || args[i].evaluate(objEnv);
    value = args[i + 1].evaluate(objEnv);
    obj[name] = objEnv[name] = value;
  }
  return obj;
};

specialForms['eval'] = function (args, env) {
  if (args.length != 1) {
    throw new SyntaxError("eval requires one argument");
  }
  let state = args[0].evaluate(env);
  return state.ast.evaluate(state.scope);
};

specialForms['scope'] = function (args, env) {
  return env;
};

topEnv["debug"] = false;
//debugger;
topEnv['null'] = null;
topEnv['true'] = true;
topEnv['false'] = false;
topEnv['undefined'] = undefined;

topEnv['RegExp'] = require('xregexp');
topEnv['fetch'] = require('node-fetch');
topEnv['fs'] = require('fs');
topEnv['Math'] = Math;
topEnv['Object'] = Object;
topEnv['path'] = require('path');
topEnv["process"] = process;
topEnv['parse'] = parse;

// For the scope analysis
topEnv.parent = function () { return Object.getPrototypeOf(this) };
topEnv.hasBinding = Object.hasOwnProperty;
// Warning!! with the current implementation Egg objects don't inherit from Object 
// and don't benefit monkey patching. See registry.js
topEnv["hasOwnProperty"] = Object.prototype.hasOwnProperty;

// monkey patching sub. 2022 deprecated
topEnv["sub"] = Object.prototype.sub;

// arithmetics
[
  '+',
  '-',
  '*',
  '/',
  '**',
].forEach(op => {
  /* fill in the rest of the code here */
  topEnv[op] = new Function('...s', `return s.reduce((a, b) => a ${op} b);`);
});

// comparison and logical
[
  '==',
  '<',
  '>',
  '&&',
  '||'
].forEach(op => {
  topEnv[op] = new Function('a, b', `return a ${op} b;`);
});

topEnv['print'] = function (...value) {
  let processed = value.map(v => {
    if (typeof v === "string") return v;
    else if (typeof v == "function") {
      let firstLines = v.toString().match(/.*/);
      return firstLines[0];
    }
    else if (topEnv["debug"]) return ins(v); // 
    else return JSON.stringify(v, null, 0);

  })
  console.log(...processed);
  return value.length === 1 ? value[0] : value;
};

topEnv["arr"] = topEnv["array"] = function (...args) {
  //debugger;
  return args;
};

topEnv["length"] = function (array) {
  return array.length;
};

topEnv["map"] = function (...args) {
  if (args.length % 2) throw new SyntaxError('Error!: Number of parameter must be even');
  let r = Object.create(null);
  r.sub = Object.prototype.sub;
  for (let i = 0; i < args.length; i += 2) {
    r[args[i]] = args[i + 1];
  }
  return r;
};

topEnv["++"] = new Function('x', `return x + 1`);
topEnv["--"] = new Function('x', `return x - 1`);

specialForms['for'] = function (args, env) {
  if (args.length != 4) {
    throw new SyntaxError(`Bad number of args to for`);
  }
  for (args[0].evaluate(env); args[1].evaluate(env); env[args[0].args[0].name] = args[2].evaluate(env)) {
    args[3].evaluate(env);
  }
  // Egg has no undefined so we return false when there's no meaningful result.
  return false;
};

specialForms['foreach'] = function (args, env) {
  if (args.length != 3) {
    throw new SyntaxError(`Bad number of args to foreach`);
  }
  for (env[args[0].name] of args[1].evaluate(env)) {
    args[2].evaluate(env);
  }
  // Egg has no undefined so we return false when there's no meaningful result.
  return false;
};

topEnv["<-"] = topEnv["element"] = function (array, ...index) {
  if (index.length < 1) throw new SyntaxError('Error!: provide at least one index for array "${array}" ');

  try {
    let target = array;
    for (let i of index) {
      let v = (i < 0) ? target.length + i : i; // i < 0 is false if "i" is a string
      target = target[v];
    }
    if ((target == undefined) || (target == null)) {
      throw Error(`Error indexing "${ins(array)}" with index "${ins(index)}". Accesing a non defined element!\n`);
    }
    return target;
  }
  catch (e) {
    throw new ReferenceError('Error indexing ' + ins(array) + " with indices " + ins(index) + "\n" + e);
  }
};



function run(program) {
  let env = Object.create(topEnv);
  let tree = parse(program);
  let js = json2AST(tree);
  return js.evaluate(env);
}

function runFromFile(fileName) {
  try {
    const ast = parseFromFile(fileName);
    let tree = json2AST(ast);
    let env = Object.create(topEnv);
    let result = tree.evaluate(env);

    return result;
  }
  catch (err) {
    console.log(err);
  }
}

function runFromEVM(fileName) {
  try {
    let json = fs.readFileSync(fileName, 'utf8');
    let treeFlat = JSON.parse(json);
    let tree = json2AST(treeFlat);
    let env = Object.create(topEnv);
    return tree.evaluate(env);
  }
  catch (err) {
    console.log(err);
  }
}

function compileToJS(fileName) {
  let topScope = Object.create(null);
  Object.keys(topEnv).forEach((key) => {
    topScope[key] = { declared: true };
  });

  let scope = Object.create(topScope);

  const template = (declarations, jsCode) => declarations.length ?
    `var ${declarations.join(',')}; ${jsCode}` :
    jsCode;

  try {
    let program = fs.readFileSync(fileName, 'utf8');
    let tree = parse(program);
    let jscode = j2a[tree.type](tree).generateJS(scope);
    checkDeclarationsIn(scope, "In global program");
    return template(Object.keys(scope), jscode);
  }
  catch (err) {
    console.log(err.message);
    process.exit(0);
  }
}



module.exports = { json2AST, run, runFromFile, runFromEVM, topEnv, specialForms, parser, evaluate, parseFromFile, compileToJS };
