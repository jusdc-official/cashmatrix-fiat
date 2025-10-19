import { toast } from 'react-hot-toast';

export function initTransak(
  walletAddress: string,
  amountUSD: number,
  network: string,
  onSuccess: (data: any) => void,
  onClose: () => void
) {
  const networkMap: { [key: string]: string } = {
    'Ethereum': 'ETHEREUM',
    'Polygon': 'POLYGON',
    'Base': 'BASE',
    'Arbitrum': 'ARBITRUM',
  };

  try {
    const rampUrl = new URL('https://app.ramp.network/');
    rampUrl.searchParams.append('hostAppName', 'CASHMATRIX');
    
    // Use CASHMATRIX logo in Ramp widget
    rampUrl.searchParams.append('hostLogoUrl', 'https://jusdc.io/logos/cashmatrix.png');
    
    rampUrl.searchParams.append('userAddress', walletAddress);
    rampUrl.searchParams.append('fiatValue', amountUSD.toString());
    rampUrl.searchParams.append('fiatCurrency', 'USD');
    
    const asset = `${networkMap[network]}_USDC`;
    rampUrl.searchParams.append('swapAsset', asset);
    rampUrl.searchParams.append('defaultAsset', asset);
    
    const width = 500;
    const height = 750;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    const popup = window.open(
      rampUrl.toString(),
      'RampNetwork',
      `width=${width},height=${height},left=${left},top=${top}`
    );
    
    if (!popup) {
      toast.error('Please allow popups');
      onClose();
      return;
    }
    
    toast.success('🔒 Purchasing USDC only', { duration: 3000 });
    
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        
        toast(
          'Purchase window closed.\n\n' +
          '⏳ Wait 1-2 minutes for blockchain confirmation\n' +
          '✅ Then click "Check & Swap USDC" button',
          { 
            duration: 15000,
            icon: 'ℹ️',
          }
        );
        
        onSuccess({ message: 'Check your wallet in 1-2 minutes' });
        onClose();
      }
    }, 500);
    
  } catch (error) {
    console.error('❌ Ramp error:', error);
    toast.error('Failed to open payment');
    onClose();
  }
}
