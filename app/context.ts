import { createContext } from "react-router";
import type { CloudflareContent } from "./types";

export const cf_ctx = createContext<CloudflareContent | null>(null);
