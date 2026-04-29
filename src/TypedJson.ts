import { type BasicOutput, decodeBasicOutput, decodeDetailedOutput, decodeFlagOutput, decodeVerboseOutput, type DetailedOutput, type VerboseOutput } from "./output.js";
import {
  decodeSuggestionOutput,
  type SuggestionOutput,
} from "./suggestions.js";
import { loadUnisonModule } from "./wasm/typedJsonLoader.js";

type VersionFun = () => string;
type ValidateFun = (arg: [string, string, string]) => string;
type ValidateSchemaFun = (arg: [string, string]) => string;
type SuggestFun = (arg: [string, string, string]) => string;
type SuggestSchemaFun = (arg: [string, string]) => string;

interface OutputType {
  flag: boolean;
  basic: BasicOutput;
  detailed: DetailedOutput;
  verbose: VerboseOutput;
}

export class TypedJson {
  public static async load(wasm?: string | ArrayBuffer): Promise<TypedJson> {
    return await loadFrom(wasm ?? "wasm/typedJson.wasm");
  }

  constructor(exports: any) {
    this.wasmVersion = exports.version as VersionFun;
    this.wasmValidate = exports.validate as ValidateFun;
    this.wasmValidateSchema = exports.validateSchema as ValidateSchemaFun;
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

  private validate<T extends keyof OutputType>(schema: string, instance: string, output: T, decode: (r: unknown) => OutputType[T]): Promise<OutputType[T]> {
    try {
      const result = this.wasmValidate([schema, instance, output]);
      const o = decode(JSON.parse(result));
      return Promise.resolve(o);
    } catch (e) {
      console.log("validate failed", e);
      return Promise.reject(e);
    }
  }
  private validateSchema<T extends keyof OutputType>(schemaInstance: string, output: T, decode: (r: unknown) => OutputType[T]): Promise<OutputType[T]> {
    try {
      const result = this.wasmValidateSchema([schemaInstance, output]);
      const o = decode(JSON.parse(result));
      return Promise.resolve(o);
    } catch (e) {
      console.log("validate schema failed", e);
      return Promise.reject(e);
    }
  }

  public validateBasic(schema: string, instance: string): Promise<BasicOutput> {
    return this.validate(schema, instance, 'basic', decodeBasicOutput)
  }

  public validateFlag(schema: string, instance: string): Promise<boolean> {
    return this.validate(schema, instance, 'flag', decodeFlagOutput)
  }

  public validateDetailed(schema: string, instance: string): Promise<DetailedOutput> {
    return this.validate(schema, instance, 'detailed', decodeDetailedOutput)
  }

  public validateVerbose(schema: string, instance: string): Promise<VerboseOutput> {
    return this.validate(schema, instance, 'verbose', decodeVerboseOutput)
  }

  public validateSchemaBasic(schema: string): Promise<BasicOutput> {
    return this.validateSchema(schema, 'basic', decodeBasicOutput)
  }

  public validateSchemaFlag(schema: string): Promise<boolean> {
    return this.validateSchema(schema, 'flag', decodeFlagOutput)
  }

  public validateSchemaDetailed(schema: string): Promise<DetailedOutput> {
    return this.validateSchema(schema, 'detailed', decodeDetailedOutput)
  }

  public validateSchemaVerbose(schema: string): Promise<VerboseOutput> {
    return this.validateSchema(schema, 'verbose', decodeVerboseOutput)
  }

  public suggest(
    schema: string,
    instance: string,
    pointer: string,
  ): Promise<readonly SuggestionOutput[]> {
    try {
      const result = this.wasmSuggest([schema, instance, pointer]);
      const o: readonly SuggestionOutput[] = decodeSuggestionOutput(
        JSON.parse(result),
      );
      return Promise.resolve(o);
    } catch (e) {
      console.log("suggest failed", e);
      return Promise.reject(e);
    }
  }

  public suggestSchema(
    schema: string,
    pointer: string,
  ): Promise<readonly SuggestionOutput[]> {
    try {
      const result = this.wasmSuggestSchema([schema, pointer]);
      const o: readonly SuggestionOutput[] = decodeSuggestionOutput(
        JSON.parse(result),
      );
      return Promise.resolve(o);
    } catch (e) {
      console.log("suggest schema failed", e);
      return Promise.reject(e);
    }
  }
}

async function loadFrom(wasm: string | ArrayBuffer): Promise<TypedJson> {
  const wasmContent = typeof wasm === "string" ? fetch(wasm) : wasm;
  //const { exports, log } = await loadUnisonModule(wasm);o
  // @ts-ignore
  const { exports } = await loadUnisonModule(wasmContent);
  return new TypedJson(exports);
}
