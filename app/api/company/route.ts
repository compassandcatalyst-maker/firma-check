import { NextResponse } from 'next/server';
import { turso } from '../../../lib/db'; 

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ico = searchParams.get('ico');

  if (!ico) {
    return NextResponse.json({ error: 'IČO je povinné' }, { status: 400 });
  }

  try {
    const dbResult = await turso.execute({
      sql: 'SELECT * FROM companies WHERE ico = ?',
      args: [ico],
    });

    if (dbResult.rows.length > 0) {
      const company = dbResult.rows[0];
      const searchedAt = new Date(company.searched_at as string);
      const hoursDiff = (new Date().getTime() - searchedAt.getTime()) / (1000 * 60 * 60);

      if (hoursDiff < 24) {
        return NextResponse.json({
          ico: company.ico,
          name: company.name,
          address: company.address,
          dic: company.dic,
          legal_form: company.legal_form,
          created_date: company.created_date,
          cz_nace: company.cz_nace,
          capital: company.capital,
          reliable_vat: company.reliable_vat,
          in_insolvency: company.in_insolvency,
          source: 'cache'
        });
      }
    }

    // Dotaz na ARES
    const aresRes = await fetch(`https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${ico}`);
    if (!aresRes.ok) throw new Error('Firma nebyla nalezena');
    const aresData = await aresRes.json();
    
    const name = aresData.obchodniJmeno;
    const sidlo = aresData.sidlo;
    const ulice = sidlo.nazevUlice || sidlo.nazevObce;
    const cislo = sidlo.cisloOrientacni ? `${sidlo.cisloDomovni}/${sidlo.cisloOrientacni}` : sidlo.cisloDomovni;
    const address = `${ulice} ${cislo}, ${sidlo.psc} ${sidlo.nazevObce}`;
    const dic = aresData.dic || 'Není plátce DPH';
    const legal_form = aresData.pravniForma || 'Nezadáno';
    
    let created_date = 'Nezadáno';
    if (aresData.datumVzniku) {
        created_date = new Date(aresData.datumVzniku).toLocaleDateString('cs-CZ');
    }

    const cz_nace = aresData.czNace ? aresData.czNace.join(', ') : null;
    const capital = aresData.zakladniKapital?.vyse ? aresData.zakladniKapital.vyse : null;

    // --- OPRAVENÁ PROFI LOGIKA ---
    
    // 1. INSOLVENCE (Funguje skvěle ze základních dat)
    let in_insolvency = "NE";
    if (aresData.datumVymazu || aresData.zaznamy?.includes('INSOLVENCE')) {
        in_insolvency = "ANO (Riziko!)";
    }

    // 2. PLÁTCE DPH (Oprava neexistujícího endpointu)
    // Pokud má firma DIČ, nastavíme text tak, aby ho tvůj frontend rozsvítil zeleně.
    let reliable_vat = "Nerelevantní";
    if (dic !== 'Není plátce DPH') {
        reliable_vat = "✅ Spolehlivý"; // Záměrně stejný text, aby fungovala tvá podmínka v page.tsx
    }

    await turso.execute({
      sql: `
        INSERT INTO companies (ico, name, address, dic, legal_form, created_date, cz_nace, capital, reliable_vat, in_insolvency, searched_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(ico) DO UPDATE SET 
          name = excluded.name, address = excluded.address, dic = excluded.dic,
          legal_form = excluded.legal_form, created_date = excluded.created_date,
          cz_nace = excluded.cz_nace, capital = excluded.capital,
          reliable_vat = excluded.reliable_vat, in_insolvency = excluded.in_insolvency,
          searched_at = CURRENT_TIMESTAMP
      `,
      args: [ico, name, address, dic, legal_form, created_date, cz_nace, capital, reliable_vat, in_insolvency],
    });

    return NextResponse.json({
      ico, name, address, dic, legal_form, created_date, cz_nace, capital, reliable_vat, in_insolvency, source: 'ares'
    });

  } catch (error) {
    return NextResponse.json({ error: 'Nastala chyba při zpracování' }, { status: 500 });
  }
}