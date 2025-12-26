import "./globals.scss";
import { Metadata } from "next";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import { APP_NAME } from "./constants";
import AuthGuard from "./auth-guard";
import { ThemeProvider } from "./(main)/context/ThemeContext";
import ThemeSwitcher from "./(main)/components/theme/ThemeSwitcher";

export const metadata: Metadata = {
  title: APP_NAME,
  description: "A/B Testing Tool Admin Panel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          id="theme-link"
          rel="stylesheet"
          href="/themes/lara-light-indigo/theme.css"
        />
      </head>
      <body>
        <ThemeProvider>
          <AuthGuard>{children}</AuthGuard>
          <ThemeSwitcher />
        </ThemeProvider>
      </body>
    </html>
  );
}
