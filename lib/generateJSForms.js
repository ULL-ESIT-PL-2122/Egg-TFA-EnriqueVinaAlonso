const { setAsUsed, setAsDeclared, checkDeclarationsIn } = require('./scope.js');

let generateJSForms = Object.create(null);

['+', '-', '*', '/', '==', '<', '>', '&&', '||'].forEach(op => {
    generateJSForms[op] = function (args, env) {
        [left, right] = args.map(arg => arg.generateJS(env));
        return `(${left} ${op} ${right})`;
    }
});

generateJSForms['print'] = function (args, env) {
    let translatedArgs = args.map(arg => arg.generateJS(env));
    return `runtimeSupport.print(${translatedArgs})`;
}

generateJSForms['do'] = function(args, env) {
    let translatedArgs = args.map(arg => arg.generateJS(env));
    const lastOne = translatedArgs.pop();
    const template = (expressions, lastOne) => {
        return `(()=>{
            ${expressions.join(';\n')};
            return ${lastOne};
        })()`;
    }
    return template(translatedArgs, lastOne);
}