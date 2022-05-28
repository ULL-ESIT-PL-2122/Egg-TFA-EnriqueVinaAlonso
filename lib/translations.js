const {setAsDeclared, setAsUsed} = require('./scope.js');

let generateJSForms = Object.create(null);


['+', '-', '*', '/', '==', '<', '>', '&&', '||' ].forEach(op => {
    generateJSForms[op] = function(args, scope) {
      [left, right] = args.map(arg => arg.generateJS(scope));
      return `(${left} ${op} ${right})`;
    }
  });
  
  generateJSForms["print"] = function(args, scope) {
    let argsTranslated = args.map(arg => arg.generateJS(scope));
    return `runtimeSupport.print(${argsTranslated.join(',')})`;
  };
  
  generateJSForms["do"] = function(args, scope) {
    let argsTranslated = args.map(arg => arg.generateJS(scope));
    const lastOne = argsTranslated.pop();
    const template = (expressions, lastOne) => {
      return `(()=>{
        ${expressions.join(';\n')};
        return ${lastOne};
      })()`;
    }
    let temp = template(argsTranslated, lastOne);
    return temp;
  };
  
  generateJSForms["fun"] = generateJSForms["->"] = function(args, scope) {
    let newEnv = Object.create(scope);
    let body = args.pop().generateJS(newEnv);
    let params = args.map(arg => arg.generateJS(newEnv));
    return `function(${params}) { 
      ${body}      
    }`;
  };
  
  generateJSForms["="] = generateJSForms["set"] = function(args, scope) {
    if (args.length !== 2) {
      throw new Error('Wrong number of arguments for set');
  }
  let [left, right] = args.map(arg => arg.generateJS(scope));
  setAsUsed(scope, left);
  return `${left} = ${right}`;
  };
  
  generateJSForms[':='] = 
  generateJSForms['def'] = 
  generateJSForms['define'] = function(args, scope) {
    if (args.length !== 2) {
      throw new Error('Wrong number of arguments for define');
  }
  let [name, value] = args.map(arg => arg.generateJS(scope));
  setAsDeclared(scope, name);
  return `${name} = ${value}`;
  };
  

  whileReturnLast = function (args, scope) {
    if (args.length !== 2) {
        throw new Error('Wrong number of arguments for while');
    }
    let [cond, body] = args.map(arg => arg.generateJS(scope));
    let last = tempVal('last', scope);

    return `(()=>{
        while (${cond}) 
         ${last} = ${body};
        return ${last};
    })()`;
}

generateJSForms['while'] = function (args, scope) {
    return whileReturnLast(args, scope);
}

module.exports = { generateJSForms };