import './globals.css';
import EmotionProvider from '@/components/EmotionProvider';
import ToastProvider from '@/components/ToastProvider';
import KeyboardShortcutsProvider from '@/components/KeyboardShortcutsProvider';
import ErrorBoundary from '@/components/ErrorBoundary';
import FloatingShortcuts from '@/components/FloatingShortcuts';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sk">
      <body>
        <ErrorBoundary>
          <EmotionProvider>
            <KeyboardShortcutsProvider>
              {children}
              <ToastProvider />
              <FloatingShortcuts />
            </KeyboardShortcutsProvider>
          </EmotionProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
