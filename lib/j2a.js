const {j2a, json2AST, topEnv} = require("./registry.js");
const {Value, Word, Apply, Property} = require("./ast.js");

j2a['value'] = (j) => { 
  let obj = new Value(j);
  if (typeof obj.value === "object") {
    obj.value = new topEnv[obj.value.type](...obj.value.info);
  }
  return obj;
};
j2a['word']  = (j) => new Word(j);
j2a['apply'] = (j) => {
  let args = j.args.map( arg => json2AST(arg));
  let operator = json2AST(j.operator);
  let apply = {};
  apply.type = 'apply';
  apply.operator = operator;
  apply.args = args;
  return new Apply(apply);
};

j2a['property'] = (j) => {
  let obj = {
    type: 'property',
    args: [],
    operator: json2AST(j.operator),
  };
  obj.args = j.args.map(json2AST);
  return new Property(obj);
};

module.exports = { j2a, json2AST };