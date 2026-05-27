import { createClient } from '@libsql/client';

// Zkontrolujeme, zda máme k dispozici URL adresu databáze
if (!process.env.TURSO_DATABASE_URL) {
  throw new Error("Chybí TURSO_DATABASE_URL v .env.local souboru");
}

// Vytvoříme a exportujeme klienta, kterého budeme používat napříč aplikací
export const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});