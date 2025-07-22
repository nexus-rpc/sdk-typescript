import { inputBrand, outputBrand } from "./service-definition";
import { Operation, Service } from "./service-definition";

/**
 * Constructs a service definition for a collection of operations.
 */
export function service<Ops extends PartialOperationMap>(
  name: string,
  operations: Ops,
): Service<OperationMapFromPartial<Ops>> {
  if (!name) {
    throw new TypeError("Service name must be a non-empty string");
  }
  const uniqueNames = new Set<string>();

  const fullOps: OperationMapFromPartial<Ops> = Object.fromEntries(
    Object.entries(operations).map(([key, op]) => {
      const name = op.name || key;
      if (uniqueNames.has(name)) {
        throw new TypeError(`Duplicate operation definition for ${name}`);
      }
      uniqueNames.add(name);
      return [
        key,
        {
          ...op,
          name,
        },
      ];
    }),
  ) as any; // TS is having a hard time inferring the correct type here.

  return { name, operations: fullOps };
}

/**
 * Constructs an operation definition as part of a service contract.
 */
export function operation<I, O>(op?: OperationOptions<I, O>): PartialOperation<I, O> {
  return op ?? ({} as any);
}

/**
 * Options for the {@link operation} function.
 */
export interface OperationOptions<_I, _O> {
  name?: string;
}

/**
 * A named collection of partial operation handlers. Input for the {@link service} function.
 */
export type PartialOperationMap = Record<string, PartialOperation<any, any>>;

/**
 * A type that transforms a {@link PartialOperationMap} into an {@link OperationMap}.
 */
export type OperationMapFromPartial<T extends PartialOperationMap> = {
  [K in keyof T & string]: T[K] extends PartialOperation<infer I, infer O>
    ? Operation<I, O>
    : never;
};

/**
 * A partial {@link Operation} that is used to define an operation in a {@link Service}.
 *
 * The difference between this and {@link Operation} is that the name is optional.
 */
export interface PartialOperation<I, O> {
  name?: string;
  [inputBrand]: I;
  [outputBrand]: O;
}
