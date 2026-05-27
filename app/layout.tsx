import "./globals.css";

export const metadata = {
  title: "FirmaCheck ✅ | Rychlé ověření firem",
  description: "Webová aplikace pro ověřování českých firem podle IČO přes API ARES.",
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs">
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}