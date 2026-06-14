import {twMerge} from "tailwind-merge";
import {type ClassValue, clsx} from "clsx";


export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}


export const bgSelector = (username: string) => {
    const colors: Record<string, string> = {
        a: "bg-red-500",
        b: "bg-orange-500",
        c: "bg-amber-500",
        d: "bg-yellow-500",
        e: "bg-lime-500",
        f: "bg-green-500",
        g: "bg-emerald-500",
        h: "bg-teal-500",
        i: "bg-cyan-500",
        j: "bg-sky-500",
        k: "bg-blue-500",
        l: "bg-indigo-500",
        m: "bg-violet-500",
        n: "bg-purple-500",
        o: "bg-fuchsia-500",
        p: "bg-pink-500",
        q: "bg-rose-500",
        r: "bg-red-600",
        s: "bg-orange-600",
        t: "bg-amber-600",
        u: "bg-yellow-600",
        v: "bg-teal-600",
        w: "bg-green-600",
        x: "bg-emerald-600",
        y: "bg-lime-600",
        z: "bg-cyan-600",
    };
    const firstLetter = username.charAt(0).toLowerCase();

    return colors[firstLetter] || "bg-gray-500";
};


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
