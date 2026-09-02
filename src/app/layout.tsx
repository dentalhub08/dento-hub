import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/components/store-provider";
import { Header } from "@/components/header";
import { CatalogProvider } from "@/components/catalog-provider";
import { Footer } from "@/components/footer";
import { getSupabaseRuntimeConfig } from "@/lib/supabase/runtime-config";

export const dynamic = "force-dynamic";

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await getSupabaseRuntimeConfig();

  const publicConfigScript =
    config.url && config.key
      ? `window.__DENTO_SUPABASE__=${JSON.stringify({
          url: config.url,
          key: config.key,
        }).replace(/</g, "\\u003c")};`
      : "";

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {publicConfigScript ? (
          <script
            id="dento-supabase-runtime-config"
            dangerouslySetInnerHTML={{ __html: publicConfigScript }}
          />
        ) : null}
      </head>
      <body>
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
