# struct-js

This package simulates C language structs. It is intended
for me to create a memory management layout for __WebAssembly__'s linear
memory (I'm making a language that compiles to it).


It is pretty simple to use this package. It exposes a `struct` function
wich takes an array of struct fields. A field is just an array that
is like `[fieldsName: string, fieldType: number(DataType), fieldSize?: number]`
