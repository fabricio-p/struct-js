import {encoder, decoder, sizeof} from "./encoding";
import {inspect} from "util";
import DataType from "./data-type";
import chalk from "chalk";
const typeColor = chalk.hex("CE45DD");
const structNameColor = chalk.rgb(0x00, 0xbf, 0xce);

export const struct = (
	name: string,
	props: StructProp[],
	options: StructOptions = <StructOptions>{}): Class<BinaryCompat> =>
	class implements Struct {
		fields: StructProp[];
		data: Struct["data"] = {};
		readonly name: string;
		settings: StructOptions;
		constructor(...args: any[]) {
			for(let i in props)
				this.data[props[i][0]] = args[i];
			this.fields = props;
			this.name = name;
			Object.freeze(this.fields);
			this.fields.forEach(Object.freeze);
			Object.seal(this.data);
			this.settings = Object.freeze({...options});
			Object.freeze(this);
		}
		encode(): Buffer {
			let bufferList: Buffer[] = [];
			for(let i in this.fields) {
				const [name, type, size] = this.fields[i];
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
			for(let [name, type] of this.fields) {
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
			for(let [name, type, size] of this.fields) {
				const data: PropDescriptor = [
					DataType[type],
					this.data[name]
				];
				if(size)
					data.push(size)
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
			for(const [name, type, size] of props) {
				const isString = type == DataType.string;
				const segmentSize = size || sizeof[type] ||
					(() => {
					const size = buffer.readUInt16LE(offset);
					offset += 2;
					return size;
				})();
				structArgs.push(decoder[type](buffer, offset, segmentSize));
				offset += segmentSize// + (isString && !size ? 2 : 0);
			}
			return new this(...structArgs);
		}
	}
