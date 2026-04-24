import { describe, expect, test } from "vitest";
import { TypedJson } from "./TypedJson.js";
import { readFileSync } from "node:fs";

describe("TypedJson", async () => {
  const wasmBuffer = readFileSync("./src/wasm/typedJson.wasm");
  const typedJson = await TypedJson.load(wasmBuffer.buffer);

  test("version", async () => {
    typedJson.version();
    expect(typedJson.version()).toEqual("0.10.2");
  });

  test("validate", async () => {
    const basicOutput = await typedJson.validate(`{"type":"string"}`, "13");
    expect(basicOutput).toEqual({
      valid: false,
      errors: [{
        error: "expected type: string",
        instanceLocation: "",
        keywordLocation: "/type",
      }],
    });
  });

  test("validate annotation", async () => {
    const basicOutput = await typedJson.validate(`{"my":"mine"}`, `"foo"`);
    expect(basicOutput).toEqual({
      valid: true,
      annotations: [{
        value: "mine",
        instanceLocation: "",
        keywordLocation: "/my",
      }],
    });
  });

  test("validateVerbose valid", async () => {
    const schema = JSON.stringify({ type: "string" })
    const instance = JSON.stringify("foo")
    const verboseOutput = await typedJson.validateVerbose(schema, instance);
    expect(verboseOutput).toEqual({
      valid: true,
      instanceLocation: "",
      keywordLocation: "/type",
    });
  });

  test("validateVerbose invalid", async () => {
    const schema = JSON.stringify({ type: "string" })
    const instance = JSON.stringify(13)
    const verboseOutput = await typedJson.validateVerbose(schema, instance);
    expect(verboseOutput).toEqual({
      valid: false,
      instanceLocation: "",
      keywordLocation: "",
      errors: [{
        valid: false,
        instanceLocation: "",
        keywordLocation: "/type",
        error: "expected type: string",
      }]
    });
  });

  test("validateVerbose valid with annotation", async () => {
    const schema = JSON.stringify({
      "properties": {
        "name": {
          "type": "string"
        },
        "rating": {
          "type": "number",
          "renderer": "RatingRenderer"
        }
      }
    })
    const instance = JSON.stringify({
      "name": "foo",
      "rating": 0
    })
    const verboseOutput = await typedJson.validateVerbose(schema, instance);
    expect(verboseOutput).toEqual({
      valid: true,
      instanceLocation: "",
      keywordLocation: "/properties",
      annotations: [{
        valid: true,
        instanceLocation: "/name",
        keywordLocation: "/properties/name/type",
      }, {
        valid: true,
        instanceLocation: "/rating",
        keywordLocation: "/properties/rating/type",
      }, {
        valid: true,
        instanceLocation: "/rating",
        keywordLocation: "/properties/rating/renderer",
        annotation: "RatingRenderer",
      }],
    });
  });

  test("validateVerbose invalid with annotation", async () => {
    const schema = JSON.stringify({
      "properties": {
        "name": {
          "type": "string"
        },
        "rating": {
          "type": "number",
          "renderer": "RatingRenderer"
        }
      }
    })
    const instance = JSON.stringify({
      "name": 13,
      "rating": 0
    })
    const verboseOutput = await typedJson.validateVerbose(schema, instance);
    expect(verboseOutput).toEqual({
      valid: false,
      instanceLocation: "",
      keywordLocation: "",
      errors: [{
        valid: false,
        instanceLocation: "",
        keywordLocation: "/properties",
        errors: [{
          valid: false,
          instanceLocation: "/name",
          keywordLocation: "/properties/name",
          errors: [{
            "valid": false,
            "keywordLocation": "/properties/name/type",
            "instanceLocation": "/name",
            "error": "expected type: string"
          }],
        },
        {
          valid: true,
          instanceLocation: "/rating",
          keywordLocation: "/properties/rating/type",
        }, {
          valid: true,
          instanceLocation: "/rating",
          keywordLocation: "/properties/rating/renderer",
          annotation: "RatingRenderer",
        }
        ],
      }],
    });
  });

  test("validateVerbose invalid with format", async () => {
    const schema = JSON.stringify({
      "type": "string",
      "format": "date"
    })
    const instance = JSON.stringify(13);
    const verboseOutput = await typedJson.validateVerbose(schema, instance);
    expect(verboseOutput).toEqual({
      valid: false,
      keywordLocation: "",
      instanceLocation: "",
      errors: [{
        valid: false,
        keywordLocation: "/type",
        instanceLocation: "",
        error: "expected type: string"
      },
      {
        valid: true,
        keywordLocation: "/format",
        instanceLocation: "",
        annotation: "date"
      }]
    });
  })

  test("suggest", async () => {
    const suggestOutput = await typedJson.suggest(
      `{"type":"string"}`,
      "13",
      "",
    );
    expect(suggestOutput).toEqual([
      {
        location: "/type",
        values: [""],
      },
    ]);
  });
});
