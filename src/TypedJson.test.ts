import { describe, expect, test } from 'vitest';
import { TypedJson } from './TypedJson.js';
import { readFileSync } from "node:fs"

describe('TypedJson', async () => {
  const wasmBuffer = readFileSync('./src//wasm/typedJson.wasm');
  const typedJson = await TypedJson.load(wasmBuffer.buffer)

  test('version', async () => {
    typedJson.version()
    expect(typedJson.version()).toEqual("0.9.1");
  });

});
