type StructProp = [string, number, number?];
type PropDescriptor = [string, BinaryCompat, number?];
type JSONStruct = {
	type: string;
	name: string;
	data: PropDescriptor[]
}
type StructOptions = {
	sizePrefix: boolean;
}
