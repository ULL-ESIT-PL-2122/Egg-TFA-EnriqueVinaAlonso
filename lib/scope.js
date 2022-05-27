function setAsUsed(scope, name) {
    if(!scope[name]) {
        scope[name] = {decladred: false};
    }
    scope[name].used = true;
    return scope[name];
}

function setAsDeclared(scope, name) {
}

function checkDeclarationsIn(localScope, message) {
    Object.keys(localScope).forEach((key) => {
      if (!localScope[key].declared) {
        //console.warn
        throw new TypeError(`Variable "${key.slice(1)}" is not declared. ${message? message : ""}`);
      }
    })
  }

module.exports = {setAsUsed, setAsDeclared, checkDeclarationsIn};