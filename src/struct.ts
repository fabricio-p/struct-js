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
		types: StructProp[];
		data: Struct["data"] = {};
		readonly name: string;
		settings: StructOptions;
		constructor(...args: any[]) {
			for(let i in props)
				this.data[props[i][0]] = args[i];
			this.types = props;
			this.name = name;
			Object.freeze(this.types);
			this.types.forEach(Object.freeze);
			Object.seal(this.data);
			this.settings = Object.freeze({...options});
			Object.freeze(this);
		}
		encode(): Buffer {
			let bufferList: Buffer[] = [];
			for(let i in this.types) {
				const [name, type, size] = this.types[i];
				const encoded = encoder[type](this.data[name], size);
				bufferList.push(encoded);
			}
			return this.settings.sizePrefix ?
				Buffer.concat([
					Uint8Array.from([
						bufferList.reduce(
							(acc, val) => acc + val.byteLength,
							0
						)
					]),
					...bufferList
				]) :
				Buffer.concat(bufferList);
		}
		[inspect.custom](depth: number, opts: Object): string {
			let repr: string = `struct[${structNameColor(this.name)}] {\n`;
			for(let [name, type] of this.types) {
				const dataRepr = inspect(this.data[name], {
						      depth: null,
						      colors: true,
						      showHidden: false
				});
				const dataType = typeColor(DataType[type]);
				repr += `\t${name}: ${dataType} = ${dataRepr},\n`;
			}
			repr += `}`;
			return repr;
		}
		toJSON(): JSONStruct {
			let repr: JSONStruct = <JSONStruct>{};
			repr.type = "Struct";
			repr.name = this.name;
			repr.data = [];
			for(let [name, type, size] of this.types) {
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
			const structArgs: BinaryCompat[] = [];
			for(let [name, type, size] of props) {
				size = size || sizeof[type];
				structArgs.push(decoder[type](buffer, offset));
				offset += size;
			}
			return new this(...structArgs);
		}
	}
