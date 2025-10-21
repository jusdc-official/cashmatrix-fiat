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
    
    // Host configuration
    rampUrl.searchParams.append('hostAppName', 'CASHMATRIX');
    rampUrl.searchParams.append('hostLogoUrl', 'https://jusdc.io/logos/cashmatrix.png');

    // User configuration
    rampUrl.searchParams.append('userAddress', walletAddress);
    
    // Fiat configuration
    rampUrl.searchParams.append('fiatValue', amountUSD.toString());
    rampUrl.searchParams.append('fiatCurrency', 'USD');

    // Force USDC only
    const asset = `${networkMap[network]}_USDC`;
    rampUrl.searchParams.append('swapAsset', asset);
    rampUrl.searchParams.append('defaultAsset', asset);

    const width = 500;
    const height = 750;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    // ✅ IMPROVED: Better popup features to reduce CORS issues
    const features = `
      width=${width},
      height=${height},
      left=${left},
      top=${top},
      toolbar=no,
      menubar=no,
      scrollbars=yes,
      resizable=yes,
      location=no,
      status=no
    `.replace(/\s/g, '');

    const popup = window.open(
      rampUrl.toString(),
      'RampNetwork',
      features
    );

    if (!popup) {
      toast.error('Please allow popups for CASHMATRIX');
      onClose();
      return;
    }

    toast.success('🔒 Opening Ramp - Select USDC only!', { duration: 4000 });

    // ✅ IMPROVED: Better popup monitoring
    let checkCount = 0;
    const maxChecks = 600; // 5 minutes max
    
    const checkClosed = setInterval(() => {
      checkCount++;
      
      try {
        if (popup.closed) {
          clearInterval(checkClosed);
          
          toast(
            '⏳ If you purchased USDC, wait 1-2 minutes\n' +
            '✅ Then click "Check & Swap USDC to JUSDC"',
            { duration: 15000, icon: 'ℹ️' }
          );

          onSuccess({ message: 'Check your wallet in 1-2 minutes' });
          onClose();
        }
      } catch (e) {
        // Ignore CORS errors when checking popup
      }
      
      // Timeout after 5 minutes
      if (checkCount >= maxChecks) {
        clearInterval(checkClosed);
        toast('Purchase window timed out', { duration: 5000 });
        onClose();
      }
    }, 500);

  } catch (error) {
    console.error('❌ Ramp error:', error);
    toast.error('Failed to open payment');
    onClose();
  }
}
