import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cagelog — Your favorite actors, directors and sagas on Stremio',
  description: 'Your favorite actors, directors and sagas on Stremio',
  icons: {
    icon: '/icon.png'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
