"use client";

import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";

/* same origin, so no baseURL: the client calls /api/auth/* on whatever host serves the page */
export const authClient = createAuthClient({ plugins: [magicLinkClient()] });
