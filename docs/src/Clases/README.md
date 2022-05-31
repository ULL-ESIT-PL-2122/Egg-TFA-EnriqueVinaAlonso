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