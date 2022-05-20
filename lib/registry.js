const inspect = require('util').inspect;
const ins = (x) => inspect(x, {depth: 2});
let specialForms = Object.create(null); // Egg objects don't inherit from Object if create(null)
let topEnv = Object.create(null);

// From JSON to AST map
let j2a = Object.create(null);
function json2AST(node) { // Generic JSON traversing building the AST
  if( node && node.type && node.type in j2a ) {
    const object = j2a[node.type](node);
    return object;
  }
  throw new Error(`Unknown node type ${ins(node)}`);
}
 
function checkNegativeIndex(obj, element) {
  if (Array.isArray(obj) &&  element < 0 ) {
    element += obj.length;
  }
  return element;
}

module.exports = {specialForms, topEnv, j2a, json2AST, checkNegativeIndex};
