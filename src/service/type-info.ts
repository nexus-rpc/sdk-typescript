/**
 * Describes how an operation value of type `T` maps to a transfer representation of type `D`.
 *
 * A transfer representation can be more suitable for moving between a Nexus caller and handler. For example, an
 * application can map a class instance to a plain object and reconstruct the class after transfer.
 *
 * Nexus service definitions preserve this information. Protocol integrations are responsible for applying it when
 * transferring operation inputs and outputs.
 *
 * When {@link transferTypeConverter} is unspecified, `D` should be the same type as `T`.
 *
 * @experimental
 */
export interface TypeInfo<T = unknown, D = T> {
  /**
   * Converts between an application value and its transfer representation.
   */
  transferTypeConverter?: TransferTypeConverter<T, D>;
}

/**
 * Converts between an application value of type `T` and its transfer representation of type `D`.
 *
 * @experimental
 */
export interface TransferTypeConverter<T, D = unknown> {
  fromTransferType(value: D): T;
  toTransferType(value: T): D;
}
