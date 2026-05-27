# FirmaCheck ✅

Mini webová aplikace pro ověřování českých firem podle IČO s využitím REST API ARES, SQLite cache a vizualizací na mapě. Projekt byl vytvořen jako praktický úkol.

## 🚀 Hlavní funkce
- **Ověřování přes ARES:** Získávání reálných dat o firmách (Sídlo, DIČ, Právní forma, Datum vzniku).
- **Chytrá Cache (Turso SQLite):** Ukládání výsledků do databáze. Pokud je záznam mladší než 24 hodin, načítá se bleskově z cache. Starší záznamy se automaticky aktualizují.
- **Interaktivní mapa:** Zobrazení sídla firmy pomocí integrované Google mapy.
- **Historie a Export:** Tabulka dříve hledaných firem s možností exportu do CSV (s ošetřením české diakritiky).
- **Vizuální AI prvek:** Aplikace obsahuje logo vygenerované umělou inteligencí.

## 🛠️ Použité technologie
- **Frontend & Backend:** Next.js (App Router), React, Tailwind CSS
- **Databáze:** Turso (libSQL) - moderní serverless SQLite
- **Hosting:** Vercel

## ⚙️ Spuštění projektu lokálně
1. Naklonování repozitáře: `git clone https://github.com/compassandcatalyst-maker/firma-check.git`
2. Instalace závislostí: `npm install`
3. Nastavení proměnných prostředí: Vytvořte soubor `.env.local` a vložte `TURSO_DATABASE_URL` a `TURSO_AUTH_TOKEN`.
4. Spuštění serveru: `npm run dev`