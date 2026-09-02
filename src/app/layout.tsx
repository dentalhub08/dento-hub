import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { StoreProvider } from "@/components/store-provider";
import { Header } from "@/components/header";
import { CatalogProvider } from "@/components/catalog-provider";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: {
    default: "DENTO HUB — Your Dental Supply Hub",
    template: "%s | DENTO HUB",
  },
  description:
    "Dental supplies for students in Egypt. Shop by course, year and university.",
  icons: { icon: "/dento-hub-tooth.png" },
  openGraph: {
    title: "DENTO HUB — Your Dental Supply Hub",
    description:
      "Dental supplies for students in Egypt. Shop by course, year and university.",
    images: [
      {
        url: "/dento-hub-logo.png",
        width: 2128,
        height: 739,
        alt: "DENTO HUB — Your Dental Supply Hub",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* Loads the public Supabase config from Cloudflare runtime BEFORE hydration. */}
        <Script src="/api/supabase-config" strategy="beforeInteractive" />

        <StoreProvider>
          <CatalogProvider>
            <div className="storefront">
              <Header />
              {children}
              <Footer />
            </div>
          </CatalogProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
