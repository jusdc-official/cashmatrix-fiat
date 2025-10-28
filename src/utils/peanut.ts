import { ethers } from 'ethers';

// Peanut API Key from environment
const PEANUT_API_KEY = import.meta.env.VITE_PEANUT_API_KEY || '';

export interface PeanutLinkResult {
  success: boolean;
  link?: string;
  qrCode?: string;
  txHash?: string;
  error?: string;
}

/**
 * Create a Peanut payment link by redirecting to Peanut.to
 * @param signer - Ethers signer from wallet
 * @param tokenAddress - ERC20 token contract address
 * @param tokenAmount - Amount to send (in human-readable format)
 * @param chainId - Network chain ID
 * @param tokenType - 'ERC20' or 'NATIVE' (ETH/MATIC/etc)
 */
export async function createPeanutLink(
  signer: ethers.Signer,
  tokenAddress: string,
  tokenAmount: string,
  chainId: number,
  tokenType: 'ERC20' | 'NATIVE' = 'ERC20'
): Promise<PeanutLinkResult> {
  try {
    console.log('🥜 Opening Peanut Protocol...');
    console.log('Token:', tokenAddress);
    console.log('Amount:', tokenAmount);
    console.log('Chain:', chainId);

    // Build Peanut.to URL with pre-filled parameters
    const params = new URLSearchParams({
      chainId: chainId.toString(),
      tokenAddress: tokenAddress,
      tokenAmount: tokenAmount,
      tokenType: tokenType.toLowerCase()
    });

    const peanutUrl = `https://peanut.to/send?${params.toString()}`;
    
    console.log('🔗 Opening:', peanutUrl);
    
    // Open Peanut in new tab
    window.open(peanutUrl, '_blank', 'noopener,noreferrer');
    
    return {
      success: true,
      link: peanutUrl,
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(peanutUrl)}`
    };
  } catch (error: any) {
    console.error('❌ Error opening Peanut:', error);
    return {
      success: false,
      error: error.message || 'Failed to open Peanut Protocol'
    };
  }
}

/**
 * Claim tokens from a Peanut link
 * @param link - Peanut payment link
 * @param recipientAddress - Address to receive tokens
 */
export async function claimPeanutLink(
  link: string,
  recipientAddress: string
): Promise<PeanutLinkResult> {
  try {
    console.log('🥜 Opening Peanut claim page...');
    
    // Open the claim link in new tab
    window.open(link, '_blank', 'noopener,noreferrer');
    
    return {
      success: true,
      link: link
    };
  } catch (error: any) {
    console.error('❌ Error opening claim page:', error);
    return {
      success: false,
      error: error.message || 'Failed to open claim page'
    };
  }
}

/**
 * Get information about a Peanut link
 * @param link - Peanut payment link
 */
export async function getPeanutLinkInfo(link: string) {
  return {
    success: true,
    data: {
      message: 'Open the link in your browser to view details',
      link: link
    }
  };
}

/**
 * Create a payment request (opens Peanut.to receive page)
 * @param amount - Amount to request
 * @param currency - Currency (USD, EUR, etc)
 * @param recipientAddress - Address to receive payment
 */
export async function createPaymentRequest(
  amount: string,
  currency: string = 'USD',
  recipientAddress: string
): Promise<PeanutLinkResult> {
  try {
    console.log('🥜 Opening Peanut request page...');
    
    const peanutUrl = `https://peanut.to/request?amount=${amount}&currency=${currency}&recipient=${recipientAddress}`;
    
    window.open(peanutUrl, '_blank', 'noopener,noreferrer');
    
    return {
      success: true,
      link: peanutUrl
    };
  } catch (error: any) {
    console.error('❌ Error opening request page:', error);
    return {
      success: false,
      error: error.message || 'Failed to open request page'
    };
  }
}

/**
 * Create bank withdrawal (off-ramp)
 * @param signer - Ethers signer
 * @param tokenAddress - Token to withdraw
 * @param amount - Amount to withdraw
 * @param chainId - Network chain ID
 * @param bankDetails - Bank account information
 */
export async function createBankWithdrawal(
  signer: ethers.Signer,
  tokenAddress: string,
  amount: string,
  chainId: number,
  bankDetails: {
    accountNumber?: string;
    iban?: string;
    swift?: string;
    country: string;
  }
): Promise<PeanutLinkResult> {
  try {
    console.log('🥜 Opening Peanut off-ramp page...');
    
    // First create a link
    const linkResult = await createPeanutLink(
      signer,
      tokenAddress,
      amount,
      chainId
    );
    
    if (!linkResult.success) {
      return linkResult;
    }
    
    // Then redirect to off-ramp page
    const offrampUrl = `https://peanut.to/offramp`;
    window.open(offrampUrl, '_blank', 'noopener,noreferrer');
    
    return {
      success: true,
      link: offrampUrl
    };
  } catch (error: any) {
    console.error('❌ Error opening off-ramp:', error);
    return {
      success: false,
      error: error.message || 'Failed to open off-ramp page'
    };
  }
}

/**
 * Generate social sharing links
 * @param link - Peanut payment link
 * @param message - Custom message
 */
export function generateShareLinks(link: string, message: string = 'Send me JUSDC!') {
  const encodedLink = encodeURIComponent(link);
  const encodedMessage = encodeURIComponent(message);

  return {
    whatsapp: `https://wa.me/?text=${encodedMessage}%20${encodedLink}`,
    telegram: `https://t.me/share/url?url=${encodedLink}&text=${encodedMessage}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedLink}`,
    email: `mailto:?subject=${encodedMessage}&body=${encodedLink}`,
    copy: link
  };
}

/**
 * Get list of supported chains
 */
export function getSupportedChains() {
  return [
    { id: 1, name: 'Ethereum', supported: true },
    { id: 137, name: 'Polygon', supported: true },
    { id: 8453, name: 'Base', supported: true },
    { id: 42161, name: 'Arbitrum', supported: true },
    { id: 10, name: 'Optimism', supported: true },
  ];
}

/**
 * Parse Peanut link to extract details
 * @param link - Peanut payment link
 */
export function parsePeanutLink(link: string) {
  try {
    const url = new URL(link);
    const params = new URLSearchParams(url.search);

    return {
      chainId: params.get('c') || params.get('chainId'),
      index: params.get('i'),
      version: params.get('v'),
      password: params.get('p'),
      tokenAddress: params.get('tokenAddress'),
      tokenAmount: params.get('tokenAmount'),
      valid: !!url.hostname.includes('peanut.to')
    };
  } catch (error) {
    console.error('Invalid Peanut link:', error);
    return null;
  }
}

/**
 * Validate if a link is a valid Peanut link
 * @param link - Link to validate
 */
export function isValidPeanutLink(link: string): boolean {
  const parsed = parsePeanutLink(link);
  return parsed !== null && parsed.valid === true;
}

/**
 * Format amount for display
 * @param amount - Amount as string
 * @param decimals - Token decimals
 */
export function formatAmount(amount: string, decimals: number = 6): string {
  try {
    const value = parseFloat(amount);
    if (isNaN(value)) return '0.00';

    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: decimals
    });
  } catch {
    return '0.00';
  }
}

/**
 * Get chain name from chain ID
 * @param chainId - Chain ID
 */
export function getChainName(chainId: number): string {
  const chains: { [key: number]: string } = {
    1: 'Ethereum',
    137: 'Polygon',
    8453: 'Base',
    42161: 'Arbitrum',
    10: 'Optimism',
  };
  return chains[chainId] || 'Unknown Network';
}

/**
 * Check if API key is configured
 */
export function hasApiKey(): boolean {
  return !!PEANUT_API_KEY && PEANUT_API_KEY.length > 0;
}

/**
 * Get API key status message
 */
export function getApiKeyStatus(): string {
  if (hasApiKey()) {
    return '✅ Peanut Protocol integration enabled';
  }
  return '⚠️ Using Peanut.to web interface';
}
