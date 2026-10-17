/** One email through Resend — sign-in links and takedown requests both go out this way. */
export async function sendEmail(msg: { from: string; to: string | string[]; subject: string; text: string; replyTo?: string }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: msg.from, to: msg.to, subject: msg.subject, text: msg.text, reply_to: msg.replyTo }),
  });
  if (!res.ok) throw new Error(`email failed (${res.status})`);
}
