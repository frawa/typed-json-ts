
export interface BasicOutput {
  readonly valid: boolean;
  readonly errors?: readonly OutputError[];
  readonly annotations?: readonly BasicOutputAnnotation[];
}

export interface HasLocation {
  readonly keywordLocation: string;
  readonly instanceLocation: string;
}

export interface OutputError extends HasLocation {
  readonly error: string;
}

export interface BasicOutputAnnotation extends HasLocation {
  readonly value: unknown;
}

export function decodeBasicOutput(json: unknown): BasicOutput {
  // TODO decoding
  return json as BasicOutput;
}

// TODO better match spec
export interface OutputUnit extends HasLocation {
  readonly valid: boolean;
  readonly errors?: readonly OutputUnit[]
  readonly annotations?: readonly OutputUnit[]
}

export interface OutputAnnotation extends HasLocation {
  readonly annotation: unknown;
}

export interface VerboseOutput extends OutputUnit {
}

export function decodeVerboseOutput(json: unknown): VerboseOutput {
  // TODO decoding
  console.log("FW verbose", json)
  return json as VerboseOutput;
}

