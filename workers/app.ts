import { createRequestHandler, RouterContextProvider } from "react-router";
import { app_context } from "~/context";
import type { CfContext } from "~/types";

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: CfContext;
  }
}

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

export default {
  async fetch(request, env, ctx) {
    const routeContext = new RouterContextProvider();

    routeContext.set(app_context, {
      cloudflare: { env, ctx },
    });

    Object.assign(routeContext, {
      CLERK_SECRET_KEY: env.CLERK_SECRET_KEY,
    });

    return requestHandler(request, routeContext);
  },
} satisfies ExportedHandler<Env>;
