import { Serializer } from "./serializer";
/**
 * A container for a value encoded in an underlying stream.
 * It is used to stream inputs and outputs in the various client and server APIs.
 *
 * @experimental
 */
export declare class LazyValue {
    readonly serializer: Serializer;
    /**
     * Headers that should include information on how to process the stream's content.
     * Headers constructed by the framework always have lower case keys.
     * User provided keys are considered case-insensitive by the framework.
     */
    readonly headers: Record<string, string>;
    /**
     * ReadableStream that contains request or response data. May be undefined for empty data.
     */
    readonly stream?: ReadableStream<Uint8Array> | undefined;
    /**
     * @experimental
     */
    constructor(serializer: Serializer, 
    /**
     * Headers that should include information on how to process the stream's content.
     * Headers constructed by the framework always have lower case keys.
     * User provided keys are considered case-insensitive by the framework.
     */
    headers: Record<string, string>, 
    /**
     * ReadableStream that contains request or response data. May be undefined for empty data.
     */
    stream?: ReadableStream<Uint8Array> | undefined);
    /**
     * Consume the underlying reader stream, deserializing via the embedded serializer.
     */
    consume<T = unknown>(): Promise<T>;
}
