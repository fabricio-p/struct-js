interface Class<T> extends Function {
	new(...args: T[]): Struct;
	decode(buffer: Buffer, offset?: number): Struct;
}
