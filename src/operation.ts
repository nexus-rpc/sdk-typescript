declare const inputBrand: unique symbol;
declare const outputBrand: unique symbol;

/**
 * An operation contract that describes the name, and input and output types of an operation.
 */
export interface Operation<I, O> {
  name: string;
  [inputBrand]: I;
  [outputBrand]: O;
}

/**
 * A named collection of operation handlers.
 */
export type OperationMap = Record<string, Operation<any, any>>;

/**
 * A named collection of partial operation handlers. Input for the {@link service} function.
 */
export type PartialOperationMap = Record<string, PartialOperation<any, any>>;

/**
 * A type that transforms a {@link PartialOperationMap} into an {@link OperationMap}.
 */
export type OperationMapFromPartial<T extends PartialOperationMap> = {
  [K in keyof T & string]: T[K] extends PartialOperation<infer I, infer O> ? Operation<I, O> : never;
};

/**
 * A service contract that includes a name and defines a collection of operations.
 *
 * Can only be constructed by the {@link service} function.
 */
export interface Service<O extends OperationMap = OperationMap> {
  name: string;
  operations: O;
}

/**
 * Constructs a service for a collection of operations.
 */
export function service<O extends PartialOperationMap>(
  name: string,
  operations: O,
): Service<OperationMapFromPartial<O>> {
  if (!name) {
    throw new TypeError("Service name must be a non-empty string");
  }
  const uniqueNames = new Set<string>();

  const fullOps: OperationMapFromPartial<O> = Object.fromEntries(
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
 * Options for the {@link operation} function.
 */
export interface OperationOptions<_I, _O> {
  name?: string;
}

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

/**
 * Constructs an operation definition as part of a service contract.
 */
export function operation<I, O>(op?: OperationOptions<I, O>): PartialOperation<I, O> {
  return op ?? ({} as any);
}

/**
 * A key that identifies an operation in a service.
 */
export type OperationKey<T> = {
  [K in keyof T & string]: T[K] extends Operation<any, any> ? K : never;
}[keyof T & string];

/**
 * A type that extracts the input type from an operation in a service.
 */
export type OperationInput<T> = T extends Operation<infer I, any> ? I : any;

/**
 * A type that extracts the output type from an operation in a service.
 */
export type OperationOutput<T> = T extends Operation<any, infer O> ? O : any;
