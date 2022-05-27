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
  };
  
  generateJSForms["="] = generateJSForms["set"] = function(args, scope) {
  };
  
  generateJSForms[':='] = 
  generateJSForms['def'] = 
  generateJSForms['define'] = function(args, scope) {
  };
  

module.exports = { generateJSForms };