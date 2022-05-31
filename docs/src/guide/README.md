# EGGXTENDED

[COVERAGE](../coverage/lcov-report/)


## Clases en egg:

### Idea principal

La lógica a seguir para implmenter una clase en egg es bastante similar a la que ya hemos seguido para implementar objetos, la diferencia es que la declaración de una clase creará un objeto en el entorno dado que almacene cada una de las properties de la clase, de forma similar a un objeto. La principal diferencia es que este objeto definición de clase tendrá un método `new` que permitirá crear una instancia de la clase.

### Sintaxis
La sintaxis propuesta es la siguiente: 

```egg
class( point, 
    x: 0,
    y: 0, 
    moveUp: fun(
            =(
                self["y"],
                +(self["y"], 1)
            )                
        ),
    constructor: fun(x, y, 
        do(
            =(self["x"], x),
            =(self["y"], y)
        )
    )
)
```

El primer parámetro de `class` será un nombre de clase, luego se definirán las propiedades de la clase.
Además no es necesario que la clase tenga un constructor, se puede simplmemente definir los valores por defecto a cada atributo.

### Implementación
La implmentación prouesta es la siguiente: 

```js	
specialForms['class'] = (args, env) => {
  if (args.length < 2) throw new SyntaxError('Error!: Class number of parameters must be at least 2');
  if (args[0].type !== 'word') throw new SyntaxError('Error!: First parameter must be a word');

  let className = args[0].name;
  args.shift();

  if (args.length % 2 != 0) throw new SyntaxError('Error!: Class must have pairs of property names and property values');

  let propertiesTree = args;
  let newClass = {};
  newClass.new = function (...constructorArgs) {
    const instanceEnv = Object.create(env);
    const instance = {};
    instanceEnv["self"] = instance;
    let constructor;

    for (let i = 0; i < propertiesTree.length; i += 2) {
      let name = propertiesTree[i].getIndex() || propertiesTree[i].evaluate(instanceEnv);      
      let value = propertiesTree[i + 1].evaluate(instanceEnv);
      if (name === "constructor") {
        constructor = value;
        continue;
      }
      instance[name] = instanceEnv[name] = value;
    }

    if (constructor) {
      constructor(...constructorArgs);      
    }
    return instance;
  }
  env[className] = newClass;
}
```

Añadiremos una nueva función `class` a `specialForms`, las primeras líneas de la función están destinadas a comprobar que los argumentos son correctos, y a la extracción del nombre de la nueva clase a definir. A continuación se definirá un objeto `newClass` que contendrá un método `new` que permitirá crear una instancia de la clase.

El método new recibirá como argumentos, los parámetros del constructor, si lo hubiese, y creará una nueva instancia de la clase de una forma similar a la ya implementada para los objetos, si se encuentra que la definición de la clase tiene un método constructor mientras se recorren las propiedades de la definición de la clase, este se llama al final de la creación de la instancia.


## Traducción de egg a JS
Para traducir una clase en JS, se añadieron los siguientes ficheros: 

- `runtime-support.js`: en el caso de las funciones exclusivas de egg, como print, runtime-support.js contiene las funciones equivalentes en js.
- `scope.js`: contine funciones de utilidad para el manejo de las variables y entornos.
- `translations.js`: continene las funciones de traducción de las expresiones en js.

### Traducción de funciones

#### fun

```javascript
generateJSForms["fun"] = generateJSForms["->"] = function (args, scope) {
  let newEnv = Object.create(scope);
  let body = args.pop().generateJS(newEnv);

  let params = args.map(arg => arg.generateJS(newEnv));
  return `function(${params}) { 
      return (${body});     
    }`;
};
```

Traducir una declaración de función egg básicamente traduciremos cada uno de los parámetros y el cuerpo de la función, y devolveremos una string con la definición de la función en JS.

#### do 

```javascript
generateJSForms["do"] = function (args, scope) {
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
```

La traducción de un do es bastante similar a la traducción de una función, pero en este caso, traduciremos cada una de las sentencias del do. Para mantener el mismo comportamiento en la traducción, deberemos devolver la última sentencia en la función js resultante.

#### while

```javascript
generateJSForms['while'] = function (args, scope) {
    if (args.length !== 2) {
    throw new Error('Wrong number of arguments for while');
  }
  let [cond, body] = args.map(arg => arg.generateJS(scope));
  let last = tempVar('last', scope);

  return `(()=>{
        while (${cond}) 
         ${last} = ${body};
        return ${last};
    })()`;
}
```

Los bucles while en egg devuelven el resultado de la evaluación del bucle, por lo que necesitaremos una variaable temporal para almacenar el resultado de la evaluación de la condición. 

#### array

```js
generateJSForms['array'] = function(args, scope) {
  let output = '['
  for (let i = 0; i < args.length; i++) {
    output += `${args[i].generateJS(scope)},`;
  }
  output += ']';
  return output;
}
```

La traducción de un array es muy simple, simplemente se encapsulará entre corchetes el resultado de la traducción de cada uno de los elementos del array.

#### if 
```js
generateJSForms['if'] = function (args, scope) {
  if (args.length != 3) {
    throw new SyntaxError('Bad number of args to if');
  }
  let [cond, then, else_] = args.map(arg => arg.generateJS(scope));
  return `if(${cond}) { ${then} } else { ${else_} }`;

}
```
Para traducir un if, primero comprobaremos que el nodo tiene el número de argumentos adecuados, luego simplemente traduciremos las expresiones de la condición, el cuerpo del if y el cuerpo del else y devolveremos una string con la definición de la función en JS.

#### object

```js
generateJSForms['self'] = function (args, scope) {
  return 'this';
}

generateJSForms['object'] = function(args, scope) {
  if (args.length % 2) {
    throw new Error("Invalid number of arguments for object");
  }

  let output = '{'
  let name;
  let value;
  for (let i = 0; i < args.length; i += 2) {
    name = args[i].getIndex() || args[i].generateJS(scope);
    value = args[i + 1].generateJS(scope);
    output += `${name}: ${value},`;
  }
  output += '}';
  return output;
}
```

La traducción de los objetos es similar a la traducción de un array. En este caso tendremos que traducir los pares de claves y valores asegurandonos de añadir los elementos sintácticos de js. 
Además añadiremos una función para traducir `self`, que simplemente tiene que ser sustituido por la palabra reservada de js `this`.