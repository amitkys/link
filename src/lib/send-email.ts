import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
    to,
    subject,
    html,
    text,
}: {
    to: string;
    subject: string;
    html: string;
    text: string;
}) {
    const { data, error } = await resend.emails.send({
        from: "link@id0.uk",
        to: to,
        subject: subject,
        html: html,
        text: text,
    });

    if (error) {
        console.error("[ERROR]: Resend API Error:", error);
        throw new Error(error.message || "Failed to send email");
    }

    return data;
}