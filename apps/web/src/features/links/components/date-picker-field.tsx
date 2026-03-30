"use client";

import { format } from "date-fns";
import { CalendarIcon, ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

type DatePickerFieldProps = {
    id?: string;
    label?: string;
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
};

export function DatePickerField({
    id = "expiresAt",
    label = "Expires at",
    value,
    onChange,
    placeholder = "Pick a date",
}: DatePickerFieldProps) {
    const selectedDate = value ? new Date(value) : undefined;

    return (
        <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor={id}>
                {label}
            </label>

            <Popover>
                <PopoverTrigger
                    render={
                        <Button
                            id={id}
                            variant="outline"
                            className="h-8 w-full justify-between rounded-lg border-input px-2.5 py-1 text-left text-sm font-normal"
                            data-empty={!selectedDate}
                        />
                    }
                >
                    <span
                        className="flex w-full items-center justify-between data-[empty=true]:text-muted-foreground"
                        data-empty={!selectedDate}
                    >
                        <span>
                            {selectedDate
                                ? format(selectedDate, "PPP")
                                : placeholder}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                            <CalendarIcon className="h-4 w-4" />
                            <ChevronDownIcon className="h-4 w-4" />
                        </span>
                    </span>
                </PopoverTrigger>

                <PopoverContent align="start" className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                            if (!date) {
                                onChange("");
                                return;
                            }

                            onChange(format(date, "yyyy-MM-dd"));
                        }}
                        defaultMonth={selectedDate}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
