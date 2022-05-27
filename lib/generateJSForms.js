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

generateJSForms['do'] = function (args, env) {
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


generateJSForms["fun"] = generateJSForms["->"] = function (args, scope) {
};

generateJSForms["="] = generateJSForms["set"] = function (args, scope) {
};

generateJSForms[':='] =
    generateJSForms['def'] =
    generateJSForms['define'] = function (args, scope) {
        if (args.length !== 2) {
            throw new Error('Wrong number of arguments for define');
        }
        let [name, value] = args.map(arg => arg.generateJS(scope));
        setAsDeclared(name, scope);
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