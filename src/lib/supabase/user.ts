import { headers } from "next/headers";

/** Données user injectées par le middleware via headers */
export interface ServerUser {
  id: string;
  email: string;
  createdAt: string;
}

/**
 * Récupère le user depuis les headers du middleware.
 * Élimine le 2e appel réseau getUser() dans les pages protégées.
 */
export async function getUserFromMiddleware(): Promise<ServerUser | null> {
  const h = await headers();
  const id = h.get("x-user-id");
  if (!id) return null;

  return {
    id,
    email: h.get("x-user-email") ?? "",
    createdAt: h.get("x-user-created-at") ?? "",
  };
}
