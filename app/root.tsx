import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { clerkMiddleware, rootAuthLoader } from "@clerk/react-router/server";
import type { Route } from "./+types/root";
import "./app.css";
import { ClerkLoaded, ClerkLoading, ClerkProvider } from "@clerk/react-router";

export const middleware: Route.MiddlewareFunction[] = [clerkMiddleware()];

export const loader = (args: Route.LoaderArgs) => rootAuthLoader(args);

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  {
    rel: "icon",
    href: "https://www.befreenetworks.com/logo.png",
  },
  {
    rel: "apple-touch-icon",
    href: "https://www.befreenetworks.com/logo.png",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  return (
    <ClerkProvider loaderData={loaderData}>
      <ClerkLoading>
        <div className="flex items-center justify-center gap-4 h-screen w-screen">
          <img
            src="https://www.befreenetworks.com/logo.png"
            className="size-5! animate-spin rounded-full"
          />
          <span className="text-base font-semibold">Loading....</span>
        </div>
      </ClerkLoading>
      <ClerkLoaded>
        <Outlet />
      </ClerkLoaded>
    </ClerkProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
