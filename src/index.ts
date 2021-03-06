import {struct} from "./struct";
import DataType from "./data-type";
import assert from "assert";

export const container = struct('container', [
	["foo", DataType.i8],
	["bar", DataType.u32],
	["baz", DataType.f32],
	["hello", DataType.string]
], {
	sizePrefix: true
});
const data = new container(0x09, 0xff3, 1.454, "world");
const dataBuffer = data.encode();

console.log(data);
console.log(JSON.stringify(data, null, 2));
console.log(dataBuffer);
assert.deepEqual(data, container.decode(dataBuffer));
