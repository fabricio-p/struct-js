//import {StructProps} from "./struct-prop";
//import {Buffer} from "buffer";

type TypedArray = Uint8Array|Int8Array|Uint8ClampedArray|
		Uint16Array|Int16Array|Uint32Array|Int32Array|
		Float32Array|Float64Array|BigUint64Array|BigInt64Array;

type BinaryCompat = string|number|TypedArray|Buffer|bigint;

interface Struct {
	name: string;
	data: {
		[key: string]: BinaryCompat;
	};
	fields: StructProp[];
	encode(): Buffer;
}
interface StructClass extends Function {
	constructor(...args: any[]): Struct;
}
