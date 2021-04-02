interface Class<T, K> extends Function {
	new(orderedFields: T[], namedFields?: K[]): Struct;
	decode(buffer: Buffer, offset?: number): Struct;
}
