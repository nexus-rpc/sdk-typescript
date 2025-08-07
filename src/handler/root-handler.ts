import { HandlerError, OperationInfo } from "../common";
import { LazyValue, Serializer } from "../serialization";
import { HandlerStartOperationResult } from "./start-operation-result";
import {
  OperationContext,
  StartOperationContext,
  GetOperationResultContext,
  GetOperationInfoContext,
  CancelOperationContext,
} from "./operation-context";
import { ServiceHandler } from "./service-handler";
import { CompiledOperationHandlerFor } from "./operation-handler";
import { defaultSerializers } from "../serialization/serializers";

/**
 * The root Nexus handler, which dispatches Nexus requests to a collection of registered service
 * implementations, applying the configured serializer on inputs and outputs.
 *
 * @experimental
 */
export class RootHandler {
  /**
   * Constructs a new {@link RootHandler}.
   *
   * @experimental
   */
  public static create(options: RootHandlerOptions) {
    const serviceMap = new Map<string, ServiceHandler>();
    for (const s of options.services) {
      const name = s.definition.name;
      if (!name) {
        throw new TypeError("Tried to register a Nexus service with no name");
      }
      if (serviceMap.has(name)) {
        throw new TypeError(`Duplicate registration of nexus service '${name}'`);
      }
      serviceMap.set(name, s);
    }

    const serializer = options.serializer ?? defaultSerializers;

    return new RootHandler(serviceMap, serializer);
  }

  private constructor(
    /**
     * Registered service handlers to which this handler dispatches requests.
     */
    private readonly services = new Map<string, ServiceHandler>(),

    /**
     * The serializer to use for the handler.
     */
    private readonly serializer: Serializer,
  ) {}

  private getOperationHandler(ctx: OperationContext): CompiledOperationHandlerFor<any> {
    const { service, operation } = ctx;
    const serviceHandler = this.services.get(service);
    if (serviceHandler == null) {
      throw new HandlerError(
        "NOT_FOUND",
        `No service handler registered for service name '${service}'`,
      );
    }
    return serviceHandler.getOperationHandler(operation);
  }

  async start(
    ctx: StartOperationContext,
    input: LazyValue,
  ): Promise<HandlerStartOperationResult<LazyValue>> {
    const handler = this.getOperationHandler(ctx);
    const inputContent = await input.consume();
    const inputValue = this.serializer.deserialize(inputContent, handler.inputTypeHint);

    let result = await handler.start(ctx, inputValue);
    if (!result.isAsync) {
      const outputContent = this.serializer.serialize(result.value, handler.outputTypeHint);
      result = HandlerStartOperationResult.sync(LazyValue.fromContent(outputContent));
    }

    return result;
  }

  async getInfo(ctx: GetOperationInfoContext, token: string): Promise<OperationInfo> {
    return await this.getOperationHandler(ctx).getInfo(ctx, token);
  }

  async getResult(ctx: GetOperationResultContext, token: string): Promise<LazyValue> {
    const handler = this.getOperationHandler(ctx);
    const result = await handler.getResult(ctx, token);

    return LazyValue.fromContent(this.serializer.serialize(result, handler.outputTypeHint));
  }

  async cancel(ctx: CancelOperationContext, token: string): Promise<void> {
    return await this.getOperationHandler(ctx).cancel(ctx, token);
  }
}

/**
 * @experimental
 */
export interface RootHandlerOptions {
  /**
   * The services to register.
   */
  services: ServiceHandler<any>[];

  /**
   * The serializer to use for the handler. If not provided, the default serializer will be used.
   */
  serializer?: Serializer;
}
