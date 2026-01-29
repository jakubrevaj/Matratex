import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Shortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
}

export const useKeyboardShortcuts = () => {
  let router;
  try {
    router = useRouter();
  } catch (error) {
    // Router not mounted yet, skip shortcuts
    router = null;
  }

  const shortcuts: Shortcut[] = router
    ? [
        {
          key: 'n',
          ctrlKey: true,
          action: () => router.push('/orders/new'),
          description: 'Nová objednávka',
        },
        {
          key: 'i',
          ctrlKey: true,
          action: () => router.push('/invoices/new'),
          description: 'Nová faktúra',
        },
        {
          key: 'o',
          ctrlKey: true,
          action: () => router.push('/orders'),
          description: 'Objednávky',
        },
        {
          key: 'f',
          ctrlKey: true,
          action: () => router.push('/invoices'),
          description: 'Faktúry',
        },
        {
          key: 'p',
          ctrlKey: true,
          action: () => router.push('/production'),
          description: 'Produkcia',
        },
        {
          key: 'd',
          ctrlKey: true,
          action: () => router.push('/delivery'),
          description: 'Dodávky',
        },
        {
          key: 'h',
          ctrlKey: true,
          action: () => router.push('/'),
          description: 'Domov',
        },
        {
          key: 'b',
          ctrlKey: true,
          action: () => router.push('/dashboard'),
          description: 'Dashboard',
        },
        {
          key: 'H',
          ctrlKey: true,
          shiftKey: true,
          action: () => showShortcutsHelp(),
          description: 'Zobraziť klávesové skratky',
        },
        {
          key: 'Escape',
          action: () => {
            // Zavrieť modály, dropdowny, atď.
            const activeElement = document.activeElement as HTMLElement;
            if (activeElement && activeElement.blur) {
              activeElement.blur();
            }
          },
          description: 'Zavrieť modál/vyhľadávanie',
        },
      ]
    : [
        {
          key: 'Escape',
          action: () => {
            const activeElement = document.activeElement as HTMLElement;
            if (activeElement && activeElement.blur) {
              activeElement.blur();
            }
          },
          description: 'Zavrieť modál/vyhľadávanie',
        },
      ];

  const showShortcutsHelp = () => {
    const helpText = shortcuts
      .map((shortcut) => {
        const keys = [];
        if (shortcut.ctrlKey) keys.push('Ctrl');
        if (shortcut.shiftKey) keys.push('Shift');
        if (shortcut.altKey) keys.push('Alt');
        keys.push(shortcut.key.toUpperCase());
        return `${keys.join(' + ')}: ${shortcut.description}`;
      })
      .join('\n');

    alert(`Klávesové skratky:\n\n${helpText}`);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignorovať ak je fokus v input/textarea
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        return;
      }

      const shortcut = shortcuts.find((s) => {
        return (
          s.key.toLowerCase() === event.key.toLowerCase() &&
          !!s.ctrlKey === event.ctrlKey &&
          !!s.shiftKey === event.shiftKey &&
          !!s.altKey === event.altKey
        );
      });

      if (shortcut) {
        event.preventDefault();
        shortcut.action();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  return {
    shortcuts,
    showShortcutsHelp,
  };
};
