# 📚 Technická dokumentace aplikace FirmaCheck

Tento dokument detailně popisuje vnitřní logiku a architekturu aplikace.

## 1. Architektura a Databáze
Pro splnění požadavku na SQLite a zároveň zajištění bezproblémového nasazení na serverless hosting (Vercel) byla zvolena platforma **Turso** (libSQL). Klasický lokální soubor `.sqlite` by ve Vercel prostředí nepřežil restarty kontejnerů. 

**Struktura tabulky `companies`:**
- `ico` (TEXT, PRIMARY KEY) - Unikátní identifikátor.
- `name` (TEXT), `address` (TEXT), `dic` (TEXT), `legal_form` (TEXT), `created_date` (TEXT) - Detaily z ARESu.
- `searched_at` (DATETIME) - Časová značka posledního vyhledání.

## 2. Logika vyhledávání a Cache (Backend)
Hlavní API routa (`/api/company`) implementuje chytrý mechanismus cache:

1. **Čtení z Cache:** Při dotazu na IČO se nejprve prohledá Turso databáze.
2. **Validace stáří dat (24h pravidlo):** Pokud je firma nalezena, aplikace vypočítá rozdíl mezi aktuálním časem a časem `searched_at`. Pokud je rozdíl menší než 24 hodin, vrací se data z databáze (Source: Cache).
3. **Dotaz na ARES:** Pokud data v databázi nejsou, nebo expirovala, aplikace se dotáže na oficiální API ARES.
4. **Zápis/Aktualizace (UPSERT):** Nová data se uloží do databáze pomocí SQL příkazu `ON CONFLICT(ico) DO UPDATE SET...`. Tím je zaručeno, že v databázi nejsou duplicity, ale záznamy se pouze aktualizují na nejnovější hodnoty.

## 3. Frontend a Uživatelské rozhraní
Frontend je postaven na Reactu s využitím Tailwind CSS pro responzivní design.
- **Zobrazení mapy:** Zajišťuje iframe směřující na Google Maps s dynamicky vloženou (a URL-enkódovanou) adresou z ARESu. Využit je parametr `object-contain` u AI loga pro dokonalé zarovnání.
- **Export do CSV:** Data z historie se mapují do řetězců. Pro správné zobrazení českých znaků (ě, š, č, ř) v MS Excel je do výstupního blobu manuálně přidán BOM znak (`\uFEFF`). Záznamy s čárkou (např. v adrese) jsou escapovány do uvozovek.