import type { AppProps } from "next/app";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import { cal, inter } from "@/styles/fonts";

import "@/styles/globals.css";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps<{ session: Session }>) {
  return (
    <SessionProvider session={session}>
      <main className={`${cal.variable} ${inter.variable})`}>
        <Component {...pageProps} />
        <Toaster position="bottom-center" />
      </main>
    </SessionProvider>
  );
}
