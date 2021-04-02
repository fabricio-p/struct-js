# struct-js
-----------
This package simulates C language structs. It is intended
for me to create a memory management layout for __WebAssembly__'s linear
memory (I'm making a language that compiles to it).


It is pretty simple to use this package. It exposes a `struct` function
wich takes 3 arguments.
1. The struct's name.
2. An array of struct fields. A field is just an object like
  ```
  {
	  name: [fieldName: string],
	  type: [fieldType: DataType[number]|<returnof struct>],
	  size?: [fieldSize: number],
	  default?: [defaultValue: {type}|() => {type}]
  }
  ```
  If the default is a function, it will be called to generate a default value.
3. (optional) The struct's options

The `struct` function is a class factory. It returns a class depending of the
paremeters that you provide. The class constructor takes 2 arguments
1. An array of values to be assigned to fields by order.
2. An array to assign values by name using descriptor objects.
A simple example:
```javascript
const { struct, DataType, sizeof } = require("struct-js");
const Person = struct('person', [
	{
		name: 'id',
		type: DataType.u16,
		default: () => Math.floor(Math.random() * sizeof[DataType.u16])
	},
	{
		name: "name",
		type: DataType.string
	},
	{
		name: "age",
		type: DataType.u8
	},
	{
		name: "country",
		type: DataType.string
	},
], {
	sizePrefix: false
});
const someone = new Person([
	null,
	"Ben",
	25,
	"Albania"
], [
	{
		name: 'id',
		value: 24344
	}
]);
/*
 * struct[person] {
 *   id: u16 = 24344,
 *   name: string = "Ben",
 *   age: u8 = 25,
 *   country: string = "Albania"
 * }
 */
```
