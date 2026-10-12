/*
 * Shared by the client hook that writes it and the server helper that reads it. It lives in its own
 * plain module: exports of a "use client" file reach the server as references, not values.
 */
export const COLS_COOKIE = "uiv.cols";
