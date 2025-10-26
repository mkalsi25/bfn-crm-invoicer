import { ChartAreaInteractive } from "~/components/chart-area-interactive";
import { DataTable } from "~/components/data-table";
import { SectionCards } from "~/components/section-cards";
import { Fragment } from "react/jsx-runtime";
import type { Route } from "./+types/home";
import { SiteHeader } from "~/components/site-header";
import { getDataForDashboard } from "~/actions/ucrm.server";
import { app_context } from "~/context";
import { addDays, addMonths, parseISO } from "date-fns";
import { Await, useSearchParams } from "react-router";
import { Suspense, useEffect, useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { CardProps, UCRMClient, UCRMInvoice } from "~/types";
import { InvoiceStatus } from "~/constants";
import { Badge } from "~/components/ui/badge";
import { IconCircleCheckFilled, IconCircleXFilled } from "@tabler/icons-react";
import { DataFrame } from "data-forge";
import { useSidebar } from "~/components/ui/sidebar";
import { cn } from "~/lib/utils";
import { DatePickerWithRange } from "~/components/ui/date-range-picker";
export async function loader(args: Route.LoaderArgs) {
  const query = new URL(args.request.url).searchParams;

  const dateFrom = query.get("date-from");
  const dateTo = query.get("date-to");

  const from = dateFrom ? parseISO(dateFrom) : null;
  const to = dateTo ? parseISO(dateTo) : null;

  const cf = args.context.get(app_context);
  const token = cf?.cloudflare.env.UCRM_SECRET_TOKEN;
  const currentDate = new Date();
  const dateBeforeSixMonth = addMonths(currentDate, -2);
  const date = { from: from || dateBeforeSixMonth, to: to || currentDate };
  return getDataForDashboard({
    date,
    token: token!,
  }).then((data) => {
    return {
      ...data,
      date,
    };
  });
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
  const [_, setSearchParams] = useSearchParams();
  const {
    invoices,
    noOfClient,
    noOfInvoices,
    totalRevenue,
    noOfServices,
    activeClients,
    pendingAmount,
    groupInvoices,
    date,
  } = loaderData;

  const { open, setOpen } = useSidebar();

  useEffect(() => {
    if (open) {
      setOpen(false);
    }
  }, []);

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
      cell: ({ getValue, row }) => {
        const isCompleted = row.original.status === 3;
        return (
          <Badge variant={"outline"} className="text-muted-foreground px-1.5">
            <span
              className={cn(
                "size-3 inline-flex items-center justify-center text-secondary rounded-full text-[8px]",
                isCompleted ? "bg-green-700" : "bg-red-700"
              )}
            >
              {getValue<number>()}
            </span>
            {getValue<number>() > 1 ? "Invoices" : "Invoice"}
          </Badge>
        );
      },
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
        description: "Last six month paid invoices amount",
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
        description: "Last six month pending invoices amount",
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
      },
      {
        title: "Active Services",
        value: noOfServices,
        description: "Overall services for all clients",
      },
    ],
    [activeClients, noOfClient, noOfInvoices, noOfServices]
  );

  return (
    <Fragment>
      <SiteHeader
        title="Dashboard"
        rightSection={
          <DatePickerWithRange
            selectedDate={date}
            disabledDates={(date) =>
              date > addDays(new Date(), 3) || date < new Date("1900-01-01")
            }
            onSelectValue={(value) => {
              const from = value?.from;
              const to = value?.to;

              if (!from || !to) {
                return;
              }

              return setSearchParams((searchParams) => {
                searchParams.set("date-from", from.toISOString());
                searchParams.set("date-to", to.toISOString());
                return searchParams;
              });
            }}
          />
        }
      />
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
