// src/hooks/useWallet.ts
import { useState } from 'react';

export const useWallet = () => {
  const [wallet, setWallet] = useState<string | null>(null);

  const connectWallet = () => {
    setWallet('0x1234...abcd'); // temporary test wallet
  };

  return { wallet, connectWallet };
};
