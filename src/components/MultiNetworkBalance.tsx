import { useAccount, useBalance } from 'wagmi';
import { formatUnits } from 'viem';

interface NetworkBalances {
  chainId: number;
  name: string;
  usdc: `0x${string}`;
  jusdc: `0x${string}` | null;
}

const NETWORKS: NetworkBalances[] = [
  {
    chainId: 1,
    name: 'Ethereum',
    usdc: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    jusdc: '0x3a417926e0c353128e50A2A561a736C75AEd1A736',
  },
  {
    chainId: 137,
    name: 'Polygon',
    usdc: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    jusdc: '0xFfF13F7Df6db0811A45b162D5CA742f970888eE0',
  },
  {
    chainId: 8453,
    name: 'Base',
    usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    jusdc: '0xfF9df4E2b3AA65B035Da0B8E21E8C0492152A',
  },
  {
    chainId: 42161,
    name: 'Arbitrum',
    usdc: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    jusdc: null,
  },
];

function NetworkBalanceCard({ network }: { network: NetworkBalances }) {
  const { address } = useAccount();

  const { data: usdcData } = useBalance({
    address,
    token: network.usdc,
    chainId: network.chainId,
  });

  const { data: jusdcData } = useBalance({
    address,
    token: network.jusdc || undefined,
    chainId: network.chainId,
  });

  const usdc = usdcData ? parseFloat(formatUnits(usdcData.value, 6)).toFixed(2) : '0.00';
  const jusdc = jusdcData ? parseFloat(formatUnits(jusdcData.value, 6)).toFixed(2) : '0.00';

  // Don't show if both balances are 0
  if (parseFloat(usdc) === 0 && parseFloat(jusdc) === 0) {
    return null;
  }

  return (
    <div className="bg-white/5 rounded-lg p-4 border border-purple-500/20">
      <div className="text-purple-400 text-sm font-bold mb-3">{network.name}</div>
      <div className="space-y-2">
        <div className="flex justify-between items-baseline">
          <span className="text-gray-400 text-xs">USDC</span>
          <div className="text-right">
            <span className="text-white font-semibold text-lg">{usdc}</span>
            <span className="text-gray-500 text-xs ml-1">USDC</span>
          </div>
        </div>
        {network.jusdc && (
          <div className="flex justify-between items-baseline">
            <span className="text-gray-400 text-xs">JUSDC</span>
            <div className="text-right">
              <span className="text-white font-semibold text-lg">{jusdc}</span>
              <span className="text-gray-500 text-xs ml-1">JUSDC</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MultiNetworkBalance() {
  const { address } = useAccount();

  if (!address) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/20 rounded-xl p-6 mb-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span>🌐</span>
        <span>All Networks</span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {NETWORKS.map((network) => (
          <NetworkBalanceCard key={network.chainId} network={network} />
        ))}
      </div>
      <div className="mt-4 text-gray-500 text-xs text-center">
        Showing balances across all supported networks
      </div>
    </div>
  );
}
