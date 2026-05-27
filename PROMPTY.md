# 🤖 Přehled použitých AI promptů

Při vývoji byl využit AI asistent (LLM) jako "Coding partner". Níže jsou uvedeny hlavní prompty, které vedly ke vzniku výsledného kódu. Prompty byly iterativní a reagovaly na vzniklé technické překážky.
Rád používám metodu ukaž místo vysvtluj při práci s AI, kdy mu pošlu screenshot problému a problém i popíši co možná nejlépe a detailně aby AI pochopila oč kráčí při dané problematice.
ne vždy screenshot vytvořit jde

### Fáze 1: Návrh architektury a inicializace
**Prompt:**
> "Dostal jsem za úkol vytvořit webovou aplikaci pro ověřování firem z ARESu podle IČO. Musí to obsahovat SQLite databázi pro ukládání historie. Plánuji to napsat v Next.js a nasadit na Vercel. Jakou architekturu pro SQLite mi doporučíš, aby to fungovalo v serverless prostředí, a jaký je základní setup?"

### Fáze 2: Řešení závislostí a konfliktů
**Prompt:**
> "Při instalaci TypeScriptu a React typů mi npm vyhazuje chybu `ERESOLVE could not resolve`. Zřejmě je konflikt mezi Next.js a nejnovějším Reactem 19. Jak mohu tuto chybu obejít a vynutit instalaci závislostí?"

### Fáze 3: Databáze a chytrá Cache
**Prompt:**
> "Potřebuji vytvořit backendovou routu v Next.js (`route.ts`). API musí přijmout IČO a podívat se do naší Turso (SQLite) databáze. Potřebuji tam ale implementovat logiku zastarávání dat: Pokud je záznam v DB mladší než 24 hodin, vrať ho. Pokud je starší, nebo tam není vůbec, stáhni nová data z API ARESu, aktualizuj záznam v databázi (napiš mi UPSERT SQL příkaz) a data vrať na frontend."

### Fáze 4: Frontend, Mapa a CSV Export
**Prompt:**
> "Aplikace už vrací data z ARESu včetně Sídla, DIČ a Data vzniku. Potřebuji vytvořit čisté UI v Tailwind CSS. 
> 1. Vytvoř formulář pro zadání IČO.
> 2. Výsledek zobraz v mřížce (vlevo textové údaje, vpravo vlož iframe s Google Mapou, do kterého dynamicky vložíš adresu).
> 3. Pod to přidej tabulku historie vyhledaných firem a tlačítko 'Exportovat do CSV'. Napiš funkci pro CSV export v Reactu tak, aby se v Excelu nerozpadla česká diakritika."

### Fáze 5: Generování vizuálního AI prvku (DALL-E 3)
**Prompt:**
> "Minimalist flat vector logo for a modern business app called FirmaCheck. A magnifying glass checking a document with a green checkmark. Clean white background, UI design, blue and green tones."