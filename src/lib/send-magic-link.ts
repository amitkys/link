import { sendEmail } from "./send-email";
/*
export function sendPasswordResetEmail({
    user,
    url,
}: {
    user: { email: string; name: string };
    url: string;
}) {
    return sendEmail({
        to: user.email,
        subject: "Reset Your Password",
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Reset Your Password</h2>
        <p>Hello ${user.name},</p>
        <p>You requested to reset your password. Click the button below to reset it:</p>
        <a href="${url}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 16px 0;">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
        <p>This link will expire in 24 hours.</p>
        <p>Best regards,<br>Your App Team</p>
      </div>
    `,
        text: `Hello ${user.name},\n\nYou requested to reset your password. Click this link to reset it: ${url}\n\nIf you didn't request this, please ignore this email.\n\nThis link will expire in 24 hours.\n\nBest regards,\nYour App Team`,
    });
}
*/
export function sendMagicLinkEmail({
    email,
    url,
}: {
    email: string;
    url: string;
}) {
    return sendEmail({
        to: email,
        subject: "Sign in to your account",
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Sign in to your account</h2>
        <p>Click the button below to sign in:</p>
        <a href="${url}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 16px 0;">Sign In</a>
        <p>If you didn't request this email, you can safely ignore it.</p>
        <p>Best regards,<br>Id0 Team</p>
      </div>
    `,
        text: `Click this link to sign in: ${url}\n\nIf you didn't request this email, you can safely ignore it.\n\nBest regards,\nId0 Team`,
    });
}