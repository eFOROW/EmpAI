import type { AppProps } from 'next/app';
import { AuthProvider } from '@/lib/firebase/authProvider';

function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
        <Component {...pageProps}/>
    </AuthProvider>
  );
}
export default App;