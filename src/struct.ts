import {encoder, decoder, sizeof} from "./encoding";
import {inspect} from "util";
import DataType from "./data-type";
import chalk from "chalk";
const typeColor = chalk.hex("CE45DD");
const structNameColor = chalk.rgb(0x00, 0xbf, 0xce);

export const struct = (
	name: string,
	props: StructField[],
	options: StructOptions = <StructOptions>{}): Class<BinaryCompat, FieldDescriptor> =>
	class implements Struct {
		fields: StructField[];
		data: Struct["data"] = {};
		readonly name: string;
		settings: StructOptions;
		constructor(
			orderedFields: BinaryCompat[],
			namedFields: FieldDescriptor[] = []) {
			for(const i in props) {
				const field = props[i];
				if(orderedFields[i] === undefined)
					typeof field.default == "function" ?
					this.data[field.name] = field.default() :
					(typeof field.default == "undefined" ?
					undefinedError(props, orderedFields, Number(i)) :
					this.data[field.name] = field.default);
				
				this.data[field.name] = orderedFields[i];
			}
			this.fields = props;
			this.name = name;
			Object.freeze(this.fields);
			this.fields.forEach(Object.freeze);
			Object.seal(this.data);
			for(const descriptor of namedFields)
				this.data[descriptor.name] = descriptor.value;
			this.settings = Object.freeze({...options});
			Object.freeze(this);
		}
		encode(): Buffer {
			let bufferList: Buffer[] = [];
			for(let i in this.fields) {
				const {name, type, size} = this.fields[i];
				const encoded = encoder[type](this.data[name], size);
				bufferList.push(encoded);
			}
			const bufferSize = bufferList.reduce(
				(acc, val) => acc + val.byteLength, 0
			);
			return this.settings.sizePrefix ?
				Buffer.concat([
					Uint8Array.from([bufferSize >>> 8,bufferSize & 0xff]),
					...bufferList
				]) :
				Buffer.concat(bufferList);
		}
		[inspect.custom](depth: number, opts: Object): string {
			const indent = depth - 2 ? '  '.repeat(depth) : '';
			let repr: string = indent +
				`struct[${structNameColor(this.name)}] {\n`;
			for(let {name, type} of this.fields) {
				const dataRepr = inspect(this.data[name], {
						      depth,
						      colors: true,
						      showHidden: false,
				});
				const dataType = typeColor(DataType[type]);
				repr += `${indent}  ${name}: ${dataType} = ${dataRepr},\n`;
			}
			repr += `}`;
			return repr;
		}
		toJSON(): JSONStruct {
			let repr: JSONStruct = <JSONStruct>{};
			repr.type = "Struct";
			repr.name = this.name;
			repr.data = [];
			for(let {name, type, size} of this.fields) {
				const data: JSONStructField = {
					name,
					type: DataType[type],
					value: this.data[name],
					size
				};
				repr.data.push(data);
			}
			return repr;
		}
		static decode(buffer: Buffer, offset = 0/*, opts: DecodeOptions*/): Struct {
			if(options.sizePrefix) {
				buffer = buffer.slice(offset+2, buffer.readUInt16LE(offset));
				offset = 0;
			}
			const structArgs: BinaryCompat[] = [];
			for(const {name, type, size} of props) {
				const isString = type == DataType.string;
				const segmentSize = size || sizeof[type] ||
					(() => {
					const size = buffer.readUInt16LE(offset);
					offset += 2;
					return size;
				})();
				structArgs.push(decoder[type](buffer, offset, segmentSize));
				offset += segmentSize;
			}
			return new this(structArgs);
		}
	}

function undefinedError(fiels: StructField[], values: BinaryCompat[], index: number): never {
	throw new TypeError(``);
}
