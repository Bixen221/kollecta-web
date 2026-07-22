import "./globals.css";
import Header from "@/components/Header";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "Kollecta — Dons et enchères solidaires au Sénégal",
  description: "Trouvez un don près de chez vous ou participez à des enchères solidaires. Kollecta connecte les Sénégalais autour du partage.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="antialiased">
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
