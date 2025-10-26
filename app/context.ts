import { createContext } from "react-router";
import type { CloudflareContent } from "./types";

export const app_context = createContext<CloudflareContent | null>(null);
