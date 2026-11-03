"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { closeShell, shellStore } from "../motion/morph";
import { OverlayShell } from "./OverlayShell";

/**
 * Shows the detail overlay's shell from the click until the overlay itself mounts and takes over
 * (Overlay closes it). If a navigation lands somewhere with no overlay, or none arrives, the
 * shell steps aside on its own.
 */
export function ShellHost() {
  const kind = useSyncExternalStore(shellStore.subscribe, shellStore.get, shellStore.server);
  const path = usePathname();
  /* the address when the shell opened: once it changes, an overlay had its chance to mount */
  const from = useRef<string | null>(null);
  useEffect(() => {
    if (!kind) return void (from.current = null);
    if (from.current === null) from.current = path;
    if (path === from.current) return;
    const t = setTimeout(closeShell, 400);
    return () => clearTimeout(t);
  }, [path, kind]);
  useEffect(() => {
    if (!kind) return;
    const t = setTimeout(closeShell, 10000);
    return () => clearTimeout(t);
  }, [kind]);
  return kind ? <OverlayShell kind={kind} /> : null;
}
