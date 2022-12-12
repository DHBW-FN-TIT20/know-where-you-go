# Coding Guidelines - React Typescript

## Names
1. Do not use "_" as a prefix for private properties.
2. Use whole words in names when possible.
3. Give folders/files/components/functions unique names.

Style | Category
--- | ---
PascalCase | class / enum / decorator / component files
camelCase | variable / parameter / function / method / property / module alias / folder names + non-component files
CONSTANT_CASE | global constant values (declared on module level; if the value can be instantiated more than once it must use camelCase) 

## Components
1. 1 file per logical component.
2. Filename should match the component name.

## `null` and `undefined`
1. Use **undefined**. Do not use null.

## Comments
1. Use JSDoc-style comments (`/** JSDoc */`) for functions, interfaces, enums, and classes.
   1. Specify all function attribute/parameter types
   2. Only specify function attributes/parameters with text if they are not self-explanatory.
2. Use single line comments (`// line comment`) for implementation comments.
3. Write comments only if they add value. Do not comment for the sake of commenting.
   > What comments are needed so that another developer understands the code?<br/>
   > Keep in mind: The comments are the projects documentation. If the code is not self-explanatory, it should be refactored/commented. 

## Style
1. Use arrow functions over anonymous function expressions.
2. Only surround arrow function parameters when necessary.<br/>
   For example, `(x) => x + x` is wrong but the following are correct:
   1. `x => x + x`
   2. `(x, y) => x + y`
   3. `<T>(x: T, y: T) => x === y`
3. Always surround loop and conditional bodies with curly braces. Statements on the same line are allowed to omit braces.
4. Open curly braces always go on the **same line** as whatever necessitates them.
5. Use a single declaration per variable statement (i.e. use `var x = 1; var y = 2;` over `var x = 1, y = 2;`).
6. Separate function from the JSX if it takes more than one line (i.e. button click).
7. Do not use inline styles. Use separate CSS files instead.
8. Use 2 spaces for indentation.
   > VSCode: *View* -> *Command Palette...* -> *"Indent Using Spaces"* ->  **2**

## Structure within components
1. Imports - Prefer destructuring over importing the whole module.
2. Additional variables
3. Component/Class
   1. Optional constructor
      > Only use constructor if you need to set initial state or bind methods. JavaScript will automatically create an empty constructor for you.
   2. Definitions
   3. Functions
   4. Additional destructors
4. Exports