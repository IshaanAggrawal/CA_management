"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "test_key");

export async function sendEmailNotification(to: string, subject: string, htmlContent: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: "ProAudit CA <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      html: htmlContent,
    });

    if (error) {
      console.error("Resend Error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Resend Exception:", err);
    return { success: false, error: err };
  }
}

export async function sendWhatsAppNotification(phone: string, template: string, variables: any) {
  // Placeholder for WhatsApp API (e.g. Twilio, Gupshup, Interakt)
  // E.g. fetch('https://api.twilio.com/...', { ... })
  console.log(`[WhatsApp Mock] Sending ${template} to ${phone} with vars:`, variables);
  
  // Return true to simulate success
  return { success: true };
}
