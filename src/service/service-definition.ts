export declare const inputBrand: unique symbol;
export declare const outputBrand: unique symbol;

/**
 * Definition of a Nexus service contract, including its name and operations.
 *
 * Can only be constructed by the {@link service} function.
 */
export interface Service<Ops extends OperationMap = OperationMap> {
  name: string;
  operations: Ops;
}

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
 * A mapped type that extracts the input type from an operation in a service.
 */
export type OperationInput<T> = T extends Operation<infer I, any> ? I : any;

/**
 * A mapped type that extracts the output type from an operation in a service.
 */
export type OperationOutput<T> = T extends Operation<any, infer O> ? O : any;

/**
 * A mapped type that extracts all operation names from a service.
 */
export type OperationKey<T> = {
  [K in keyof T & string]: T[K] extends Operation<any, any> ? K : never;
}[keyof T & string];
