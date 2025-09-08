/**
 * Definition of a Nexus service contract, including its name and operations.
 *
 * Can only be constructed by the {@link service} function.
 *
 * @experimental
 */
export interface ServiceDefinition<Ops extends OperationMap = OperationMap> {
  name: string;
  operations: Ops;
}

/**
 * An operation contract that describes the name, and input and output types of an operation.
 *
 * @experimental
 */
export interface OperationDefinition<I, O> {
  /**
   * The name of the operation.
   */
  name: string;

  /**
   * A type hint that will be provided to the serializer when serializing and deserializing the
   * input of this operation. It can be used for example, to indicate the expected JSON schema or
   * Protobuf message type of the input.
   *
   * The nature of type hints depends on the serializer used. The default serializers provided by
   * the Nexus RPC SDK do not expect nor use any type hints.
   */
  inputTypeHint?: unknown;

  /**
   * A type hint that will be provided to the serializer when serializing and deserializing the
   * output of this operation. It can be used for example, to indicate the expected JSON schema or
   * Protobuf message type of the output.
   *
   * The nature of type hints depends on the serializer used. The default serializers provided by
   * the Nexus RPC SDK do not expect nor use any type hints.
   */
  outputTypeHint?: unknown;

  /**
   * @see {@link inputBrand}
   * @internal
   * @hidden
   */
  [inputBrand]: I;

  /**
   * @see {@link outputBrand}
   * @internal
   * @hidden
   */
  [outputBrand]: O;
}

/**
 * A type marker used to preserve type safety on the input type of an operation.
 * This really only exists at the type level. It is not used at runtime.
 *
 * @internal
 * @hidden
 */
export declare const inputBrand: unique symbol;

/**
 * A type marker used to preserve type safety on the output type of an operation.
 * This really only exists at the type level. It is not used at runtime.
 *
 * @internal
 * @hidden
 */
export declare const outputBrand: unique symbol;

/**
 * A named collection of operations, as defined by a {@link ServiceDefinition}.
 *
 * @experimental
 */
export type OperationMap = Record<string, OperationDefinition<any, any>>;

/**
 * A mapped type that extracts the input type from an operation in a service.
 *
 * @experimental
 */
export type OperationInput<T> = T extends OperationDefinition<infer I, any> ? I : any;

/**
 * A mapped type that extracts the output type from an operation in a service.
 *
 * @experimental
 */
export type OperationOutput<T> = T extends OperationDefinition<any, infer O> ? O : any;

/**
 * A mapped type that extracts all operation names from a service.
 *
 * @experimental
 */
export type OperationKey<T> = {
  [K in keyof T & string]: T[K] extends OperationDefinition<any, any> ? K : never;
}[keyof T & string];

/**
 * Confirm that a service definition is valid.
 *
 * @param service - The service definition to validate.
 *
 * @throws {TypeError} If the service definition is invalid.
 *
 * @experimental
 */
export function validateServiceDefinition(service: ServiceDefinition) {
  if (typeof service.name !== "string" || !service.name) {
    throw new TypeError("Service name must be a non-empty string");
  }

  const operationNames = new Set<string>();
  for (const [propName, operation] of Object.entries(service.operations)) {
    const operationName = operation.name;
    if (typeof operationName !== "string" || !operationName) {
      throw new TypeError(`Operation name must be a non-empty string, for property '${propName}'`);
    }
    if (operationNames.has(operationName)) {
      throw new TypeError(`Duplicate operation definition for name: '${operationName}'`);
    }
    operationNames.add(operationName);
  }
}
