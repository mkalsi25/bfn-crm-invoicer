"use client";

import * as React from "react";
import { addDays, format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { type DateRange, type DayPickerProps } from "react-day-picker";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { useIsMobile } from "~/hooks/use-mobile";

export function DatePickerWithRange({
  selectedDate,
  onSelectValue,
  disabled,
  className,
  placeholder = "Pick a date",
  disabledDates,
}: React.HTMLAttributes<HTMLDivElement> & {
  selectedDate?: DateRange;
  disabled?: boolean;
  onSelectValue: (date: DateRange | undefined) => void;
  placeholder?: string;
  disabledDates: DayPickerProps["disabled"];
}) {
  const [date, setDate] = React.useState<DateRange | undefined>(selectedDate);
  const isMobile = useIsMobile();

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild disabled={disabled}>
          <Button
            id="date"
            variant={"outline"}
            className={cn(" justify-start text-left font-normal")}
          >
            <CalendarIcon />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0"
          avoidCollisions={false}
          side="bottom"
          align="end"
        >
          <Calendar
            autoFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={(date) => {
              setDate(date);
              onSelectValue(date);
            }}
            disabled={disabledDates}
            numberOfMonths={isMobile ? 1 : 2}
            classNames={{
              day: "data-[outside='true']:opacity-20",
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
