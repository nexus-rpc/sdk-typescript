import { it, describe } from "node:test";
import * as assert from "node:assert/strict";
import { defaultSerializers } from "./serializers";

describe("Default Serializers", () => {
  it("Correctly serializes and deserializes 'undefined'", () => {
    const content = defaultSerializers.serialize(undefined);
    assert.equal(content.headers["content-type"], undefined);
    assert.equal(content.data, undefined);

    const value = defaultSerializers.deserialize(content);
    assert.equal(value, undefined);
  });

  it("Correctly serializes and deserializes 'null'", () => {
    const content = defaultSerializers.serialize(null);
    assert.equal(content.headers["content-type"], undefined);
    assert.equal(content.data, undefined);

    // Note here that the Null serializer is not strictly symmetric:
    // both `null` and `undefined` ends up being deserialized to `undefined`.
    const value = defaultSerializers.deserialize(content);
    assert.equal(value, undefined);
  });

  it("Correctly serializes and deserializes a Uint8Array", () => {
    const originalBuffer = new Uint8Array([1, 2, 3]);

    const content = defaultSerializers.serialize(originalBuffer);
    assert.equal(content.headers["content-type"], "application/octet-stream");
    assert.deepEqual(content.data, originalBuffer);

    const value = defaultSerializers.deserialize(content);
    assert.deepEqual(value, originalBuffer);
  });

  it("Correctly serializes and deserializes a simple string", () => {
    const originalString = "Hello, world!";

    const content = defaultSerializers.serialize(originalString);
    assert.equal(content.headers["content-type"], "application/json");
    assert.deepEqual(content.data, Buffer.from(JSON.stringify(originalString)));

    const value = defaultSerializers.deserialize(content);
    assert.equal(value, originalString);
  });

  it("Correctly serializes and deserializes a plain object", () => {
    const originalValue = {
      a: "Hello, world!",
      b: {
        c: [1, 2, 3],
        d: true,
      },
    };

    const content = defaultSerializers.serialize(originalValue);
    assert.equal(content.headers["content-type"], "application/json");
    assert.deepEqual(content.data, Buffer.from(JSON.stringify(originalValue)));

    const value = defaultSerializers.deserialize(content);
    assert.deepEqual(value, originalValue);
  });
});
