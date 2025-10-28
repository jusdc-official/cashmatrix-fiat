// src/utils/transak.ts
import { toast } from 'react-hot-toast';
import  TransakSDK  from '@transak/transak-sdk';

export function initTransakInline(
  walletAddress: string,
  amountUSD: number,
  network: string,
  containerId: string,
  onSuccess: (data: any) => void,
  onClose: () => void
) {
  const networkMap: { [key: string]: string } = {
    Ethereum: 'ETHEREUM',
    Polygon: 'POLYGON',
    Base: 'BASE',
    Arbitrum: 'ARBITRUM',
  };

  try {
    const transakNetwork = networkMap[network];
    if (!transakNetwork) throw new Error('Unsupported network');

    const transak = new TransakSDK({
      apiKey: '', // Optional
      environment: 'STAGING', // PRODUCTION for live
      defaultCryptoCurrency: 'USDC',
      walletAddress,
      fiatAmount: amountUSD,
      cryptoCurrencyCode: 'USDC',
      networks: [transakNetwork],
      hostAppName: 'CASHMATRIX',
      hostLogoUrl: 'https://jusdc.io/logos/cashmatrix.png',
      widgetHeight: '700px',
      widgetWidth: '100%',
      widgetContainer: `#${containerId}`, // ✅ Render inside this div
    });

    transak.init();

    // Event: On successful payment
    transak.on(transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, (orderData: any) => {
      toast.success('✅ USDC purchase successful!', { duration: 4000 });
      onSuccess(orderData);
      transak.close();
    });

    // Event: On widget closure
    transak.on(transak.EVENTS.TRANSAK_WIDGET_CLOSED, () => {
      onClose();
    });
  } catch (error: any) {
    console.error('❌ Transak error:', error);
    toast.error('Failed to open Transak widget');
    onClose();
  }
}
