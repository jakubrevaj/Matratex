import EmotionProvider from '@/components/EmotionProvider';
import '../globals.css';

export default function NoNavbarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sk">
      <body>
        <EmotionProvider>
          <main>{children}</main>
        </EmotionProvider>
      </body>
    </html>
  );
}
