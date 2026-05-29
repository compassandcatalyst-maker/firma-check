"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function Home() {
  const [ico, setIco] = useState("");
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  // Funkce pro stažení historie z naší databáze
  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("Chyba při načítání historie:", err);
    }
  };

  // Automatické načtení historie při zapnutí aplikace
  useEffect(() => {
    fetchHistory();
  }, []);

  // Funkce pro vyhledání firmy
  const searchCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCompany(null);

    try {
      const res = await fetch(`/api/company?ico=${ico}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Firma nebyla nalezena");
      }

      setCompany(data);
      setIco(""); // Vyčistíme políčko po úspěšném hledání
      fetchHistory(); // Znovu načteme historii, aby se tam objevila nová firma
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Funkce pro CSV Export
  const exportToCSV = () => {
    if (history.length === 0) return;

    const headers = ["IČO", "Název", "Adresa", "DIČ", "Právní forma", "Datum vzniku"];
    
    const rows = history.map(c => [
      c.ico,
      `"${c.name}"`,
      `"${c.address}"`,
      c.dic,
      `"${c.legal_form}"`,
      c.created_date
    ]);

    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "firma_check_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Hlavní blok vyhledávání */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          
          <div className="flex justify-center mb-6">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72">
               <Image 
                 src="/logo.png" 
                 alt="FirmaCheck AI Logo" 
                 fill 
                 className="object-contain" 
                 onError={(e) => { e.currentTarget.style.display = 'none'; }} 
               />
            </div>
          </div>

          {/* Klikací nadpis pro návrat */}
          <h1 
            className="text-3xl font-extrabold text-gray-900 mb-8 text-center cursor-pointer hover:text-blue-600 transition-colors inline-block w-full"
            onClick={() => {
              setCompany(null);
              setIco("");
              setError(null);
            }}
            title="Zpět na vyhledávání"
          >
            FirmaCheck ✅
          </h1>

          <form onSubmit={searchCompany} className="flex flex-col sm:flex-row gap-4 mb-8">
            <input
              type="text"
              value={ico}
              onChange={(e) => setIco(e.target.value)}
              placeholder="Zadejte IČO (např. 27082440)"
              className="flex-1 border border-gray-300 rounded-xl px-5 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg"
              required
              pattern="[0-9]{8}"
              title="IČO musí obsahovat přesně 8 číslic"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-colors disabled:bg-blue-400 text-lg shadow-sm"
            >
              {loading ? "Hledám..." : "Vyhledat"}
            </button>
          </form>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-5 rounded-r-lg mb-8">
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Výsledek vyhledávání s mapou */}
          {company && (
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm mt-8 animate-fade-in-down">
              <div className="bg-gray-50 border-b border-gray-200 p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">{company.name}</h2>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 shadow-sm">
                  {company.source === 'cache' ? 'Naše DB Cache ⚡' : 'ARES 🌐'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">IČO</p>
                    <p className="text-lg text-gray-900 font-semibold">{company.ico}</p>
                  </div>
                  
                  {/* Původní DIČ text */}
                  <div>
                    <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">DIČ</p>
                    <p className="text-lg text-gray-900 font-semibold">{company.dic}</p>
                  </div>

                  {/* Nový Semafor na DPH */}
                  <div>
                    <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Plátce DPH</p>
                    <div className="flex items-center mt-1">
                      {company.dic && company.dic !== 'Není plátce DPH' ? (
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-bold rounded-full shadow-sm">
                          ✅ ANO
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-100 text-gray-500 text-sm font-bold rounded-full shadow-sm">
                          ❌ NE (Neplátce)
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Datum vzniku</p>
                    <p className="text-lg text-gray-900">{company.created_date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Právní forma</p>
                    <p className="text-lg text-gray-900">{company.legal_form}</p>
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Sídlo</p>
                    <p className="text-lg text-gray-900">{company.address}</p>
                  </div>

                  {/* NACE */}
                  {company.cz_nace && (
                    <div className="pt-2 border-t border-gray-100 mt-2">
                      <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Hlavní činnost (NACE)</p>
                      <p className="text-lg text-gray-900">{company.cz_nace}</p>
                    </div>
                  )}

                  {/* ZÁKLADNÍ KAPITÁL */}
                  {company.capital && (
                    <div className="pt-2 border-t border-gray-100 mt-2">
                      <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Základní kapitál</p>
                      <p className="text-lg text-gray-900">
                        {new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(company.capital)}
                      </p>
                    </div>
                  )}

                  {/* REGISTR MFČR */}
                  {company.dic && company.dic !== 'Není plátce DPH' && company.reliable_vat && (
                    <div className="pt-2 border-t border-gray-100 mt-2">
                      <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Registr plátců DPH (MFČR)</p>
                      <div className="mt-1">
                        {company.reliable_vat === '✅ Spolehlivý' ? (
                          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-bold rounded-full shadow-sm">
                            {company.reliable_vat}
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-bold rounded-full shadow-sm animate-pulse">
                            {company.reliable_vat}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

{/* VYLEPŠENÉ: Insolvenční rejstřík s automatickým vyhledáním IČO */}
                  <div className="pt-2 border-t border-gray-100 mt-2">
                    <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Insolvenční rejstřík (ISIR)</p>
                    <div className="mt-1">
                      <a 
                        href={`https://isir.justice.cz/isir/ueu/vysledek_lustrace.do?nazev_osoby=&jmeno_osoby=&ic=${company.ico}&datum_narozeni=&rc=&mesto=&cislo_senatu=&bc_vec=&rocnik=&id_osoby_puvodce=&druh_stav_konkursu=&datum_stav_od=&datum_stav_do=&aktualnost=AKTUALNI_I_UKONCENA&druh_kod_udalost=&datum_akce_od=&datum_akce_do=&nazev_osoby_f=&cislo_senatu_vsns=&druh_vec_vsns=&bc_vec_vsns=&rocnik_vsns=&cislo_senatu_icm=&bc_vec_icm=&rocnik_icm=&rowsAtOnce=50`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-bold rounded-full shadow-sm hover:bg-yellow-200 transition-colors cursor-pointer"
                      >
                        ⚠️ Prověřit ručně na Justice.cz
                      </a>
                    </div>
                  </div>
                  

                </div>

                <div className="bg-gray-100 h-64 md:h-auto relative border-t md:border-t-0 md:border-l border-gray-200">
                  <iframe
                    title="Mapa sídla"
                    width="100%"
                    height="100%"
                    style={{ border: 0, minHeight: '300px' }}
                    loading="lazy"
                    allowFullScreen
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(company.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  ></iframe>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Blok s historií a exportem */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">Uložené firmy</h2>
            <button
              onClick={exportToCSV}
              disabled={history.length === 0}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm flex items-center gap-2"
            >
              📥 Exportovat do CSV
            </button>
          </div>

          {history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                    <th className="p-4 border-b font-semibold">IČO</th>
                    <th className="p-4 border-b font-semibold">Název</th>
                    <th className="p-4 border-b font-semibold">Sídlo</th>
                    <th className="p-4 border-b font-semibold">Uloženo</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {history.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 border-b font-medium">{item.ico}</td>
                      <td className="p-4 border-b font-bold">{item.name}</td>
                      <td className="p-4 border-b text-sm">{item.address}</td>
                      <td className="p-4 border-b text-sm text-gray-500">
                        {new Date(item.searched_at).toLocaleDateString('cs-CZ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Zatím nebyly vyhledány žádné firmy.</p>
          )}
        </div>
        
      </div>
    </main>
  );
}