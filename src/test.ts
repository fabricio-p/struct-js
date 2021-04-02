import {struct} from "./struct";
import DataType from "./data-type";
import assert from "assert";

export const container = struct('container', [
	{
		name: "foo",
		type: DataType.i8
	},
	{
		name: "bar",
		type: DataType.u32
	},
	{
		name: "baz",
		type: DataType.f64
	},
	{
		name: "hello",
		type: DataType.string
	}
], {
	sizePrefix: true
});
const data = new container([0x09, 0xff3, 1.454, "world"]);
const dataBuffer = data.encode();

console.log(data);
console.log(JSON.stringify(data, null, 2));
console.log(dataBuffer);
assert.deepEqual(data, container.decode(dataBuffer));
