import 'styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';

import type { AppProps } from 'next/app';

import { SessionProvider } from 'next-auth/react';
import { R22nProvider} from 'r22n';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider>
      <R22nProvider>
        <Component {...pageProps} session={pageProps.session} />
      </R22nProvider>
    </SessionProvider>
  );
};