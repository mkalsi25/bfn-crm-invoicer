import { SignUp } from "@clerk/react-router";
import React from "react";
import { redirect } from "react-router";
import type { Route } from "./+types/sign-up";

export const loader = async ({ request, context }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const token = url.searchParams.get("__clerk_ticket");
  if (!token) {
    return redirect("/");
  }
  return {
    haveToken: true,
  };
};

export default function SignUpPage() {
  return <SignUp routing="hash" signInUrl="/" signInForceRedirectUrl="/" />;
}
