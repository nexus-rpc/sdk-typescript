import { Content } from "./content";

/**
 * Provides is used by the framework to serialize and deserialize an operation's input and output.
 *
 * @experimental
 */
export interface Serializer {
  /**
   * Serialize encodes a value into a {@link Content}.
   *
   * @param value - The value to serialize.
   * @param typeHint - The corresponding type hint specified on the operation definition, if any.
   *                   Type hints may be used to provide guidance to the serializer (e.g. to specify
   *                   the expected JSON schema, the Protobuf message type, etc).
   *
   * The Nexus RPC SDK itself does not support type hints, and does not specify the nature of type
   * hints.
   */
  serialize(value: unknown, typeHint?: unknown): Content;

  /**
   * Deserialize decodes a {@link Content} into a value.
   *
   * @param content - The content to deserialize.
   * @param typeHint - The corresponding type hint specified on the operation definition, if any.
   *                   Type hints may be used to provide guidance to the serializer (e.g. to specify
   *                   the expected JSON schema, the Protobuf message type, etc).
   */
  deserialize<T = unknown>(content: Content, typeHint?: unknown): T;
}
