"use client";

import { TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import type { InvoiceData } from "~/types";

export const description = "A multiple bar chart";

const chartConfig = {
  amountPaid: {
    label: "Paid",
    color: "var(--color-green-600)",
  },
  amountToPay: {
    label: "UnPaid",
    color: "var(--color-red-600)",
  },
} satisfies ChartConfig;

export function ChartBarMultiple({ data }: { data: InvoiceData[] }) {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>Bar Chart - Multiple</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-96 w-full">
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar
              dataKey="amountPaid"
              fill="var(--color-green-600)"
              radius={4}
            />
            <Bar dataKey="amountToPay" fill="var(--color-red-600)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
