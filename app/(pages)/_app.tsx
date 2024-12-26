// _app.tsx
import 'antd/dist/antd.css';
import Script from 'next/script'
import { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Script
          strategy="afterInteractive" 
          src={`https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=obpdge9tt1`}
        ></Script>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;