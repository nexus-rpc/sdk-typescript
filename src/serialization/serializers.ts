import { injectSymbolBasedInstanceOf } from "../internal/symbol-instanceof";
import { Content } from "./content";
import { Serializer } from "./serializer";

/**
 * A {@link Serializer} that composes multiple serializers together.
 *
 * During serialization, each serializer is tried in sequence until one succeeds to serialize the
 * given value. During deserialization, each serializer is tried in reverse sequence until one
 * succeeds to deserialize the given {@link Content}.
 *
 * Child serializers must throw an {@link IncompatibleSerializerError} to indicate that they
 * cannot serialize or deserialize the given value or {@link Content}. Any other error type
 * (e.g. one that would be caused by a validation error) will immediately stop the sequence and be
 * propagated to the caller.
 *
 * If no serializer was able to serialize or deserialize the value or content, the
 * `CompositeSerializer` itself throws an {@link IncompatibleSerializerError}.
 *
 * @experimental
 */
export class CompositeSerializer implements Serializer {
  constructor(private readonly serializers: Serializer[]) {}

  serialize(value: unknown, typeHint?: unknown): Content {
    for (const serializer of this.serializers) {
      try {
        return serializer.serialize(value, typeHint);
      } catch (error) {
        if (error instanceof IncompatibleSerializerError) {
          continue;
        }
        throw error;
      }
    }

    throw new IncompatibleSerializerError();
  }

  deserialize<T = unknown>(content: Content, typeHint?: unknown): T {
    for (const serializer of this.serializers) {
      try {
        return serializer.deserialize(content, typeHint);
      } catch (error) {
        if (error instanceof IncompatibleSerializerError) {
          continue;
        }
        throw error;
      }
    }

    throw new IncompatibleSerializerError();
  }
}

/**
 * An error to be thrown by a {@link Serializer} if it is unable to serialize a given value, or
 * deserialize a given {@link Content}.
 *
 * This error type is only a convenience. Implementors may alternatively choose to throw any other
 * error in that case, instead of this specific error,
 *
 * @experimental
 */
export class IncompatibleSerializerError extends Error {}
injectSymbolBasedInstanceOf(IncompatibleSerializerError, "IncompatibleSerializerError");

/**
 * @experimental
 */
export class NullSerializer implements Serializer {
  serialize(value: unknown, _typeHint?: unknown): Content {
    if (value == null) {
      return { headers: {}, data: undefined };
    }

    throw new IncompatibleSerializerError();
  }

  deserialize<T = unknown>(content: Content, _typeHint?: unknown): T {
    if (content.data == null) {
      return undefined as T;
    }

    throw new IncompatibleSerializerError();
  }
}

/**
 * @experimental
 */
export class JsonSerializer implements Serializer {
  serialize(value: unknown, _typeHint?: unknown): Content {
    return {
      headers: {
        "content-type": "application/json",
      },
      data: Buffer.from(JSON.stringify(value)),
    };
  }

  deserialize<T = unknown>(content: Content, _typeHint?: unknown): T {
    const type = content.headers["content-type"];
    const data = content.data;

    if (type === "application/json" && data != null) {
      return JSON.parse(Buffer.from(data).toString("utf-8")) as T;
    }

    throw new IncompatibleSerializerError();
  }
}

/**
 * @experimental
 */
export class BinarySerializer implements Serializer {
  serialize(value: unknown, _typeHint?: unknown): Content {
    if (value instanceof Uint8Array) {
      return { headers: { "content-type": "application/octet-stream" }, data: value };
    }

    throw new IncompatibleSerializerError();
  }

  deserialize<T = unknown>(content: Content, _typeHint?: unknown): T {
    const type = content.headers["content-type"];
    const data = content.data;

    if (type === "application/octet-stream" && data != null) {
      return data as T;
    }

    throw new IncompatibleSerializerError();
  }
}

/**
 * @experimental
 */
export const defaultSerializers: Serializer = new CompositeSerializer([
  new NullSerializer(),
  new BinarySerializer(),
  new JsonSerializer(),
]);
