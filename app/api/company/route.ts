import { NextResponse } from 'next/server';
import { turso } from '../../../lib/db'; 

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ico = searchParams.get('ico');

  if (!ico) {
    return NextResponse.json({ error: 'IČO je povinné' }, { status: 400 });
  }

  try {
    // 1. Zkusíme najít firmu v Cache
    const dbResult = await turso.execute({
      sql: 'SELECT * FROM companies WHERE ico = ?',
      args: [ico],
    });

    // LOGIKA PRO ZASTARÁNÍ CACHE (Platnost 24 hodin)
    if (dbResult.rows.length > 0) {
      const company = dbResult.rows[0];
      
      // Výpočet stáří dat
      const searchedAt = new Date(company.searched_at as string);
      const now = new Date();
      const hoursDiff = (now.getTime() - searchedAt.getTime()) / (1000 * 60 * 60);

      // Pokud jsou data mladší než 24 hodin, vrátíme je. Jinak jdeme stahovat z ARESu.
      if (hoursDiff < 24) {
        return NextResponse.json({
          ico: company.ico,
          name: company.name,
          address: company.address,
          dic: company.dic,
          legal_form: company.legal_form,
          created_date: company.created_date,
          cz_nace: company.cz_nace, // NOVÉ: Načtení NACE z cache
          capital: company.capital, // NOVÉ: Načtení kapitálu z cache
          source: 'cache'
        });
      }
    }

    // 2. Dotaz na ARES (pokud v DB není, nebo je stará)
    const aresRes = await fetch(`https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${ico}`);

    if (!aresRes.ok) {
       return NextResponse.json({ error: 'Firma s tímto IČO nebyla nalezena' }, { status: 404 });
    }

    const aresData = await aresRes.json();
    
    // Zpracování základních dat
    const name = aresData.obchodniJmeno;
    const sidlo = aresData.sidlo;
    const ulice = sidlo.nazevUlice || sidlo.nazevObce;
    const cislo = sidlo.cisloOrientacni ? `${sidlo.cisloDomovni}/${sidlo.cisloOrientacni}` : sidlo.cisloDomovni;
    const address = `${ulice} ${cislo}, ${sidlo.psc} ${sidlo.nazevObce}`;
    const dic = aresData.dic || 'Není plátce DPH';
    const legal_form = aresData.pravniForma || 'Nezadáno';
    
    let created_date = 'Nezadáno';
    if (aresData.datumVzniku) {
        const dateObj = new Date(aresData.datumVzniku);
        created_date = dateObj.toLocaleDateString('cs-CZ');
    }

    // NOVÉ: Bezpečné parsování našich bonusových dat z ARESu
    const cz_nace = aresData.czNace ? aresData.czNace.join(', ') : null;
    const capital = aresData.zakladniKapital?.vyse ? aresData.zakladniKapital.vyse : null;

    // 3. UPSERT - Vložíme novou firmu, NEBO aktualizujeme existující, pokud tam už byla
    await turso.execute({
      sql: `
        INSERT INTO companies (ico, name, address, dic, legal_form, created_date, cz_nace, capital, searched_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(ico) DO UPDATE SET 
          name = excluded.name,
          address = excluded.address,
          dic = excluded.dic,
          legal_form = excluded.legal_form,
          created_date = excluded.created_date,
          cz_nace = excluded.cz_nace,
          capital = excluded.capital,
          searched_at = CURRENT_TIMESTAMP
      `,
      args: [ico, name, address, dic, legal_form, created_date, cz_nace, capital],
    });

    // 4. Vrácení dat uživateli
    return NextResponse.json({
      ico, name, address, dic, legal_form, created_date, cz_nace, capital, source: 'ares'
    });

  } catch (error) {
    console.error('Chyba v API:', error);
    return NextResponse.json({ error: 'Nastala chyba při zpracování požadavku' }, { status: 500 });
  }
}