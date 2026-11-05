import {z} from "zod";
import {notFound} from "@tanstack/react-router";
import {FormZodError} from "@/lib/utils/error-classes";


export function tryFormZodError<T>(callback: () => T): T {
    try {
        return callback();
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            throw new FormZodError(error, "Please fix the form errors");
        }
        throw error;
    }
}


export function tryOrNotFound<T>(fn: () => T): T {
    try {
        return fn();
    }
    catch {
        throw notFound();
    }
}
