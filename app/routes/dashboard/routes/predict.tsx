import React, { Fragment, Suspense, useEffect, useMemo } from "react";
import type { Route } from "./+types/predict";
import { SiteHeader } from "~/components/site-header";
import { app_context } from "~/context";
import { addDays, addMonths, format, parseISO } from "date-fns";
import { getFutureInvoices } from "~/actions/ucrm.server";
import type { CardProps } from "~/types";
import { SectionCards } from "~/components/section-cards";
import { DatePickerWithRange } from "~/components/ui/date-range-picker";
import { Await, useSearchParams } from "react-router";
import { DataTable } from "~/components/data-table";
import { IconClockPlay } from "@tabler/icons-react";
import { Badge } from "~/components/ui/badge";
import type { ColumnDef } from "@tanstack/react-table";
import { cn } from "~/lib/utils";
import { useSidebar } from "~/components/ui/sidebar";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Future Invoices - BFN Invoices Management" },
    { name: "description", content: "Welcome to BFN Invoice Management!" },
  ];
}

export const loader = async (args: Route.LoaderArgs) => {
  const query = new URL(args.request.url).searchParams;

  const dateFrom = query.get("date-from");
  const dateTo = query.get("date-to");

  const from = dateFrom ? parseISO(dateFrom) : null;
  const to = dateTo ? parseISO(dateTo) : null;

  const cf = args.context.get(app_context);
  const token = cf?.cloudflare.env.UCRM_SECRET_TOKEN;
  const currentDate = new Date();
  const dateAfterSixMonth = addMonths(currentDate, 1);
  const date = { from: from || currentDate, to: to || dateAfterSixMonth };
  return getFutureInvoices({
    date,
    token: token!,
  }).then((data) => {
    return {
      ...data,
      date,
    };
  });
};

export default function PredictPage({
  loaderData: {
    noOfActiveServices,
    noOfClient,
    noOfServicePlan,
    totalExpectedRevenue,
    date,
    expectedRevenue,
  },
}: Route.ComponentProps) {
  const [_, setSearchParams] = useSearchParams();

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

  const invoiceColumns: ColumnDef<any>[] = [
    {
      id: "name",
      accessorKey: "name",
      header: "Client",
    },
    {
      id: "months",
      accessorKey: "months",
      header: "Total Invoices",
      cell: ({ getValue, row }) => {
        return (
          <Badge variant={"outline"} className="text-muted-foreground px-1.5">
            <span
              className={cn(
                "size-3 inline-flex items-center justify-center text-secondary rounded-full text-[8px]",
                "bg-amber-700"
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
      cell: () => {
        return (
          <Badge variant="outline" className="text-muted-foreground px-1.5">
            <IconClockPlay />
            Upcoming
          </Badge>
        );
      },
    },
  ];

  const cards = useMemo<CardProps[]>(
    () => [
      {
        title: "Revenue Forecast to be Collected",
        value: totalExpectedRevenue,
        description: `Expected revenue from pending invoices (from ${format(date.from, "PPP")} to ${format(date.to, "PPP")})`,
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
        title: "Total Service Plans",
        value: noOfServicePlan,
        description:
          "BFN has different pricing plans structured around 3, 6, 9, 12 months and as well 6 month hibernations",
      },
      {
        title: "Active Customer",
        value: noOfClient,
        description: "Active Customer with Services",
      },
      {
        title: "Active Services",
        value: noOfActiveServices,
        description: "Overall services for all clients",
      },
    ],
    [noOfClient, noOfActiveServices, noOfServicePlan]
  );

  return (
    <Fragment>
      <SiteHeader
        title="Future Invoices"
        rightSection={
          <DatePickerWithRange
            selectedDate={date}
            disabledDates={(date) => date < addDays(new Date(), -3)}
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
          </div>
          <div className="px-4 lg:px-6 -mt-6 lg:-mt-8">
            <Suspense
              fallback={
                <div className="min-h-96 w-full rounded-xl bg-secondary animate-pulse" />
              }
            >
              <Await resolve={expectedRevenue}>
                {(invoices) => (
                  <DataTable data={invoices} columns={invoiceColumns} />
                )}
              </Await>
            </Suspense>
          </div>
        </div>
      </div>
    </Fragment>
  );
}
