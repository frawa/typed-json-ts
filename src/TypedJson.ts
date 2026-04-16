import { type BasicOutput, decodeBasicOutput } from './basicOutput.js';
import { decodeSuggestionOutput, type SuggestionOutput } from './suggestions.js';
// @ts-ignore
// import wasmUrl from './wasm/typedJson.wasm?url';
import { loadUnisonModule } from './wasm/typedJsonLoader.js';

type VersionFun = () => string;
type ValidateFun = (arg: [string, string]) => string;
type ValidateSchemaFun = (arg: string) => string;
type SuggestFun = (arg: [string, string, string, boolean]) => string;
type SuggestSchemaFun = (arg: [string, string, boolean]) => string;

export class TypedJson {

  public static async load(wasm?: string | ArrayBuffer): Promise<TypedJson> {
    return await loadFrom(wasm ?? "typedJson.wasm");
  }

  constructor(exports: any) {
    this.wasmVersion = exports.version as VersionFun;
    this.wasmValidate = exports.validate as ValidateFun;
    this.wasmValidateSchema = exports.validate as ValidateSchemaFun;
    this.wasmSuggest = exports.suggest as SuggestFun;
    this.wasmSuggestSchema = exports.suggestSchema as SuggestSchemaFun;
  }

  private readonly wasmVersion: VersionFun;
  private readonly wasmValidate: ValidateFun;
  private readonly wasmValidateSchema: ValidateSchemaFun;
  private readonly wasmSuggest: SuggestFun;
  private readonly wasmSuggestSchema: SuggestSchemaFun;

  public version(): string {
    return this.wasmVersion();
  }

  public validate(schema: string, instance: string): Promise<BasicOutput> {
    try {
      const result = this.wasmValidate([schema, instance]);
      const o: BasicOutput = decodeBasicOutput(JSON.parse(result));
      return Promise.resolve(o);
    } catch (e) {
      console.log('validate failed', e);
      return Promise.reject(e);
    }
  }

  public validateSchema(schema: string): Promise<BasicOutput> {
    // console.log("local validate schema", schema);
    try {
      const result = this.wasmValidateSchema(schema);
      const o: BasicOutput = decodeBasicOutput(JSON.parse(result));
      return Promise.resolve(o);
    } catch (e) {
      console.log('validate schema failed', e);
      return Promise.reject(e);
    }
  }

  public suggest(
    schema: string,
    instance: string,
    pointer: string,
    inside: boolean
  ): Promise<readonly SuggestionOutput[]> {
    try {
      const result = this.wasmSuggest([schema, instance, pointer, inside]);
      const o: readonly SuggestionOutput[] = decodeSuggestionOutput(
        JSON.parse(result)
      );
      return Promise.resolve(o);
    } catch (e) {
      console.log('suggest failed', e);
      return Promise.reject(e);
    }
  }

  public suggestSchema(
    schema: string,
    pointer: string,
    inside: boolean
  ): Promise<readonly SuggestionOutput[]> {
    try {
      const result = this.wasmSuggestSchema([schema, pointer, inside]);
      const o: readonly SuggestionOutput[] = decodeSuggestionOutput(
        JSON.parse(result)
      );
      return Promise.resolve(o);
    } catch (e) {
      console.log('suggest schema failed', e);
      return Promise.reject(e);
    }
  }
}

async function loadFrom(wasm: string | ArrayBuffer): Promise<TypedJson> {
  const wasmContent = typeof wasm === 'string' ? fetch(wasm) : wasm;
  //const { exports, log } = await loadUnisonModule(wasm);o
  // @ts-ignore
  const { exports } = await loadUnisonModule(wasmContent);
  return new TypedJson(exports);
}