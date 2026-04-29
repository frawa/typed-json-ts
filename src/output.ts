
export interface BasicOutput {
  readonly valid: boolean;
  readonly errors?: readonly OutputError[];
  readonly annotations?: readonly BasicOutputAnnotation[];
}

export function decodeFlagOutput(json: unknown): boolean {
  // TODO decoding
  return json as boolean;
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
  readonly error?: string;
  readonly annotations?: readonly OutputUnit[];
  readonly annotation?: unknown;
}

export function flattenErrors(o: OutputUnit): readonly OutputUnit[] {
  const go: (o: OutputUnit) => readonly OutputUnit[] = o => {
    return o.valid ? [] : [o, ...(o.errors?.flatMap(go) ?? [])]
  }
  return go(o);
}

export function flattenAnnotations(o: OutputUnit): readonly OutputUnit[] {
  const go: (o: OutputUnit) => readonly OutputUnit[] = o => {
    return o.valid ? [o, ...(o.annotations?.flatMap(go) ?? [])] : []
  }
  return go(o);
}

export interface OutputAnnotation extends HasLocation {
  readonly annotation: unknown;
}

export interface VerboseOutput extends OutputUnit {
}

export function decodeVerboseOutput(json: unknown): VerboseOutput {
  // TODO decoding
  return json as VerboseOutput;
}
export interface DetailedOutput extends OutputUnit {
}

export function decodeDetailedOutput(json: unknown): DetailedOutput {
  // TODO decoding
  return json as DetailedOutput;
}

