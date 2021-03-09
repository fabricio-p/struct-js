import DataType from "./data-type";

type EncodeFunction<T> = (data: T, size?: number) => Buffer;
type DecodeFunction<T> = (data: Buffer, offset: number, size: number) => T;

const encoder: EncodeFunction<BinaryCompat|any>[] = [];
const decoder: DecodeFunction<BinaryCompat|any>[] = [];

encoder[0] = data => Buffer.alloc(0);

encoder[DataType.u8] = (data: number) => {
	return Buffer.from([data & 0xff]);
}
encoder[DataType.i8] = (data: number) => {
	const buffer = Buffer.alloc(1);
	buffer.writeInt8(data);
	return buffer;
}
encoder[DataType.u16] = (data: number) => {
	const buffer = Buffer.alloc(2);
	buffer.writeUInt16LE(data);
	return buffer;
}
encoder[DataType.i16] = (data: number) => {
	const buffer = Buffer.alloc(2);
	buffer.writeInt16LE(data);
	return buffer;
}
encoder[DataType.u32] = (data: number) => {
	const buffer = Buffer.alloc(4);
	buffer.writeUInt32LE(data);
	return buffer;
}
encoder[DataType.i32] = (data: number) => {
	const buffer = Buffer.alloc(4);
	buffer.writeInt32LE(data);
	return buffer;
}
encoder[DataType.u64] = (data: bigint) => {
	const buffer = Buffer.alloc(8);
	buffer.writeBigUInt64LE(data);
	return buffer;
}
encoder[DataType.i64] = (data: bigint) => {
	const buffer = Buffer.alloc(8);
	buffer.writeBigInt64LE(data);
	return buffer;
}
encoder[DataType.f32] = (data: number) => {
	const buffer = Buffer.alloc(4);
	buffer.writeFloatLE(data);
	return buffer;
}
encoder[DataType.f64] = (data: number) => {
	const buffer = Buffer.alloc(8);
	buffer.writeDoubleLE(data);
	return buffer;
}
encoder[DataType.string] = (data: string, size) => {
	let buffer: Buffer;
	let diff: number;
	if(!size) {
		buffer = Buffer.alloc(2 + data.length);
		buffer.writeUInt16LE(data.length);
		diff = 2;
		size = data.length + 2;
	} else {
		buffer = Buffer.alloc(size);
		diff = 0;
	}
	for(let i = diff; i < size; i++)
		buffer[i] = data.charCodeAt(i - diff);
	return buffer;
}
encoder[DataType.buffer] = (data: Buffer) => Buffer.from([...data]);

decoder[DataType.u8] = (data, offset) => data.readUInt8(offset);
decoder[DataType.i8] = (data, offset) => data.readInt8(offset);
decoder[DataType.u16] = (data, offset) => data.readUInt16LE(offset);
decoder[DataType.i16] = (data, offset) => data.readInt16LE(offset);
decoder[DataType.u32] = (data, offset) => data.readUInt32LE(offset);
decoder[DataType.i32] = (data, offset) => data.readInt32LE(offset);
decoder[DataType.u64] = (data, offset) => data.readBigUInt64LE(offset);
decoder[DataType.i64] = (data, offset) => data.readBigInt64LE(offset);
decoder[DataType.f32] = (data, offset) => Math.fround(data.readFloatLE(offset));
decoder[DataType.f64] = (data, offset) => data.readDoubleLE(offset);
decoder[DataType.string] = (data, offset, size: number) =>
	String.fromCharCode(...data.slice(offset, offset + size));

const sizeof: number[] = [
	0,
	1 << 0,
	1 << 0,
	1 << 1,
	1 << 1,
	1 << 2,
	1 << 2,
        1 << 3,
        1 << 3,
	1 << 2,
        1 << 3
]
//for(let i = 1, o = 1; i <= 8; i++ && o += 2)

export {encoder, decoder, sizeof};
