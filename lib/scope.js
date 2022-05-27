function setAsUsed(scope, name) {
    if(!scope[name]) {
        scope[name] = {decladred: false};
    }
    scope[name].used = true;
    return scope[name];
}

function setAsDeclared(scope, name) {
}

function checkDeclarations(scope) {

}

module.exports = {setAsUsed, setAsDeclared, checkDeclarations};