import {z} from "zod";
import {serverEnv} from "~/env/server";
import {render} from "@react-email/render";
import {Options} from "nodemailer/lib/mailer";
import {createServerOnlyFn} from "@tanstack/react-start";
import ErrorEmail from "~/lib/client/components/emails/ErrorsEmail";
import RegisterEmail from "~/lib/client/components/emails/RegisterEmail";
import PasswordResetEmail from "~/lib/client/components/emails/PasswordResetEmail";


interface EmailOptions {
    to: string;
    link: string;
    subject: string;
    username: string;
    template: "resetPassword" | "register";
}


// Password Reset and Verification Email
export const sendEmail = createServerOnlyFn(() => async (options: EmailOptions) => {
    const { default: nodemailer } = await import("nodemailer");

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: serverEnv.ADMIN_MAIL_USERNAME,
            pass: serverEnv.ADMIN_MAIL_PASSWORD,
        },
    });

    let emailHtml: string;
    if (options.template === "register") {
        emailHtml = await render(RegisterEmail({ username: options.username, link: options.link }));
    }
    else {
        emailHtml = await render(PasswordResetEmail({ username: options.username, link: options.link }));
    }

    const mailOptions: Options = {
        to: options.to,
        html: emailHtml,
        subject: options.subject,
        from: serverEnv.ADMIN_MAIL_USERNAME,
    };

    await transporter.sendMail(mailOptions);
})();


// Error email to Admin
export const sendAdminErrorMail = createServerOnlyFn(() => async (error: Error | z.ZodError, message: string) => {
    const { default: nodemailer } = await import("nodemailer");

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: serverEnv.ADMIN_MAIL_USERNAME,
            pass: serverEnv.ADMIN_MAIL_PASSWORD,
        },
    });

    const errorData = {
        message: message,
        stack: error.stack,
        errorName: error.name,
        errorMessage: error.message,
        timestamp: new Date().toISOString(),
    }

    const emailHtml = await render(ErrorEmail({ ctx: errorData }));

    const mailOptions: Options = {
        html: emailHtml,
        to: serverEnv.ADMIN_MAIL_USERNAME,
        from: serverEnv.ADMIN_MAIL_USERNAME,
        subject: "Famiglia-Recipes - An Error Occurred",
    };

    await transporter.sendMail(mailOptions);
})();
