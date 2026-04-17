import { describe, expect, test } from "vitest";
import { TypedJson } from "./TypedJson.js";
import { readFileSync } from "node:fs";

describe("TypedJson", async () => {
  const wasmBuffer = readFileSync("./src/wasm/typedJson.wasm");
  const typedJson = await TypedJson.load(wasmBuffer.buffer);

  test("version", async () => {
    typedJson.version();
    expect(typedJson.version()).toEqual("0.9.1");
  });

  test("validate", async () => {
    const basicOutput = await typedJson.validate(`{"type":"string"}`, "13");
    expect(basicOutput).toEqual({
      valid: false,
      errors: [
        {
          error: "expected type: string",
          instanceLocation: "",
          keywordLocation: "/type",
        },
      ],
    });
  });

  test("suggest", async () => {
    const suggestOutput = await typedJson.suggest(
      `{"type":"string"}`,
      "13",
      "",
      false,
    );
    expect(suggestOutput).toEqual([
      {
        location: "/type",
        values: [""],
      },
    ]);
  });
});
