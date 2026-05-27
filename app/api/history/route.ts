import { NextResponse } from 'next/server';
import { turso } from '../../../lib/db'; 

export async function GET() {
  try {
    // Vytáhneme všechny firmy a seřadíme je podle data hledání (nejnovější nahoře)
    const dbResult = await turso.execute('SELECT * FROM companies ORDER BY searched_at DESC');
    
    return NextResponse.json(dbResult.rows);
  } catch (error) {
    console.error('Chyba při načítání historie:', error);
    return NextResponse.json({ error: 'Nastala chyba při načítání historie' }, { status: 500 });
  }
}