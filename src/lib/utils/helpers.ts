import {twMerge} from "tailwind-merge";
import {type ClassValue, clsx} from "clsx";


export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}


export const formatDateTime = (dateInput: string | number | Date, locales: string | undefined, options: { includeTime?: boolean } = {}) => {
    if (!dateInput) return "--";

    let date: Date;

    if (typeof dateInput === "string") {
        if (isNaN(Number(dateInput))) {
            date = new Date(dateInput);
        }
        else {
            date = new Date(Number(dateInput) * 1000);
        }
    }
    else {
        date = new Date(dateInput);
    }

    if (isNaN(date.getTime())) return "--";

    const formatOptions: Intl.DateTimeFormatOptions = {
        hour12: false,
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: options.includeTime ? "numeric" : undefined,
        minute: options.includeTime ? "numeric" : undefined,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    return new Intl.DateTimeFormat(locales, formatOptions).format(date);
};
