import type { AppProps } from 'next/app';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';
import { SessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';
import { cal, inter } from '@/styles/fonts';
import cx from 'classnames';

import '@/styles/globals.css';

export default function App({
	Component,
	pageProps: { session, ...pageProps },
}: AppProps<{ session: Session }>) {
	return (
		<SessionProvider session={session}>
			<main className={cx(cal.variable, inter.variable)}>
				<Component {...pageProps} />
			</main>
			<Toaster position="bottom-center" />
			<Analytics />
		</SessionProvider>
	);
}
