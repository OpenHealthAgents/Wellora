import { createAuthClient } from "better-auth/react";
import { getBaseUrl } from "./region-shared";

export const authClient = createAuthClient(
  typeof window === "undefined"
    ? { baseURL: getBaseUrl() }
    : {}
);
