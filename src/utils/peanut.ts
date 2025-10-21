import peanut from '@squirrel-labs/peanut-sdk';
import { ethers } from 'ethers';

// Peanut configuration
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
    
    const linkDetails = {
      chainId: chainId.toString(),
      tokenAmount,
      tokenType,
      tokenAddress: tokenType === 'NATIVE' ? ethers.constants.AddressZero : tokenAddress,
      tokenDecimals: tokenType === 'NATIVE' ? 18 : 6, // Adjust based on token
    };

    // Create the Peanut link
    const { link, txHash } = await peanut.createLink({
      structSigner: {
        signer
      },
      linkDetails
    });

    console.log('✅ Peanut link created:', link);

    return {
      success: true,
      link,
      txHash,
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(link)}`
    };
  } catch (error: any) {
    console.error('❌ Peanut link creation error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create Peanut link'
    };
  }
}

/**
 * Claim tokens from a Peanut link
 */
export async function claimPeanutLink(
  signer: ethers.Signer,
  link: string,
  recipientAddress: string
): Promise<PeanutLinkResult> {
  try {
    console.log('🥜 Claiming Peanut link...');

    const { txHash } = await peanut.claimLinkGasless({
      link,
      recipientAddress,
      APIKey: PEANUT_API_KEY,
    });

    console.log('✅ Peanut link claimed:', txHash);

    return {
      success: true,
      txHash
    };
  } catch (error: any) {
    console.error('❌ Peanut claim error:', error);
    return {
      success: false,
      error: error.message || 'Failed to claim Peanut link'
    };
  }
}

/**
 * Create a Peanut payment request (for receiving payments)
 */
export async function createPaymentRequest(
  amount: string,
  currency: string = 'USD',
  recipientAddress: string
): Promise<PeanutLinkResult> {
  try {
    console.log('🥜 Creating Peanut payment request...');

    const response = await fetch('https://api.peanut.me/charges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': PEANUT_API_KEY
      },
      body: JSON.stringify({
        pricing_type: 'fixed_price',
        local_price: {
          amount,
          currency
        },
        requestProps: {
          recipient: recipientAddress
        }
      })
    });

    const data = await response.json();

    console.log('✅ Payment request created:', data);

    return {
      success: true,
      link: data.hosted_url,
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data.hosted_url)}`
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
 * Create bank withdrawal (off-ramp)
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

    // Then initiate off-ramp (this requires Peanut team approval)
    const response = await fetch('https://api.peanut.me/offramp', {
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

    const data = await response.json();

    console.log('✅ Bank withdrawal initiated:', data);

    return {
      success: true,
      link: data.withdrawal_url,
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
 * Get supported chains
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
 * Parse Peanut link to get details
 */
export function parsePeanutLink(link: string) {
  try {
    const url = new URL(link);
    const params = new URLSearchParams(url.search);
    
    return {
      chainId: params.get('c'),
      index: params.get('i'),
      version: params.get('v'),
      key: params.get('p')
    };
  } catch (error) {
    return null;
  }
}
