'use client';

import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { ReactNode } from 'react';

interface KeyboardShortcutsProviderProps {
  children: ReactNode;
}

export default function KeyboardShortcutsProvider({
  children,
}: KeyboardShortcutsProviderProps) {
  useKeyboardShortcuts();

  return <>{children}</>;
}

