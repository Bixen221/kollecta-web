import "./globals.css";
import Header from "@/components/Header";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ReservationsProvider } from "@/context/ReservationsContext";

export const metadata = {
  metadataBase: new URL('https://kollecta-web-teal.vercel.app'),
  title: {
    default: "Kollecta — Dons et enchères solidaires au Sénégal",
    template: "%s",
  },
  description: "Trouvez un don près de chez vous ou participez à des enchères solidaires. Kollecta connecte les Sénégalais autour du partage de nourriture, de matériel et d'objets.",
  keywords: ["dons Sénégal", "enchères Sénégal", "solidarité Dakar", "don nourriture", "entraide sénégalaise", "Kollecta"],
  authors: [{ name: "Kollecta" }],
  openGraph: {
    title: "Kollecta — Dons et enchères solidaires au Sénégal",
    description: "Trouvez un don près de chez vous ou participez à des enchères solidaires.",
    url: "https://kollecta-web-teal.vercel.app",
    siteName: "Kollecta",
    locale: "fr_SN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kollecta — Dons et enchères solidaires au Sénégal",
    description: "Trouvez un don près de chez vous ou participez à des enchères solidaires.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="antialiased">
        <ThemeProvider>
          <AuthProvider>
            <ReservationsProvider>
              <Header />
              {children}
            </ReservationsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
