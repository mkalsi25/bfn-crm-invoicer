import { IconLoader2 } from "@tabler/icons-react";
import React from "react";
import { Await, Link } from "react-router";

import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Skeleton } from "./ui/skeleton";
import { AlertCircleIcon, ArrowRight } from "lucide-react";
import { Alert, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import type { CardProps } from "~/types";

export function SectionCards({ cards }: { cards: CardProps[] }) {
  return (
    <div className="*:data-[slot=card]:from-green-700/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {cards.map((card, key) => (
        <React.Suspense key={key} fallback={<SekeltonItem />}>
          <Await
            resolve={card.value}
            errorElement={
              <Alert variant="destructive">
                <AlertCircleIcon />
                <AlertTitle>Unable to load data.</AlertTitle>
              </Alert>
            }
          >
            {(resolvedValue) => {
              const currency_formatter = new Intl.NumberFormat(
                card.format?.locales,
                card.format?.options
              );
              return (
                <Card className="@container/card">
                  <CardHeader>
                    <CardDescription>{card.title}</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                      {card.format
                        ? `${currency_formatter.format(resolvedValue || 0)}`
                        : resolvedValue}
                    </CardTitle>
                    {card.href && (
                      <CardAction>
                        <Button asChild size="icon" variant="secondary">
                          <Link to={card.href}>
                            <ArrowRight />
                          </Link>
                        </Button>
                      </CardAction>
                    )}
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="text-muted-foreground">
                      {card.description}
                    </div>
                  </CardFooter>
                </Card>
              );
            }}
          </Await>
        </React.Suspense>
      ))}
    </div>
  );
}

const SekeltonItem = () => {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>
          <Skeleton className="h-5 w-44" />
        </CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          <Skeleton className="h-10 w-12" />
        </CardTitle>
        <CardAction>
          <div className="size-5 rounded-md items-center flex justify-center bg-secondary animate-pulse">
            <IconLoader2 className="animate-spin" />
          </div>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="text-muted-foreground">
          <Skeleton className="h-10 w-56" />
        </div>
      </CardFooter>
    </Card>
  );
};
