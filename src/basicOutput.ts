
export interface BasicOutput {
  readonly valid: boolean;
  readonly errors?: readonly BasicError[];
}

export interface BasicError {
  readonly keywordLocation: string;
  readonly instanceLocation: string;
  readonly error: string;
}

export function decodeBasicOutput(json: unknown): BasicOutput {
  // TODO decoding
  return json as BasicOutput;
}

