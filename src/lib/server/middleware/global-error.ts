import z from "zod";
import {createMiddleware} from "@tanstack/react-start";
import pinoLogger from "~/lib/server/core/pino-logger";
import {sendAdminErrorMail} from "~/lib/utils/mail-sender";
import {isNotFound, isRedirect} from "@tanstack/react-router";
import {FormattedError, FormZodError} from "~/lib/utils/error-classes";


const isProduction = process.env.NODE_ENV === "production";


/**
 * Error Types and Logic
 * Error - `notFound`: not thrown but returned and handled frontend side by tanstack router.
 * Error - FormattedError: Expected Error with pre-formatted message for frontend side.
 * Error - FormattedError(sendMail: true): Error not supposed to happen but pre-formatted message and send mail.
 * Error - FormZodError: Error occurred during Form submission, return the whole error.
 * Error - ZodError: Unexpected Error on (POST) validation, send admin email, return generic error message.
 * Error - Error: Unexpected Error anywhere, send admin email, return generic error message.
 **/
export const errorMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
    try {
        const results = await next();
        if ("error" in results && results.error !== undefined && !isRedirect(results.error) && !isNotFound(results.error)) {
            throw results.error;
        }

        return results;
    }
    catch (err: any) {
        if (!isProduction) {
            console.error("ServerFunc Error:", { err });
        }

        if (err instanceof FormattedError) {
            pinoLogger.info({ err }, `FormattedError Caught: ${err.message}`);
            if (isProduction && err.sendMail) {
                await sendAdminErrorMail(err, "Specific Formatted Error Occurred");
            }

            throw err;
        }

        if (err instanceof FormZodError) {
            throw err;
        }

        let errorMessageForLog = "Unexpected Error";
        const originalError = err instanceof Error ? err : new Error(String(err));
        if (err instanceof z.ZodError) {
            errorMessageForLog = "Unexpected Zod validation error";
            originalError.message = "A validation error occurred. Please try again later.";
        }

        pinoLogger.error({ err: originalError }, errorMessageForLog);

        if (isProduction) {
            await sendAdminErrorMail(originalError, errorMessageForLog);
        }

        throw new Error("An unexpected error occurred. Please try again later.");
    }
});
