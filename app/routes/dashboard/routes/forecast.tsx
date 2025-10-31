import React, { Fragment, Suspense, useMemo } from "react";
import { ChartBarMultiple } from "~/components/bar-chart";
import { SectionCards } from "~/components/section-cards";
import { SiteHeader } from "~/components/site-header";
import type { CardProps } from "~/types";
import type { Route } from "./+types/forecast";
import { addMonths, parseISO } from "date-fns";
import { app_context } from "~/context";
import { DatePickerWithRange } from "~/components/ui/date-range-picker";
import { Await, useRevalidator, useSearchParams } from "react-router";
import { Loader } from "lucide-react";
import { getForecast } from "~/actions/ucrm.server";

export async function loader(args: Route.LoaderArgs) {
  const query = new URL(args.request.url).searchParams;

  const dateFrom = query.get("date-from");
  const dateTo = query.get("date-to");

  const from = dateFrom ? parseISO(dateFrom) : null;
  const to = dateTo ? parseISO(dateTo) : null;

  const cf = args.context.get(app_context);
  const token = cf?.cloudflare.env.UCRM_SECRET_TOKEN;
  const currentDate = new Date();
  const dateBeforeSixMonth = addMonths(currentDate, -6);
  const date = { from: from || dateBeforeSixMonth, to: to || currentDate };
  return getForecast({ token: token!, date });
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Forecast - BFN Invoices Management" },
    { name: "description", content: "Welcome to BFN Invoice Management!" },
  ];
}

export default function Forecast({
  loaderData: { date, invoicesData, totalExpectedRevenue, invoicesTobeSent },
}: Route.ComponentProps) {
  const [_, setSearchParams] = useSearchParams();
  const revalidator = useRevalidator();
  const cards = useMemo<CardProps[]>(
    () => [
      {
        title: "Revenue Forecast to be Collected",
        value: Promise.all([totalExpectedRevenue]).then((v) => v[0]),
        description: `Expected revenue from pending invoices`,
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
        title: "Number of Invoices to be sent",
        value: invoicesTobeSent,
        description: "Total invoices to be sent",
      },
    ],
    []
  );

  return (
    <Fragment>
      <SiteHeader
        title="Forecast"
        rightSection={
          <div className="inline-flex gap-4 items-center">
            <DatePickerWithRange
              selectedDate={date}
              disabledDates={undefined}
              disabled={revalidator.state === "loading"}
              onSelectValue={(value) => {
                const from = value?.from;
                const to = value?.to;

                if (!from || !to) {
                  return;
                }

                setSearchParams((searchParams) => {
                  searchParams.set("date-from", from.toISOString());
                  searchParams.set("date-to", to.toISOString());
                  return searchParams;
                });

                revalidator.revalidate();

                return;
              }}
            />

            {revalidator.state === "loading" && (
              <Loader className="animate-spin" />
            )}
          </div>
        }
      />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards cards={cards} />
          </div>
          <div className="px-4 lg:px-6">
            <Suspense
              fallback={
                <div className="min-h-96 w-full rounded-xl bg-secondary animate-pulse" />
              }
            >
              <Await resolve={invoicesData}>
                {(resolvedData) => <ChartBarMultiple data={resolvedData} />}
              </Await>
            </Suspense>
          </div>
        </div>
      </div>
    </Fragment>
  );
}
