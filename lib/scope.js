function setAsUsed(scope, name) {
  if (!scope[name]) {
    scope[name] = { declared: false };
  }
  scope[name].used = true;
  return scope[name];
}

function setAsDeclared(scope, name) {
  if (!scope[name]) {
    scope[name] = { declared: true };
  }
  scope[name].declared = true;
  return scope[name];
}

function checkDeclarationsIn(localScope, message) {
  Object.keys(localScope).forEach((key) => {
    if (!localScope[key].declared) {
      //console.warn
      throw new TypeError(`Variable "${key.slice(1)}" is not declared. ${message ? message : ""}`);
    }
  })
}

let tempVarCounter = 0;
function tempVar(prefix, scope) {
let newTempVar = `${prefix}${tempVarCounter++}`;
setAsDeclared(scope, newTempVar);
return newTempVar;
}

module.exports = { setAsUsed, setAsDeclared, checkDeclarationsIn, tempVar };