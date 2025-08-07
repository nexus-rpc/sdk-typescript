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
import { composeMiddlewares, OperationMiddleware } from "./middleware";

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
    const middlewares = options.middlewares ?? [];

    return new RootHandler(serviceMap, serializer, middlewares);
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

    /**
     * FIXME
     */
    public readonly middlewares: OperationMiddleware[],
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

    const start = composeMiddlewares(this.middlewares, "start", handler.start);
    const result = await start(ctx, inputValue);

    if (result.isAsync) {
      return result;
    } else {
      const outputContent = this.serializer.serialize(result.value, handler.outputTypeHint);
      return HandlerStartOperationResult.sync(LazyValue.fromContent(outputContent));
    }
  }

  async getInfo(ctx: GetOperationInfoContext, token: string): Promise<OperationInfo> {
    const handler = this.getOperationHandler(ctx);
    const getInfo = composeMiddlewares(this.middlewares, "getInfo", handler.getInfo);
    return await getInfo(ctx, token);
  }

  async getResult(ctx: GetOperationResultContext, token: string): Promise<LazyValue> {
    const handler = this.getOperationHandler(ctx);
    const getResult = composeMiddlewares(this.middlewares, "getResult", handler.getResult);
    const result = await getResult(ctx, token);
    const resultContent = this.serializer.serialize(result, handler.outputTypeHint);
    return LazyValue.fromContent(resultContent);
  }

  async cancel(ctx: CancelOperationContext, token: string): Promise<void> {
    const handler = this.getOperationHandler(ctx);
    const cancel = composeMiddlewares(this.middlewares, "cancel", handler.cancel);
    return await cancel(ctx, token);
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

  /**
   * FIXME
   */
  middlewares?: OperationMiddleware[];
}
