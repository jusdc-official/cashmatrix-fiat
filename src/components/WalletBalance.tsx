import { useAccount, useBalance, useSwitchChain } from 'wagmi';
import { useEffect, useState } from 'react';
import { formatUnits } from 'viem';

// Token addresses for each network - null means not deployed
const TOKEN_ADDRESSES: Record<number, { usdc: `0x${string}`; jusdc: `0x${string}` | null }> = {
  1: { // Ethereum
    usdc: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    jusdc: '0x3a417926e0c353128e50A2A561a736C75AEd1A736' // ✅ Deployed
  },
  137: { // Polygon
    usdc: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    jusdc: '0xFfF13F7Df6db0811A45b162D5CA742f970888eE0' // ✅ Deployed
  },
  8453: { // Base
    usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    jusdc: '0xfF9df4E2b3AA65B035Da0B8E21E8C0492152A' // ✅ Deployed
  },
  42161: { // Arbitrum
    usdc: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    jusdc: null // ❌ NOT deployed yet
  }
};

export default function WalletBalance() {
  const { address, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const [usdcBalance, setUsdcBalance] = useState<string>('0.00');
  const [jusdcBalance, setJusdcBalance] = useState<string>('0.00');

  // Get token addresses for current chain
  const currentTokens = chain?.id ? TOKEN_ADDRESSES[chain.id] : undefined;
  const isJusdcDeployed = currentTokens?.jusdc !== null;

  // Get USDC balance
  const { data: usdcData, refetch: refetchUsdc } = useBalance({
    address: address,
    token: currentTokens?.usdc,
    watch: true,
  });

  // Get JUSDC balance - only if deployed on this network
  const { data: jusdcData, refetch: refetchJusdc } = useBalance({
    address: address,
    token: isJusdcDeployed ? currentTokens?.jusdc! : undefined,
    watch: true,
  });

  useEffect(() => {
    if (usdcData) {
      setUsdcBalance(parseFloat(formatUnits(usdcData.value, 6)).toFixed(2));
    }
    if (jusdcData && isJusdcDeployed) {
      setJusdcBalance(parseFloat(formatUnits(jusdcData.value, 6)).toFixed(2));
    } else if (!isJusdcDeployed) {
      setJusdcBalance('0.00');
    }
  }, [usdcData, jusdcData, isJusdcDeployed]);

  if (!address) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/20 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>💰</span>
          <span>Your Wallet</span>
        </h3>
        <button
          onClick={() => {
            refetchUsdc();
            refetchJusdc();
          }}
          className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 px-2 py-1 rounded hover:bg-purple-500/10"
        >
          <span>🔄</span>
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* USDC Balance */}
        <div className="bg-black/30 rounded-lg p-4 border border-green-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">USDC Balance</span>
            <span className="text-green-400 text-xs font-mono">
              {chain?.name || 'Network'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              {usdcBalance}
            </span>
            <span className="text-gray-400 text-sm">USDC</span>
          </div>
          <div className="text-gray-500 text-xs mt-1">
            ≈ ${usdcBalance} USD
          </div>
          {parseFloat(usdcBalance) < 1 && parseFloat(usdcBalance) >= 0 && (
            <div className="mt-2 text-yellow-400 text-xs flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded">
              <span>⚠️</span>
              <span>Low balance</span>
            </div>
          )}
        </div>

        {/* JUSDC Balance */}
        <div className="bg-black/30 rounded-lg p-4 border border-purple-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">JUSDC Balance</span>
            <span className="text-purple-400 text-xs font-mono">
              {chain?.name || 'Network'}
            </span>
          </div>
          
          {isJusdcDeployed ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">
                  {jusdcBalance}
                </span>
                <span className="text-gray-400 text-sm">JUSDC</span>
              </div>
              <div className="text-gray-500 text-xs mt-1">
                ≈ ${jusdcBalance} USD
              </div>
            </>
          ) : (
            <div className="py-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-yellow-400 text-2xl">⚠️</span>
                <div>
                  <div className="text-yellow-400 text-sm font-medium">
                    Not Deployed
                  </div>
                  <div className="text-gray-500 text-xs">
                    JUSDC not available on {chain?.name}
                  </div>
                </div>
              </div>
              <button
                onClick={() => switchChain && switchChain({ chainId: 137 })}
                className="mt-2 w-full text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-3 py-2 rounded transition-colors"
              >
                Switch to Polygon
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Total Portfolio Value */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Total Portfolio Value</span>
          <span className="text-xl font-bold text-white">
            ${(parseFloat(usdcBalance) + (isJusdcDeployed ? parseFloat(jusdcBalance) : 0)).toFixed(2)}
          </span>
        </div>
        {!isJusdcDeployed && (
          <div className="text-gray-500 text-xs mt-1">
            * JUSDC balance not included (not deployed on {chain?.name})
          </div>
        )}
      </div>
    </div>
  );
}
