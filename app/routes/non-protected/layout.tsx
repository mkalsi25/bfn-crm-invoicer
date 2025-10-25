import React from "react";
import { Outlet, redirect } from "react-router";
import type { Route } from "./+types/layout";
import { getAuth } from "@clerk/react-router/server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Authentication - BFN Invoices Management" },
    { name: "description", content: "Welcome to BFN Invoice Management!" },
  ];
}

export const loader = async (args: Route.LoaderArgs) => {
  const { isAuthenticated } = await getAuth(args);

  if (isAuthenticated) {
    return redirect("/dashboard");
  }

  return null;
};

export default function AuthLayout() {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen">
      <Outlet />
    </div>
  );
}
