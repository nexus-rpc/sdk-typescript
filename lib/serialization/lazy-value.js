"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LazyValue = void 0;
const symbol_instanceof_1 = require("../internal/symbol-instanceof");
/**
 * A container for a value encoded in an underlying stream.
 * It is used to stream inputs and outputs in the various client and server APIs.
 *
 * @experimental
 */
class LazyValue {
    serializer;
    headers;
    stream;
    /**
     * @experimental
     */
    constructor(serializer, 
    /**
     * Headers that should include information on how to process the stream's content.
     * Headers constructed by the framework always have lower case keys.
     * User provided keys are considered case-insensitive by the framework.
     */
    headers, 
    /**
     * ReadableStream that contains request or response data. May be undefined for empty data.
     */
    stream) {
        this.serializer = serializer;
        this.headers = headers;
        this.stream = stream;
    }
    /**
     * Consume the underlying reader stream, deserializing via the embedded serializer.
     */
    async consume() {
        if (this.stream == null) {
            // Return a default value from the serializer.
            return this.serializer.deserialize({ headers: this.headers });
        }
        const reader = this.stream.getReader();
        const chunks = Array();
        let length = 0;
        while (true) {
            const { value, done } = await reader.read();
            if (done)
                break;
            chunks.push(value);
            length += value.length;
        }
        const data = new Uint8Array(length);
        let offset = 0;
        for (const chunk of chunks) {
            data.set(chunk, offset);
            offset += chunk.length;
        }
        return this.serializer.deserialize({ headers: this.headers, data });
    }
}
exports.LazyValue = LazyValue;
(0, symbol_instanceof_1.injectSymbolBasedInstanceOf)(LazyValue, "LazyValue");
//# sourceMappingURL=lazy-value.js.map