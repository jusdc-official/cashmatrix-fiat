import peanut from '@squirrel-labs/peanut-sdk';
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
 * Create a Peanut payment link to send crypto
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
    console.log('🥜 Creating Peanut link...');
    console.log('Token:', tokenAddress);
    console.log('Amount:', tokenAmount);
    console.log('Chain:', chainId);

    // Determine decimals based on token type and chain
    let tokenDecimals = 18; // Default
    if (tokenType === 'ERC20') {
      // JUSDC uses 18 decimals on Ethereum, 6 on others
      tokenDecimals = chainId === 1 ? 18 : 6;
    }

    const linkDetails = {
      chainId: chainId.toString(),
      tokenAmount,
      tokenType,
      tokenAddress: tokenType === 'NATIVE' ? ethers.constants.AddressZero : tokenAddress,
      tokenDecimals,
    };

    console.log('Link details:', linkDetails);

    // Create the Peanut link
    const result = await peanut.createLink({
      structSigner: {
        signer
      },
      linkDetails
    });

    console.log('✅ Peanut link created successfully!');
    console.log('Link:', result.link);
    console.log('TxHash:', result.txHash);

    return {
      success: true,
      link: result.link,
      txHash: result.txHash,
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(result.link)}`
    };
  } catch (error: any) {
    console.error('❌ Peanut link creation error:', error);
    console.error('Error details:', error.message, error.code);
    return {
      success: false,
      error: error.message || 'Failed to create Peanut link'
    };
  }
}

/**
 * Claim tokens from a Peanut link (GASLESS with API key)
 * @param link - Peanut payment link
 * @param recipientAddress - Address to receive tokens
 */
export async function claimPeanutLink(
  link: string,
  recipientAddress: string
): Promise<PeanutLinkResult> {
  try {
    console.log('🥜 Claiming Peanut link...');
    console.log('Link:', link);
    console.log('Recipient:', recipientAddress);

    if (!PEANUT_API_KEY) {
      console.warn('⚠️ No API key - user will pay gas');
      
      // Fallback to regular claim (user pays gas)
      const result = await peanut.claimLink({
        link,
        recipientAddress
      });

      console.log('✅ Link claimed (user paid gas):', result.txHash);
      return {
        success: true,
        txHash: result.txHash
      };
    }

    // Gasless claim with API key
    const result = await peanut.claimLinkGasless({
      link,
      recipientAddress,
      APIKey: PEANUT_API_KEY,
    });

    console.log('✅ Link claimed (gasless):', result.txHash);

    return {
      success: true,
      txHash: result.txHash
    };
  } catch (error: any) {
    console.error('❌ Peanut claim error:', error);
    
    // Try fallback to regular claim
    try {
      console.log('⚠️ Trying fallback (regular claim)...');
      const result = await peanut.claimLink({
        link,
        recipientAddress
      });
      console.log('✅ Fallback claim succeeded:', result.txHash);
      return {
        success: true,
        txHash: result.txHash
      };
    } catch (fallbackError: any) {
      console.error('❌ Fallback also failed:', fallbackError);
      return {
        success: false,
        error: fallbackError.message || 'Failed to claim Peanut link'
      };
    }
  }
}

/**
 * Get information about a Peanut link
 * @param link - Peanut payment link
 */
export async function getPeanutLinkInfo(link: string) {
  try {
    console.log('🥜 Getting link info...');
    const info = await peanut.getLinkDetails(link);
    console.log('✅ Link info:', info);
    return { 
      success: true, 
      data: info 
    };
  } catch (error: any) {
    console.error('❌ Get link info error:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

/**
 * Create a payment request (for receiving payments)
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
    console.log('🥜 Creating payment request...');

    if (!PEANUT_API_KEY) {
      throw new Error('API key required for payment requests');
    }

    const response = await fetch('https://api.peanut.to/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': PEANUT_API_KEY
      },
      body: JSON.stringify({
        amount,
        currency,
        recipient: recipientAddress
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Payment request created:', data);

    const paymentUrl = data.link || data.url || data.hosted_url;

    return {
      success: true,
      link: paymentUrl,
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(paymentUrl)}`
    };
  } catch (error: any) {
    console.error('❌ Payment request error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create payment request'
    };
  }
}

/**
 * Create bank withdrawal (off-ramp) - Requires Peanut team approval
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
    console.log('🥜 Creating bank withdrawal...');

    if (!PEANUT_API_KEY) {
      throw new Error('API key required for bank withdrawals');
    }

    // First create a link with the tokens
    const linkResult = await createPeanutLink(
      signer,
      tokenAddress,
      amount,
      chainId
    );

    if (!linkResult.success || !linkResult.link) {
      return linkResult;
    }

    console.log('Link created, initiating off-ramp...');

    // Then initiate off-ramp
    const response = await fetch('https://api.peanut.to/offramp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': PEANUT_API_KEY
      },
      body: JSON.stringify({
        link: linkResult.link,
        bankDetails
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Off-ramp error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Bank withdrawal initiated:', data);

    return {
      success: true,
      link: data.withdrawal_url || data.url,
      txHash: linkResult.txHash
    };
  } catch (error: any) {
    console.error('❌ Bank withdrawal error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create bank withdrawal'
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
      chainId: params.get('c'),
      index: params.get('i'),
      version: params.get('v'),
      password: params.get('p'),
      valid: !!(params.get('c') && params.get('i') && params.get('v') && params.get('p'))
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
    return '✅ Gasless claims enabled';
  }
  return '⚠️ No API key - users pay gas';
}
