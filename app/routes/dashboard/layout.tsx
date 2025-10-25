import React from "react";
import { Outlet, redirect } from "react-router";
import { AppSidebar } from "~/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import type { Route } from "./+types/layout";
import { getAuth } from "@clerk/react-router/server";

export const loader = async (args: Route.LoaderArgs) => {
  const { isAuthenticated } = await getAuth(args);

  if (!isAuthenticated) {
    return redirect("/?redirect_url=" + args.request.url);
  }

  return null;
};

export default function DashboardLayout() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 62)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="sidebar" />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
