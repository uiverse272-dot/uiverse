import { getAuth } from "@/lib/auth";

/* Better Auth's endpoints: sign-in, callbacks, magic-link verification, session, sign-out */
async function handle(request: Request) {
  const auth = await getAuth();
  if (!auth) return Response.json({ error: "Accounts are off on this server." }, { status: 404 });
  return auth.handler(request);
}

export { handle as GET, handle as POST };
