/**
 * Domains and email addresses, shared by the takedown form, the opt-out list and sign-in.
 * No Node imports: lib/captures reaches the browser through the catalogue.
 */

/** "https://www.Example.com/page" → "example.com" */
export const normalizeDomain = (input: string) =>
  input.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/[/:?#].*$/, "");

export const isDomain = (d: string) => d.length <= 253 && /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(d);

/** `host` is `domain` or one of its subdomains — what an opt-out and a takedown cover */
export const onDomain = (host: string, domain: string) => host === domain || host.endsWith(`.${domain}`);

export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
