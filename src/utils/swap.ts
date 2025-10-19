import { ethers, BigNumber } from 'ethers';

const USDC_ADDRESSES = {
  1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  137: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  8453: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
  42161: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
};

const JUSDC_ADDRESSES = {
  1: '0x3a4184028de3f2B2fB63d596ec9101328aC7A736',
  137: '0xFfF13F7Df6db0811A45b162D5CA742f970888eE0',
  8453: '0xfF9dEfDB71e9aeBA1FAAB543c5e2989f5eFc152A',
};

const NATIVE_TOKEN = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
const ONEINCH_ROUTER = '0x1111111254EEB25477B68fb85Ed929f73A960582';

// Helper to call 1inch via proxy
async function call1inch(endpoint: string, params: Record<string, string>) {
  const queryString = new URLSearchParams({
    endpoint,
    ...params
  }).toString();
  
  const response = await fetch(`/api/swap?${queryString}`);
  
  if (!response.ok) {
    const text = await response.text();
    let errorMsg = '1inch API error';
    try {
      const error = JSON.parse(text);
      errorMsg = error.error || errorMsg;
    } catch (e) {
      console.error('Failed to parse error response:', text);
    }
    throw new Error(errorMsg);
  }
  
  return response.json();
}

export async function getSwapQuote(
  fromToken: 'USDC' | 'JUSDC',
  toToken: 'JUSDC' | 'NATIVE',
  amount: string,
  chainId: number
): Promise<{ outputAmount: string; gasEstimate: string } | null> {
  try {
    const fromTokenAddress = fromToken === 'USDC' 
      ? USDC_ADDRESSES[chainId as keyof typeof USDC_ADDRESSES]
      : JUSDC_ADDRESSES[chainId as keyof typeof JUSDC_ADDRESSES];
    
    const toTokenAddress = toToken === 'NATIVE' 
      ? NATIVE_TOKEN
      : JUSDC_ADDRESSES[chainId as keyof typeof JUSDC_ADDRESSES];

    if (!fromTokenAddress || !toTokenAddress) {
      console.warn(`Chain ${chainId} not supported for quotes`);
      return null;
    }

    const decimals = fromToken === 'USDC' || (fromToken === 'JUSDC' && chainId !== 1) ? 6 : 18;
    const amountWei = ethers.utils.parseUnits(amount, decimals);

    const data = await call1inch(`${chainId}/quote`, {
      fromTokenAddress,
      toTokenAddress,
      amount: amountWei.toString(),
    });

    const outputDecimals = toToken === 'NATIVE' ? 18 : 6;

    return {
      outputAmount: ethers.utils.formatUnits(data.toTokenAmount, outputDecimals),
      gasEstimate: data.estimatedGas || '0',
    };

  } catch (error: any) {
    console.warn('⚠️ Quote unavailable:', error.message);
    // Return estimated values instead of failing
    const discount = fromToken === 'USDC' && toToken === 'JUSDC' ? 0.05 : 0.02;
    return {
      outputAmount: (parseFloat(amount) * (1 - discount)).toFixed(6),
      gasEstimate: '150000',
    };
  }
}

export async function swapUSDCtoJUSDC(
  signer: ethers.Signer,
  amountUSD: string,
  chainId: number
): Promise<{ success: boolean; hash?: string; error?: string; outputAmount?: string }> {
  try {
    console.log(`🔄 Swapping ${amountUSD} USDC → JUSDC on chain ${chainId}`);

    const fromTokenAddress = USDC_ADDRESSES[chainId as keyof typeof USDC_ADDRESSES];
    const toTokenAddress = JUSDC_ADDRESSES[chainId as keyof typeof JUSDC_ADDRESSES];
    const fromAddress = await signer.getAddress();

    if (!fromTokenAddress || !toTokenAddress) {
      throw new Error(`Chain ${chainId} not supported`);
    }

    const amountWei = ethers.utils.parseUnits(amountUSD, 6);

    const approved = await approveToken(signer, fromTokenAddress, ONEINCH_ROUTER, amountWei, chainId);
    if (!approved) {
      throw new Error('Token approval failed');
    }

    const swapData = await call1inch(`${chainId}/swap`, {
      fromTokenAddress,
      toTokenAddress,
      amount: amountWei.toString(),
      fromAddress,
      slippage: '1',
      disableEstimate: 'false',
    });
    
    const txResponse = await signer.sendTransaction({
      to: swapData.tx.to,
      data: swapData.tx.data,
      value: swapData.tx.value ? BigNumber.from(swapData.tx.value) : undefined,
      gasLimit: swapData.tx.gas ? BigNumber.from(swapData.tx.gas) : undefined,
    });

    const receipt = await txResponse.wait();
    const outputAmount = ethers.utils.formatUnits(swapData.toTokenAmount, 6);

    return {
      success: true,
      hash: receipt.transactionHash,
      outputAmount,
    };

  } catch (error: any) {
    console.error('❌ Swap error:', error);
    return {
      success: false,
      error: error.message || 'Swap failed',
    };
  }
}

export async function swapJUSDCtoNative(
  signer: ethers.Signer,
  amountJUSDC: string,
  chainId: number,
  masterWallet: string
): Promise<{ success: boolean; hash?: string; error?: string }> {
  try {
    const fromTokenAddress = JUSDC_ADDRESSES[chainId as keyof typeof JUSDC_ADDRESSES];
    const toTokenAddress = NATIVE_TOKEN;
    const fromAddress = await signer.getAddress();

    if (!fromTokenAddress) {
      throw new Error(`Chain ${chainId} not supported`);
    }

    const decimals = chainId === 1 ? 18 : 6;
    const amountWei = ethers.utils.parseUnits(amountJUSDC, decimals);

    const approved = await approveToken(signer, fromTokenAddress, ONEINCH_ROUTER, amountWei, chainId);
    if (!approved) {
      throw new Error('Token approval failed');
    }

    const swapData = await call1inch(`${chainId}/swap`, {
      fromTokenAddress,
      toTokenAddress,
      amount: amountWei.toString(),
      fromAddress,
      slippage: '1',
      destReceiver: masterWallet,
    });
    
    const txResponse = await signer.sendTransaction({
      to: swapData.tx.to,
      data: swapData.tx.data,
      value: swapData.tx.value ? BigNumber.from(swapData.tx.value) : undefined,
    });

    const receipt = await txResponse.wait();

    return {
      success: true,
      hash: receipt.transactionHash,
    };

  } catch (error: any) {
    console.error('❌ Swap error:', error);
    return {
      success: false,
      error: error.message || 'Swap failed',
    };
  }
}

async function approveToken(
  signer: ethers.Signer,
  tokenAddress: string,
  spenderAddress: string,
  amount: BigNumber,
  chainId: number
): Promise<boolean> {
  try {
    const tokenContract = new ethers.Contract(
      tokenAddress,
      [
        'function allowance(address owner, address spender) view returns (uint256)',
        'function approve(address spender, uint256 amount) returns (bool)',
      ],
      signer
    );

    const owner = await signer.getAddress();
    const currentAllowance = await tokenContract.allowance(owner, spenderAddress);

    if (currentAllowance.gte(amount)) {
      return true;
    }

    const tx = await tokenContract.approve(spenderAddress, amount);
    await tx.wait();
    return true;
  } catch (error: any) {
    console.error('❌ Approval error:', error);
    return false;
  }
}

export { USDC_ADDRESSES, JUSDC_ADDRESSES, NATIVE_TOKEN };
