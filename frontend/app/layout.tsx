import './globals.css';
import Navbar from '../components/Navbar';
import EmotionProvider from '@/components/EmotionProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sk">
      <body>
        <EmotionProvider>
          <Navbar />
          <main>{children}</main>
        </EmotionProvider>
      </body>
    </html>
  );
}
