'use client';

import { CacheProvider } from '@emotion/react';
import createEmotionCache from './emotion-cache';
import { ReactNode } from 'react';

const clientSideEmotionCache = createEmotionCache();

export default function EmotionProvider({ children }: { children: ReactNode }) {
  return (
    <CacheProvider value={clientSideEmotionCache}>{children}</CacheProvider>
  );
}
