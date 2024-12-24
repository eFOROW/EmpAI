// _app.tsx
import 'antd/dist/antd.css'; // Ant Design 스타일 임포트
import { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;