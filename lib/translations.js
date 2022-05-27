let generateJSForms = Object.create(null);

['+', '-', '*', '/', '==', '<', '>', '&&', '||' ].forEach(op => {
    generateJSForms[op] = function(args, scope) {

    }
  });
  
  generateJSForms["print"] = function(args, scope) {
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