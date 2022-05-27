let generateJSForms = Object.create(null);

['+', '-', '*', '/', '==', '<', '>', '&&', '||' ].forEach(op => {
    generateJSForms[op] = function(args, scope) {
    }
  });
  
  generateJSForms["print"] = function(args, scope) {
  };
  
  generateJSForms["do"] = function(args, scope) {
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