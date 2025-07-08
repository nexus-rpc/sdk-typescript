import { injectSymbolBasedInstanceOf } from "./helpers";

/**
 * A container for a value encoded in an underlying stream.
 * It is used to stream inputs and outputs in the various client and server APIs.
 */
export class LazyValue {
  constructor(
    readonly serializer: Serializer,

    /**
     * Headers that should include information on how to process the stream's content.
     * Headers constructed by the framework always have lower case keys.
     * User provided keys are considered case-insensitive by the framework.
     */
    readonly headers: Record<string, string>,

    /** ReadableStream that contains request or response data. May be undefined for empty data. */
    public readonly stream?: ReadableStream<Uint8Array>,
  ) {}

  /**
   * Consume the underlying reader stream, deserializing via the embedded serializer.
   */
  async consume<T = unknown>(): Promise<T> {
    if (this.stream == null) {
      // Return a default value from the serializer.
      return this.serializer.deserialize({ headers: this.headers });
    }
    const reader = this.stream.getReader();
    const chunks = Array<Uint8Array>();
    let length = 0;

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      chunks.push(value);
      length += value.length;
    }

    const data = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      data.set(chunk, offset);
      offset += chunk.length;
    }

    return this.serializer.deserialize<T>({ headers: this.headers, data });
  }
}

injectSymbolBasedInstanceOf(LazyValue, "LazyValue");

/**
 * A container for a map of headers and a byte array of data.
 *
 * It is used by the SDK's {@link Serializer} interface implementations.
 */
export interface Content {
  /**
   * Header that should include information on how to deserialize this content.
   * Headers constructed by the framework always have lower case keys.
   * User provided keys are considered case-insensitive by the framework.
   */
  headers: Record<string, string>;

  /** Request or response data. May be undefined for empty data. */
  data?: Uint8Array;
}

/**
 * Serializer is used by the framework to serialize/deserialize input and output.
 */
export interface Serializer {
  /** Serialize encodes a value into a {@link Content}. */
  serialize(value: unknown): Content;

  /** Deserialize decodes a {@link Content} into a value. */
  deserialize<T = unknown>(content: Content): T;
}
