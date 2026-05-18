import { describe, expect, test } from "vitest";
import { TypedJson } from "./TypedJson.js";
import { readFileSync } from "node:fs";
import { flattenAnnotations, flattenErrors } from "./output.js";

describe("TypedJson", async () => {
  const wasmBuffer = readFileSync("./src/wasm/typedJson.wasm");
  const typedJson = await TypedJson.load(wasmBuffer.buffer);

  test("version", async () => {
    typedJson.version();
    expect(typedJson.version()).toEqual("0.13.1");
  });

  test("validate flag", async () => {
    const flag = await typedJson.validateFlag(`{"type":"string"}`, "13");
    expect(flag).toEqual(false);
  });

  test("validate valid flag", async () => {
    const flag = await typedJson.validateFlag(`{"type":"string"}`, '"foo"');
    expect(flag).toEqual(true);
  });

  test("validate basic", async () => {
    const basicOutput = await typedJson.validateBasic(
      `{"type":"string"}`,
      "13",
    );
    expect(basicOutput).toEqual({
      valid: false,
      errors: [
        {
          error: "a sub schema failed",
          instanceLocation: "",
          keywordLocation: "",
        },
        {
          error: "expected type: string",
          instanceLocation: "",
          keywordLocation: "/type",
        },
      ],
    });
  });

  test("validate basic annotation", async () => {
    const basicOutput = await typedJson.validateBasic(`{"my":"mine"}`, `"foo"`);
    expect(basicOutput).toEqual({
      valid: true,
      annotations: [
        {
          value: "mine",
          instanceLocation: "",
          keywordLocation: "/my",
        },
      ],
    });
  });

  test("validateVerbose valid", async () => {
    const schema = JSON.stringify({ type: "string" });
    const instance = JSON.stringify("foo");
    const verboseOutput = await typedJson.validateVerbose(schema, instance);
    expect(verboseOutput).toEqual({
      valid: true,
      keywordLocation: "",
      instanceLocation: "",
      annotations: [
        {
          valid: true,
          keywordLocation: "/type",
          instanceLocation: "",
        },
      ],
    });
  });

  test("validateVerbose invalid", async () => {
    const schema = JSON.stringify({ type: "string" });
    const instance = JSON.stringify(13);
    const verboseOutput = await typedJson.validateVerbose(schema, instance);
    expect(verboseOutput).toEqual({
      valid: false,
      instanceLocation: "",
      keywordLocation: "",
      errors: [
        {
          valid: false,
          instanceLocation: "",
          keywordLocation: "/type",
          error: "expected type: string",
        },
      ],
    });
  });

  test("validateVerbose valid with annotation", async () => {
    const schema = JSON.stringify({
      properties: {
        name: {
          type: "string",
        },
        rating: {
          type: "number",
          renderer: "RatingRenderer",
        },
      },
    });
    const instance = JSON.stringify({
      name: "foo",
      rating: 0,
    });
    const verboseOutput = await typedJson.validateVerbose(schema, instance);
    expect(verboseOutput).toEqual({
      valid: true,
      instanceLocation: "",
      keywordLocation: "",
      annotations: [
        {
          valid: true,
          instanceLocation: "",
          keywordLocation: "/properties",
          annotations: [
            {
              valid: true,
              instanceLocation: "/name",
              keywordLocation: "/properties/name",
              annotations: [
                {
                  valid: true,
                  instanceLocation: "/name",
                  keywordLocation: "/properties/name/type",
                },
              ],
            },
            {
              valid: true,
              instanceLocation: "/rating",
              keywordLocation: "/properties/rating",
              annotations: [
                {
                  valid: true,
                  instanceLocation: "/rating",
                  keywordLocation: "/properties/rating/type",
                },
                {
                  valid: true,
                  instanceLocation: "/rating",
                  keywordLocation: "/properties/rating/renderer",
                  annotation: "RatingRenderer",
                },
              ],
            },
          ],
        },
      ],
    });
  });

  test("validateVerbose invalid with annotation", async () => {
    const schema = JSON.stringify({
      properties: {
        name: {
          type: "string",
        },
        rating: {
          type: "number",
          renderer: "RatingRenderer",
        },
      },
    });
    const instance = JSON.stringify({
      name: 13,
      rating: 0,
    });
    const verboseOutput = await typedJson.validateVerbose(schema, instance);
    expect(verboseOutput).toEqual({
      valid: false,
      instanceLocation: "",
      keywordLocation: "",
      errors: [
        {
          valid: false,
          instanceLocation: "",
          keywordLocation: "/properties",
          errors: [
            {
              valid: false,
              instanceLocation: "/name",
              keywordLocation: "/properties/name",
              errors: [
                {
                  valid: false,
                  instanceLocation: "/name",
                  keywordLocation: "/properties/name/type",
                  error: "expected type: string",
                },
              ],
            },
            {
              valid: true,
              instanceLocation: "/rating",
              keywordLocation: "/properties/rating",
              annotations: [
                {
                  valid: true,
                  instanceLocation: "/rating",
                  keywordLocation: "/properties/rating/type",
                },
                {
                  valid: true,
                  instanceLocation: "/rating",
                  keywordLocation: "/properties/rating/renderer",
                  annotation: "RatingRenderer",
                },
              ],
            },
          ],
        },
      ],
    });
  });

  test("validateVerbose valid with format", async () => {
    const schema = JSON.stringify({
      type: "string",
      format: "date",
    });
    const instance = JSON.stringify("foo");
    const verboseOutput = await typedJson.validateVerbose(schema, instance);
    expect(verboseOutput).toEqual({
      valid: true,
      keywordLocation: "",
      instanceLocation: "",
      annotations: [
        {
          valid: true,
          keywordLocation: "/type",
          instanceLocation: "",
        },
        {
          valid: true,
          keywordLocation: "/format",
          instanceLocation: "",
          annotation: "date",
        },
      ],
    });
  });

  test("validateVerbose invalid with format", async () => {
    const schema = JSON.stringify({
      type: "string",
      format: "date",
    });
    const instance = JSON.stringify(13);
    const verboseOutput = await typedJson.validateVerbose(schema, instance);
    expect(verboseOutput).toEqual({
      valid: false,
      keywordLocation: "",
      instanceLocation: "",
      errors: [
        {
          valid: false,
          keywordLocation: "/type",
          instanceLocation: "",
          error: "expected type: string",
        },
        {
          valid: true,
          keywordLocation: "/format",
          instanceLocation: "",
          annotation: "date",
        },
      ],
    });
  });

  test("validateSchemaFlag", async () => {
    const schema = JSON.stringify({
      type: "boolean",
    });
    const output = await typedJson.validateSchemaFlag(schema);
    expect(output).toEqual(true);
  });

  test("validateSchemaBasic", async () => {
    const schema = JSON.stringify({
      type: "boolean",
    });
    const output = await typedJson.validateSchemaBasic(schema);
    expect(output).toEqual({
      annotations: [
        {
          instanceLocation: "",
          keywordLocation: '/(ignored "$schema")',
          value: '(ignored "$schema")',
        },
        {
          instanceLocation: "",
          keywordLocation: '/(ignored "$vocabulary")',
          value: '(ignored "$vocabulary")',
        },
        {
          instanceLocation: "",
          keywordLocation: "/title",
          value: "Core and Validation specifications meta-schema",
        },
        {
          absoluteKeywordLocation:
            'https://json-schema.org/draft/2020-12/meta/core#/(ignored "$schema")',
          instanceLocation: "",
          keywordLocation: '/allOf/$ref/(ignored "$schema")',
          value: '(ignored "$schema")',
        },
        {
          absoluteKeywordLocation:
            "https://json-schema.org/draft/2020-12/meta/core#/title",
          instanceLocation: "",
          keywordLocation: "/allOf/$ref/title",
          value: "Core vocabulary meta-schema",
        },
        {
          absoluteKeywordLocation:
            "https://json-schema.org/draft/2020-12/meta/core#/properties",
          instanceLocation: "",
          keywordLocation: "/allOf/$ref/properties",
          value: [],
        },
        {
          absoluteKeywordLocation:
            'https://json-schema.org/draft/2020-12/meta/applicator#/(ignored "$schema")',
          instanceLocation: "",
          keywordLocation: '/allOf/$ref/(ignored "$schema")',
          value: '(ignored "$schema")',
        },
        {
          absoluteKeywordLocation:
            "https://json-schema.org/draft/2020-12/meta/applicator#/title",
          instanceLocation: "",
          keywordLocation: "/allOf/$ref/title",
          value: "Applicator vocabulary meta-schema",
        },
        {
          absoluteKeywordLocation:
            "https://json-schema.org/draft/2020-12/meta/applicator#/properties",
          instanceLocation: "",
          keywordLocation: "/allOf/$ref/properties",
          value: [],
        },
        {
          absoluteKeywordLocation:
            'https://json-schema.org/draft/2020-12/meta/unevaluated#/(ignored "$schema")',
          instanceLocation: "",
          keywordLocation: '/allOf/$ref/(ignored "$schema")',
          value: '(ignored "$schema")',
        },
        {
          absoluteKeywordLocation:
            "https://json-schema.org/draft/2020-12/meta/unevaluated#/title",
          instanceLocation: "",
          keywordLocation: "/allOf/$ref/title",
          value: "Unevaluated applicator vocabulary meta-schema",
        },
        {
          absoluteKeywordLocation:
            "https://json-schema.org/draft/2020-12/meta/unevaluated#/properties",
          instanceLocation: "",
          keywordLocation: "/allOf/$ref/properties",
          value: [],
        },
        {
          absoluteKeywordLocation:
            'https://json-schema.org/draft/2020-12/meta/validation#/(ignored "$schema")',
          instanceLocation: "",
          keywordLocation: '/allOf/$ref/(ignored "$schema")',
          value: '(ignored "$schema")',
        },
        {
          absoluteKeywordLocation:
            "https://json-schema.org/draft/2020-12/meta/validation#/title",
          instanceLocation: "",
          keywordLocation: "/allOf/$ref/title",
          value: "Validation vocabulary meta-schema",
        },
        {
          absoluteKeywordLocation:
            "https://json-schema.org/draft/2020-12/meta/validation#/properties",
          instanceLocation: "",
          keywordLocation: "/allOf/$ref/properties",
          value: ["type"],
        },
        {
          absoluteKeywordLocation:
            'https://json-schema.org/draft/2020-12/meta/meta-data#/(ignored "$schema")',
          instanceLocation: "",
          keywordLocation: '/allOf/$ref/(ignored "$schema")',
          value: '(ignored "$schema")',
        },
        {
          absoluteKeywordLocation:
            "https://json-schema.org/draft/2020-12/meta/meta-data#/title",
          instanceLocation: "",
          keywordLocation: "/allOf/$ref/title",
          value: "Meta-data vocabulary meta-schema",
        },
        {
          absoluteKeywordLocation:
            "https://json-schema.org/draft/2020-12/meta/meta-data#/properties",
          instanceLocation: "",
          keywordLocation: "/allOf/$ref/properties",
          value: [],
        },
        {
          absoluteKeywordLocation:
            'https://json-schema.org/draft/2020-12/meta/format-annotation#/(ignored "$schema")',
          instanceLocation: "",
          keywordLocation: '/allOf/$ref/(ignored "$schema")',
          value: '(ignored "$schema")',
        },
        {
          absoluteKeywordLocation:
            "https://json-schema.org/draft/2020-12/meta/format-annotation#/title",
          instanceLocation: "",
          keywordLocation: "/allOf/$ref/title",
          value: "Format vocabulary meta-schema for annotation results",
        },
        {
          absoluteKeywordLocation:
            "https://json-schema.org/draft/2020-12/meta/format-annotation#/properties",
          instanceLocation: "",
          keywordLocation: "/allOf/$ref/properties",
          value: [],
        },
        {
          absoluteKeywordLocation:
            'https://json-schema.org/draft/2020-12/meta/content#/(ignored "$schema")',
          instanceLocation: "",
          keywordLocation: '/allOf/$ref/(ignored "$schema")',
          value: '(ignored "$schema")',
        },
        {
          absoluteKeywordLocation:
            "https://json-schema.org/draft/2020-12/meta/content#/title",
          instanceLocation: "",
          keywordLocation: "/allOf/$ref/title",
          value: "Content vocabulary meta-schema",
        },
        {
          absoluteKeywordLocation:
            "https://json-schema.org/draft/2020-12/meta/content#/properties",
          instanceLocation: "",
          keywordLocation: "/allOf/$ref/properties",
          value: [],
        },
        {
          instanceLocation: "",
          keywordLocation: "/properties",
          value: [],
        },
      ],
      valid: true,
    });
  });

  test("validateSchemaDetailed", async () => {
    const schema = JSON.stringify({
      type: "boolean",
    });
    const output = await typedJson.validateSchemaDetailed(schema);
    expect(flattenErrors(output).length).toEqual(0);
    expect(flattenAnnotations(output).length).toEqual(80);
  });

  test("validateSchemaVerbose", async () => {
    const schema = JSON.stringify({
      type: "boolean",
    });
    const output = await typedJson.validateSchemaVerbose(schema);
    expect(flattenErrors(output).length).toEqual(0);
    expect(flattenAnnotations(output).length).toEqual(82);
  });

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

  test("suggest v1", async () => {
    const schema = JSON.stringify({
      "$schema": "https://json-schema.org/v1",
      "propertyDependencies": {
        "foo": {
          "bar": {
            "const": 13
          },
          "gnu": {
            "const": 42
          }
        }
      }
    })
    {
      const suggestOutput = await typedJson.suggest(
        schema,
        "{}",
        "",
      );
      expect(suggestOutput).toEqual([
        {
          location: "/propertyDependencies",
          values: [{ foo: "bar" }, { foo: "gnu" }],
        },
      ]);
    }
    {
      const suggestOutput = await typedJson.suggest(
        schema,
        JSON.stringify({ foo: null }),
        "/foo",
      );
      expect(suggestOutput).toEqual([
        {
          location: "/propertyDependencies",
          values: ["bar", "gnu"],
        },
      ]);
    }
  });
});
