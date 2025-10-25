import { ChartAreaInteractive } from "~/components/chart-area-interactive";
import { DataTable } from "~/components/data-table";
import { SectionCards } from "~/components/section-cards";
import { Fragment } from "react/jsx-runtime";
import type { Route } from "./+types/home";
import { SiteHeader } from "~/components/site-header";
import { getDataForDashboard } from "~/actions/ucrm.server";
import { cf_ctx } from "~/context";
import { addMonths } from "date-fns";
import { Await } from "react-router";
import { Suspense, useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { CardProps, UCRMClient, UCRMInvoice } from "~/types";
import { InvoiceStatus } from "~/constants";
import { Badge } from "~/components/ui/badge";
import {
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconInvoice,
} from "@tabler/icons-react";
import { DataFrame } from "data-forge";
export async function loader(args: Route.LoaderArgs) {
  const cf = args.context.get(cf_ctx);
  const token = cf?.cloudflare.env.UCRM_SECRET_TOKEN;
  const currentDate = new Date();
  const dateBeforeSixMonth = addMonths(currentDate, -3);
  return getDataForDashboard({ dateBeforeSixMonth, token: token! });
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard - BFN Invoices Management" },
    { name: "description", content: "Welcome to BFN Invoice Management!" },
  ];
}

type DataRecord = Partial<UCRMInvoice> & {
  client?: UCRMClient;
  totalInvoices?: number;
};

export default function DashboardPage({ loaderData }: Route.ComponentProps) {
  const {
    invoices,
    noOfClient,
    noOfInvoices,
    totalRevenue,
    noOfServices,
    activeClients,
    pendingAmount,
    groupInvoices,
  } = loaderData;

  const currency_formatter = new Intl.NumberFormat("en-ES", {
    style: "currency",
    currency: "EUR",
  });

  const invoiceColumns: ColumnDef<DataRecord>[] = [
    {
      id: "clientId",
      accessorKey: "clientId",
      header: "Client",
      cell: ({ row }) => {
        const client = row.original.client;
        if (client) {
          return (
            client?.companyName || `${client.firstName} ${client.lastName}`
          );
        }
        return `Client: ${row.original.clientId}`;
      },
    },
    {
      id: "totalInvoices",
      accessorKey: "totalInvoices",
      header: "Total Invoices",
      cell: ({ getValue }) => (
        <Badge variant={"outline"} className="text-muted-foreground px-1.5">
          <span className="bg-primary/80 border border-primary size-3 inline-flex items-center justify-center text-secondary rounded-full text-[8px]">
            {getValue<number>()}
          </span>
          {getValue<number>() > 1 ? "Invoices" : "Invoice"}
        </Badge>
      ),
    },
    {
      id: "amountPaid",
      accessorKey: "amountPaid",
      header: "Amount Paid",
      cell: ({ getValue }) =>
        getValue<number>()
          ? `${currency_formatter.format(getValue<number>())}`
          : "-",
    },
    {
      id: "amountToPay",
      accessorKey: "amountToPay",
      header: "Remaining Amount",
      cell: ({ getValue }) =>
        getValue<number>()
          ? `${currency_formatter.format(getValue<number>())}`
          : "-",
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status as 0 | 1 | 2 | 3 | 4 | 5;
        const statusText = InvoiceStatus[status];
        const isCompleted = row.original.status === 3;

        return (
          <Badge variant="outline" className="text-muted-foreground px-1.5">
            {isCompleted ? (
              <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
            ) : (
              <IconCircleXFilled className="fill-red-500 dark:fill-red-400" />
            )}
            {statusText}
          </Badge>
        );
      },
    },
  ];

  const cards = useMemo<CardProps[]>(
    () => [
      {
        title: "Total Revenue",
        value: totalRevenue,
        description: "Last three month paid invoices amount",
        // href: "/dashboard/invoices",
        format: {
          locales: "en-ES",
          options: {
            style: "currency",
            currency: "EUR",
          },
        },
      },
      {
        title: "Pending Amount",
        value: pendingAmount,
        description: "Last three month pending invoices amount",
        // href: "/dashboard/invoices",
        format: {
          locales: "en-ES",
          options: {
            style: "currency",
            currency: "EUR",
          },
        },
      },
      {
        title: "Active Customer",
        value: Promise.all([activeClients.length]).then(([clients]) => clients),
        description: "Active Customer with Services",
        href: "/dashboard/clients",
      },
      {
        title: "Active Services",
        value: noOfServices,
        description: "Overall services for all clients",
        href: "/dashboard/clients",
      },
    ],
    [activeClients, noOfClient, noOfInvoices, noOfServices]
  );

  return (
    <Fragment>
      <SiteHeader title="Dashboard" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards cards={cards} />
            <div className="px-4 lg:px-6">
              <Suspense
                fallback={
                  <div className="min-h-96 w-full rounded-xl bg-secondary animate-pulse" />
                }
              >
                <Await resolve={invoices}>
                  {(invoices) => {
                    const chartData = new DataFrame(invoices)
                      .select((invoice) => ({
                        date: invoice.createdDate.split("T")[0],
                        amountPaid: invoice.amountPaid,
                        amountPending: invoice.amountToPay,
                      }))
                      .groupBy((item) => item.date)
                      .select((group) => {
                        const amountPaid = group
                          .deflate((item) => item.amountPaid)
                          .sum();
                        const amountPending = group
                          .deflate((item) => item.amountPending)
                          .sum();

                        return {
                          date: group.first().date,
                          amountPaid,
                          amountPending,
                        };
                      })
                      .toArray();

                    return <ChartAreaInteractive data={chartData} />;
                  }}
                </Await>
              </Suspense>
            </div>
            <div className="px-4 lg:px-6">
              <Suspense
                fallback={
                  <div className="min-h-96 w-full rounded-xl bg-secondary animate-pulse" />
                }
              >
                <Await resolve={groupInvoices}>
                  {(invoices) => (
                    <DataTable data={invoices} columns={invoiceColumns} />
                  )}
                </Await>
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
}
