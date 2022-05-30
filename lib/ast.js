const inspect = require("util").inspect;
const ins = (x) => inspect(x, { depth: null });

const { json2AST, specialForms, checkNegativeIndex } = require("./registry.js");
const { setAsUsed } = require('./scope.js');
const { generateJSForms } = require('./translations.js');

class Value {
  constructor(token) {
    this.type = token.type;
    this.value = token.value;
  }
  evaluate() {
    return this.value;
  }

  leftEvaluate(env) {
    throw new SyntaxError('Can not assign to a constant variable');
  }

  getIndex() {
    return this.value;
  }

  generateJS() {
    if (typeof this.value === 'number') {
      return this.value;
    }
    return `'${this.value}'`;
  }

}

class Word {
  constructor(token) {
    this.type = token.type || "word";
    this.name = token.name;
  }

  evaluate(env) {
    if (this.name in env) {
      return env[this.name];
    } else {
      throw new ReferenceError(`Undefined variable: ${this.name}`);
    }
  }

  getIndex() {
    return this.name;
  }

  leftEvaluate(env) {
    let valName = this.name;
    for (let scope = env; scope; scope = Object.getPrototypeOf(scope)) {
      if (scope.hasOwnProperty(valName)) {
        return [scope, valName];
      }
    }
    throw new Error(`Tried setting an undefined variable ${this.name}`);
  }

  generateJS(scope) {
    let eggName = '$' + this.name;
    setAsUsed(scope, eggName);
    return eggName;
  }

}

class Apply {
  constructor(tree) {
    this.type = tree.type;
    this.operator = tree.operator;
    this.args = tree.args;
  }

  evaluate(env) {
    if (this.operator.type == 'word' && this.operator.name in specialForms) {
      return specialForms[this.operator.name](this.args, env);
    }
    //debugger;
    try {
      let op = this.operator.evaluate(env);
      let args = this.args.map(arg => arg.evaluate(env));
      if (typeof op === 'function') {
        return op(...args);
      }

    } catch (e) {
      throw new TypeError('Applying not a function or method ' + e);
    }
  }

  leftEvaluate(env) {
    // Invalid left-hand side in assignment
    /*
    let left = this.evaluate(env);
    if (typeof left == "string") return new Word({name: left}).leftEvaluate(env);
    else if (typeof left == 'object') return left; */
    throw new TypeError(`Invalid left side of assignment. Expected function to return a string, got ${ins(left)}`);
  }

  generateJS(scope) {
    if (this.operator.type === 'word') {
      //comprobamos si es una función de egg
      if (generateJSForms[this.operator.name]) {
        return generateJSForms[this.operator.name](this.args, scope);
      }
      else {
        let opTranslation = this.operator.generateJS(scope);
        // si ha sido declarado
        if (opTranslation && scope[opTranslation].declared) {
          let argsTranslated = this.args.map(arg => arg.generateJS(scope));
          return `${opTranslation}(${argsTranslated})`;
        }
        // si no está declarado, damos un warning, error si es un special forms
        else if (opTranslation && !scope[opTranslation].declared) {
          if (this.operator.name in specialForms) {
            let errorMsg = `Translation of "${this.operator.name}" not implemented yet.\n`;
            console.error(errorMsg);
            process.exit(1);
          }
          console.warn(`Warning: Non declared symbol "${this.operator.name}" used as function.\n`);
          let argsTranslated = this.args.map(arg => arg.generateJS(scope));
          return `${opTranslation}(${argsTranslated})`;
        }

        else {
          let errMsg = `Fatal error.\n` +
            `AST=${JSON.stringify(this)}.\nscope=${JSON.stringify(scope)}.\n`;
          console.error(errMsg);
          process.exit(0);
        }
      }
    } else if (this.operator.type == 'apply') {
      let argsTranslated = this.args.map(arg => arg.generateJS(scope));
      return `${this.operator.generateJS(scope)}(${argsTranslated})`;
    }
    else if (this.operator.type == 'property') {
      let opTranslation = this.operator.generateJS(scope);
      let argsTranslated = this.args.map(arg => arg.generateJS(scope));
      return `${opTranslation}(${argsTranslated})`;

    }
  }
}

class Property {
  constructor(tree) {
    this.type = tree.type;
    this.operator = tree.operator;
    this.args = tree.args;
  }

  evaluate(env) {
    if (this.operator.type == "word" && this.operator.name in specialForms) {
      // Is there any meaning for s.t. like while[<(x,4), ... ]?
      this.type = "apply";
      let applyFromProp = new Apply(this);
      return { ast: applyFromProp, scope: env };
    }

    let theObject = this.operator.evaluate(env);
    let propsProcessed = this.args.map((arg) => arg.evaluate(env));
    let propName = checkNegativeIndex(theObject, propsProcessed[0]);

    if (theObject[propName] || propName in theObject) {
      // theObject has a property with name "propName"
      // Write here the code to get the specified property
      let obj = theObject;
      propsProcessed.forEach((element) => {
        let oldObj = obj;
        element = checkNegativeIndex(obj, element);
        obj = obj[element];
        if (typeof obj === "function") {
          obj = obj.bind(oldObj);
        }
      })
      return obj;
    } else if (typeof theObject === "function") {
      // theObject is a function, curry the function
      return (...args) => theObject(...propsProcessed, ...args);
    } else {
      throw new TypeError(`Evaluating properties for Object "${JSON.stringify(theObject)}" properties: "${JSON.stringify(propsProcessed)}"`);
    }
  }

  leftEvaluate(env) {
    /* fill in the rest of the code here */
    // Interpret s.t. as a[2,3].b in the expression =(a[2,3].b, 4) 
    let left = this.operator.evaluate(env);
    if (typeof left !== "object") {
      throw new TypeError("Left side of an assignment must be a reference! and is" + typeof left + " " + left);
    }
    let leftIndex = this.args.map(index => index.evaluate(env));
    return [left, ...leftIndex];
  }

  generateJS(scope) {
    let left = this.operator.name == 'self' ? 'this' : this.operator.generateJS(scope);
    return left + '[' + this.args.map(arg => arg.generateJS()).join('.') + ']';
  }
}

module.exports = { Value, Word, Apply, Property };
