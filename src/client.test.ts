import { Link, OperationInfo } from "./common";
import { service, operation } from "./operation";
import { ServiceClient, OperationHandle } from "./client";

const myService = service("myService", {
  myOp: operation<string, string>(),
});

export async function serviceClientTypeCheck(c: ServiceClient<typeof myService>) {
  // sync vs. async result
  {
    const res = await c.startOperation("myOp", "bar");
    if (res.type === "sync") {
      const _r: string = res.result;
      const _l: Link[] = res.links;
    } else {
      const _h: OperationHandle<string> = res.handle;
      const _l: Link[] = res.links;
    }
  }
  // execute
  {
    const _: string = await c.executeOperation(myService.operations.myOp, "bar");
  }
  // handle + methods
  {
    let handle = c.getOperationHandle("myOp", "token");
    handle = c.getOperationHandle(myService.operations.myOp, "token");
    const _i: OperationInfo = await handle.fetchInfo();
    const _r: string = await handle.fetchResult();
    const res = await handle.fetchResultWithDetails();
    const _l: Link[] = res.links;
    const _r2: string = res.result;
  }
}
