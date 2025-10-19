import type React from 'react';

export interface Crypto {
  id: string;
  name: string;
  price: number;
  icon: React.ReactNode;
  subtitle: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  bgClass: string;
}

export interface WithdrawalMethod {
  id:string;
  name: string;
  icon: React.ReactNode;
}

export type TransactionStepStatus = 'waiting' | 'pending' | 'success' | 'error';

export interface TransactionStatus {
  step1: TransactionStepStatus;
  step2: TransactionStepStatus;
  step3: TransactionStepStatus;
  step4: TransactionStepStatus;
  hash: string | null;
  visible: boolean;
}

export interface NotificationMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface WalletState {
  provider: any | null;
  signer: any | null;
  address: string | null;
}

export interface FiatCurrency {
  code: string;
  symbol: string;
  name: string;
}

export interface ExchangeRates {
  [key: string]: number;
}
