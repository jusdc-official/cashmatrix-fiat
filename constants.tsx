import React from 'react';
import type { Crypto, PaymentMethod, WithdrawalMethod, FiatCurrency } from './types';

export const CRYPTOCURRENCIES: Crypto[] = [
    { id: 'ETH', name: 'Ethereum', price: 0, icon: <i className="fab fa-ethereum"></i>, subtitle: 'ETH' },
    { id: 'BTC', name: 'Bitcoin', price: 0, icon: <i className="fab fa-bitcoin"></i>, subtitle: 'BTC' },
    { id: 'USDC', name: 'USDC', price: 1, icon: <span className="font-bold">$</span>, subtitle: 'Stablecoin' },
    { id: 'JUSDC', name: 'JUSDC', price: 1, icon: <span className="font-bold">J</span>, subtitle: 'Custom' },
];

export const PAYMENT_METHODS: PaymentMethod[] = [
    { id: 'visa', name: 'Visa', icon: <i className="fab fa-cc-visa"></i>, bgClass: 'bg-gradient-to-br from-blue-900 via-blue-700 to-blue-900' },
    { id: 'mastercard', name: 'Mastercard', icon: <i className="fab fa-cc-mastercard"></i>, bgClass: 'bg-gradient-to-br from-red-600 via-orange-500 to-red-600' },
    { id: 'googlepay', name: 'Google Pay', icon: <i className="fab fa-google-pay"></i>, bgClass: 'bg-gradient-to-br from-blue-500 to-green-500' },
    { id: 'applepay', name: 'Apple Pay', icon: <i className="fab fa-apple-pay"></i>, bgClass: 'bg-gradient-to-br from-black to-gray-800' },
];

export const WITHDRAWAL_METHODS: WithdrawalMethod[] = [
    { id: 'bank', name: 'Bank Transfer', icon: <i className="fas fa-university"></i> },
    { id: 'paypal', name: 'PayPal', icon: <i className="fab fa-paypal"></i> },
    { id: 'card', name: 'Debit Card', icon: <i className="fas fa-credit-card"></i> },
];

export const SUPPORTED_FIAT_CURRENCIES: FiatCurrency[] = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

export const BUY_PRESETS = [50, 100, 500, 1000, 5000];
export const SELL_PRESETS = [0.1, 0.5, 1, 2, 5];

export const BUY_FEE_RATE = 0.025;
export const SELL_FEE_RATE = 0.02;
