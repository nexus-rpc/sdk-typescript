import { mapKeyValues } from "../internal/object-utils";
import { Simplify } from "../internal/types";
import { inputBrand, outputBrand, validateServiceDefinition } from "./service-definition";
import { OperationDefinition, ServiceDefinition } from "./service-definition";

/**
 * Construct a service definition for a collection of operations.
 *
 * @experimental
 */
export function service<Ops extends PartialOperationMap>(
  name: string,
  operations: Ops,
): ServiceDefinition<Simplify<OperationMapFromPartial<Ops>>> {
  const service = {
    name,
    operations: mapKeyValues(operations, (key, op: PartialOperation<any, any>) => ({
      ...op,
      name: op.name || key,
    })),
  } as ServiceDefinition<OperationMapFromPartial<Ops>>;

  validateServiceDefinition(service);
  return service;
}

/**
 * Construct an operation definition as part of a service contract.
 *
 * @experimental
 */
export function operation<I, O>(op?: OperationOptions<I, O>): PartialOperation<I, O> {
  return { ...op } as PartialOperation<I, O>;
}

/**
 * Options for the {@link operation} function.
 *
 * @experimental
 */
export interface OperationOptions<_I, _O> {
  /**
   * The name of the operation.
   *
   * If not provided, the name of the operation will be the name of the property representing that
   * operation in the service definition.
   */
  name?: string;

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
}

/**
 * A named collection of partial operation handlers. Input for the {@link service} function.
 *
 * @experimental
 */
export type PartialOperationMap = Record<string, PartialOperation<any, any>>;

/**
 * A type that transforms a {@link PartialOperationMap} into an {@link OperationMap}.
 *
 * @experimental
 */
export type OperationMapFromPartial<T extends PartialOperationMap> = {
  [K in keyof T & string]: T[K] extends PartialOperation<infer I, infer O>
    ? OperationDefinition<I, O>
    : never;
};

/**
 * A partial {@link OperationDefinition} that is used to define an operation in a {@link ServiceDefinition}.
 *
 * The difference between this and {@link OperationDefinition} is that the name is optional.
 *
 * @experimental
 */
export interface PartialOperation<I, O> {
  name?: string;

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
