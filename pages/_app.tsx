import type { AppProps } from "next/app";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import Script from "next/script";

import "@/styles/globals.css";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps<{ session: Session }>) {
  return (
    <SessionProvider session={session}>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-0VCBCMGGN2-1"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){window.dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'G-0VCBCMGGN2-1');
            `}
      </Script>
      <main>
        <Component {...pageProps} />
        <Toaster position="bottom-center" />
      </main>
    </SessionProvider>
  );
}
