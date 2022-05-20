# EGGXTENDED

[COVERAGE](/coverage/lcov-report/)

## Resumen de lo aprendido: 

En esta práctica se han incorporado elementos al intérprete de egg, usando el parser para egg orientado a objetos.

### Interpretación de los nodos Property:

Al añadir objetos, introducimos la necesidad de crear una nueva clase para nuestro árbol de evaluación, la clase Property, que será equivalente al árbol generado por un código cómo `object.property`:

#### Property.evaluate y currying

El método evaluate de una property tiene una estructura similar al de un Apply.

Evaluamos ambas partes de la expresión y luego comprobamos si se está usando indexación negativa, la función `checkNegativeIndex` se explicará a continuación.

`propName` contendrá el nombre de la primera propiedad después de haber sido evaluada. A continuación, comprobamos si el objeto contiene una propiedad `propName`, en caso positivo, recorremos cada una de las propiedades evaluadas actualizando el objeto a medida que se extraen los valores, finalmente retornamos el valor del objeto.

En caso de que el objeto no contenga `propName`, comprobamos si el tipo del objeto es `function`, en ese caso permitiremos esta sintaxis para hacer currying.

```javascript
  evaluate(env) {
    if (this.operator.type == "word" && this.operator.name in specialForms) { 
      // Is there any meaning for s.t. like while[<(x,4), ... ]?
      this.type = "apply";
      let applyFromProp = new Apply(this);
      return {ast: applyFromProp, scope: env};
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
```

#### Property.leftEvaluate

El `leftEvaluate` es más simple, simplemente evaluamos la parte izquierda de la expresión, y nos aseguramos de que sea un objeto.
Luego evaluaremos cada uno de los elementos de la expresión derecha, y los guardaremos en un array, devolveremos un array con el elemento de la izquierda, y los elementos de la derecha evaluados.

```javascript
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
}

```

### checkNegativeIndex

`checkNegativeIndex` es una función de utilidad usada para manejar las indexaciones negativas en los arrays.

Toma un objeto y un índice, y comprobará si el objeto es un array y el índice es negativo. Si es así, retornará el índice negativo sumado a la longitud del array, si no, devuelve el índice original.

```javascript
function checkNegativeIndex(obj, element) {
  if (Array.isArray(obj) &&  element < 0 ) {
    element += obj.length;
  }
  return element;
}
```

### Set works with arrays, maps and objects

Debemos de modificar nuestro `set` en topEnv para que funcione con los nuevos objetos de egg:

Almacenaremos el valor a asignar en `value` y luego recorreremos la lista de índices que devuelve leftEvaluate, actualizando el valor del objeto en el que se asignará. Finalmente asignaremos el valor a la propiedad. 

```javascript
specialForms['='] = specialForms['set'] = function(args, env) {
  if (args.length !== 2) {
    throw new SyntaxError(`Bad use of set '${JSON.stringify(args, null, 0)}.substring(0,20)}'`);
  }

  let valueTree = args[args.length-1];
  let value = valueTree.evaluate(env);

  let leftSide = args[0];
  let [s, ...index] = leftSide.leftEvaluate(env);

  let last = index.length-1
  for (let j = 0; j < last; j++) {
    index[j] = checkNegativeIndex(s, index[j]);
    s = s[index[j]];
  }
  index[last] = checkNegativeIndex(s, index[last]);
  s[index[last]] = value;

  return value;
}
```

### Objects 
Añadiremos una nueva entrada a topEnv para que podamos crear objetos:

Primero comprobamos que el número de argumentos sea par, ya que para definir un objeto necesitaremos pares de claves y valores.

Luego crearemos un nuevo entorno para el objeto, de esta forma evitamos referencias circulares con la propiedad `self`.
Añadiremos una propiedad `self` al entorno del objeto, que apunta al objeto en sí.

Luego recorreremos el array de argumentos, y añadiremos las propiedades al objeto y a su entorno.

```javascript
specialForms["object"] = (args, env) => {
  if (args.length % 2) {
    throw new Error("Invalid number of arguments for object");
  }

  const objEnv = Object.create(env);
  const obj = {};
  objEnv["self"] = obj;

  let name;
  let value;
  for (let i = 0; i < args.length; i += 2) {
    name = args[i].getIndex() || args[i].evaluate(objEnv);
    value = args[i + 1].evaluate(objEnv);
    obj[name] = objEnv[name] = value;
  }
  return obj;
};
```

### For loops

Los bucles for son similares a los while, simplemente reemplazaremos en un for de js cada uno de los 4 argumentos de la expresión de egg evaluados por su equivalente en js.

```javascript
specialForms['for'] = function(args, env) {
  if (args.length != 4) {
    throw new SyntaxError(`Bad number of args to for`);
  }
  for (args[0].evaluate(env); args[1].evaluate(env); env[args[0].args[0].name] = args[2].evaluate(env)) {
    args[3].evaluate(env);
  }
  // Egg has no undefined so we return false when there's no meaningful result.
  return false;
};
```

Foreach sigue la misma lógica que for.

```javascript
specialForms['foreach'] = function(args, env) {
  if (args.length != 3) {
    throw new SyntaxError(`Bad number of args to foreach`);
  }
  for (env[args[0].name] of args[1].evaluate(env)) {
    args[2].evaluate(env);
  }
  // Egg has no undefined so we return false when there's no meaningful result.
  return false;
};

```

### require

Para implementar la funcionalidad de require, añadiremos una nueva función a topEnv:

Primero comprobaremos si el argumento que se requiere está presente en la cahce de require, en ese caso lo devolvemos.
Si no, leeremos el archivo, lo parsearemos y guardamos en la caché de require el resultado de la evaluación.

```javascript
function REQUIRE(args, env) {
  let name = args[0].value;
  if (name in REQUIRE.cache) {
    return REQUIRE.cache[name];
  }

  let program = readFile(name);
  let localEnv = Object.create(env);
  let tree = parse(program);
  let js = json2AST(tree);
  let result = js.evaluate(localEnv);
  REQUIRE.cache[name] = result;
  return result;
}
```


### Maps/Hashes

Para añadir maps a nuestro lenguaje, debemos añadir otra entrada a topEnv: 

```javascript
topEnv["map"] = function(...args) {
  if (args.length % 2) throw new SyntaxError('Error!: Number of parameter must be even');
  let r = Object.create(null);
  r.sub = Object.prototype.sub;
  for(let i = 0; i < args.length; i += 2) {
    r[args[i]] = args[i + 1];
  }
  return r;
};
```


### RegExps

Para añadir las funcionalidades de expresiones regulares a nuestro lenguaje, primero añadimos un nuevo token a nuestro lexer:

```javascript

const REGEXP = /(?<REGEXP>r\/((?:[^\/\\]|\\.)*)\/(\w*?\b)?)/;
REGEXP.value = v => {
  let [source, flags] = v.split('/').slice(1);
  return {
    type: 'RegExp',
    info: [source, flags]
  };
};
```
Con una expresión regular que reconoce expresiones regulares, y una función para separar la expresión regular en su código fuente y su flags. El token devuelto es un objeto con dos propiedades: type e info.

Añadiremos una función a nuestro parser encargada de construir el nodo de una expresión regular, a partir del token reconocido:

```javascript
 function buildRegExpValue([regexpnode, properties]) {
  let node = {
    type: 'value',
    value: regexpnode.value,
    line: regexpnode.line,
    col: regexpnode.col,
    length: regexpnode.length
  };
  console.log(node);
  if (!properties) {
    return node;
  }
  return fromListToAST(node, properties);
}
```


