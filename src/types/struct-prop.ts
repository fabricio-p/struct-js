type StructField = {
	name: string,
	type: number,
	size?: number,
	default?: BinaryCompat | (() => BinaryCompat)
};
type FieldDescriptor = {
	name: string,
	value: BinaryCompat
};
type JSONStruct = {
	type: string;
	name: string;
	data: Array<JSONStructField>;
};
type JSONStructField = {
	type: string,
	name: string,
	value: BinaryCompat,
	size?: number
};
type StructOptions = {
	sizePrefix: boolean;
};
