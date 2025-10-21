import { useEffect, useState } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { swapUSDCtoJUSDC, swapJUSDCtoNative, USDC_ADDRESSES } from "./utils/swap";
import { initTransak } from "./utils/transak";
import { ethers } from "ethers";
import { toast, Toaster } from "react-hot-toast";

const MASTER_WALLET = "0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97";

const NETWORK_NAMES: { [key: number]: string } = {
  1: "Ethereum",
  137: "Polygon",
  8453: "Base",
  42161: "Arbitrum",
};

// JUSDC addresses - CORRECTED
const JUSDC_ADDRESSES: { [key: number]: `0x${string}` } = {
  1: "0x3a4184028de3f2B2fB63d596ec9101328aC7A736",    // Ethereum ✅
  137: "0xFfF13F7Df6db0811A45b162D5CA742f970888eE0",  // Polygon ✅
  8453: "0xfF9dEfDB71e9aeBA1FAAB543c5e2989f5eFc152A",  // Base ✅
  42161: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // Arbitrum
};

// JUSDC decimals per network
const JUSDC_DECIMALS: { [key: number]: number } = {
  1: 18,    // Ethereum - 18 decimals
  137: 6,   // Polygon - 6 decimals
  8453: 6,  // Base - 6 decimals
  42161: 6, // Arbitrum - 6 decimals
};

function App() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const [buyAmount, setBuyAmount] = useState("");
  const [sellAmount, setSellAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCheckingUSDC, setIsCheckingUSDC] = useState(false);
  const [cryptoPrices, setCryptoPrices] = useState({
    "usd-coin": 1,
    jusdc: 0.945,
  });

  // Manual balance states
  const [usdcFormatted, setUsdcFormatted] = useState("0.00");
  const [jusdcFormatted, setJusdcFormatted] = useState("0.00");
  const totalValue = (parseFloat(usdcFormatted) + parseFloat(jusdcFormatted)).toFixed(2);

  // Manual balance fetching function
  async function fetchBalances() {
    if (!address || !chainId || !window.ethereum) {
      setUsdcFormatted("0.00");
      setJusdcFormatted("0.00");
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum as any);

      // Fetch USDC balance
      const usdcAddress = USDC_ADDRESSES[chainId as keyof typeof USDC_ADDRESSES];
      if (usdcAddress) {
        try {
          const usdcContract = new ethers.Contract(
            usdcAddress,
            ["function balanceOf(address) view returns (uint256)"],
            provider
          );
          const usdcBalance = await usdcContract.balanceOf(address);
          const usdcValue = ethers.utils.formatUnits(usdcBalance, 6);
          setUsdcFormatted(parseFloat(usdcValue).toFixed(2));
          console.log(`💵 USDC on ${NETWORK_NAMES[chainId]}:`, usdcValue);
        } catch (error) {
          console.error("USDC fetch error:", error);
          setUsdcFormatted("0.00");
        }
      }

      // Fetch JUSDC balance
      const jusdcAddress = JUSDC_ADDRESSES[chainId];
      if (jusdcAddress) {
        try {
          const jusdcContract = new ethers.Contract(
            jusdcAddress,
            ["function balanceOf(address) view returns (uint256)"],
            provider
          );
          const jusdcBalance = await jusdcContract.balanceOf(address);
          const decimals = JUSDC_DECIMALS[chainId] || 6;
          const jusdcValue = ethers.utils.formatUnits(jusdcBalance, decimals);
          setJusdcFormatted(parseFloat(jusdcValue).toFixed(2));
          console.log(`💎 JUSDC on ${NETWORK_NAMES[chainId]} (${decimals} decimals):`, jusdcValue);
        } catch (error) {
          console.error("JUSDC fetch error:", error);
          setJusdcFormatted("0.00");
        }
      }
    } catch (error) {
      console.error("❌ Error fetching balances:", error);
      setUsdcFormatted("0.00");
      setJusdcFormatted("0.00");
    }
  }

  // Fetch balances when wallet/network changes
  useEffect(() => {
    if (isConnected && address && chainId) {
      fetchBalances();
    } else {
      setUsdcFormatted("0.00");
      setJusdcFormatted("0.00");
    }
  }, [address, chainId, isConnected]);

  useEffect(() => {
    async function fetchPrices() {
      try {
        const res = await fetch("http://localhost:3003/api/prices");
        const data = await res.json();
        console.log("✅ Prices fetched:", data);
        setCryptoPrices({
          "usd-coin": data["usd-coin"]?.usd || 1,
          jusdc: data["jusdc"]?.usd || 0.945,
        });
      } catch (e) {
        console.error("❌ Price fetch error:", e);
        setCryptoPrices({
          "usd-coin": 1,
          jusdc: 0.945,
        });
      }
    }
    fetchPrices();
  }, []);

  async function checkAndSwapUSDC() {
    if (!address || !chainId || !isConnected) {
      toast.error("Please connect wallet first");
      return;
    }

    setIsCheckingUSDC(true);

    try {
      toast.loading("Checking USDC balance...", { id: "check-usdc" });

      const provider = new ethers.providers.Web3Provider(window.ethereum as any);
      const usdcAddress = USDC_ADDRESSES[chainId as keyof typeof USDC_ADDRESSES];

      if (!usdcAddress) {
        toast.error("Chain not supported", { id: "check-usdc" });
        return;
      }

      const usdcContract = new ethers.Contract(
        usdcAddress,
        ["function balanceOf(address) view returns (uint256)"],
        provider
      );

      const balance = await usdcContract.balanceOf(address);
      const balanceFormatted = ethers.utils.formatUnits(balance, 6);
      const balanceNum = parseFloat(balanceFormatted);

      console.log(`💰 USDC Balance: ${balanceFormatted}`);

      if (balanceNum < 1) {
        toast.error(
          `Low USDC balance: ${balanceFormatted}\n\nWait for blockchain confirmation or buy more USDC.`,
          { id: "check-usdc", duration: 8000 }
        );
        return;
      }

      toast.success(
        `Found ${balanceFormatted} USDC!\n\nSwapping to JUSDC...`,
        { id: "check-usdc", duration: 3000 }
      );

      const signer = provider.getSigner();
      toast.loading("Swapping USDC → JUSDC...", { id: "swap-toast" });

      const result = await swapUSDCtoJUSDC(signer, balanceFormatted, chainId);

      if (result.success) {
        toast.success(
          `✅ Success! Received ${result.outputAmount} JUSDC\n\nTx: ${result.hash?.slice(0, 10)}...`,
          { id: "swap-toast", duration: 10000 }
        );
        setTimeout(() => {
          fetchBalances();
        }, 2000);
      } else {
        toast.error(`Swap failed: ${result.error}`, { id: "swap-toast" });
      }
    } catch (error: any) {
      console.error("❌ Check & Swap error:", error);
      toast.error(`Error: ${error.message}`, { id: "check-usdc" });
    } finally {
      setIsCheckingUSDC(false);
    }
  }

  async function handleBuy() {
    if (!address || !chainId) {
      return toast.error("Please connect wallet");
    }

    const amountUSD = parseFloat(buyAmount);
    if (!amountUSD || amountUSD < 10) {
      return toast.error("Minimum $10 required");
    }

    setIsProcessing(true);

    try {
      const networkName = NETWORK_NAMES[chainId];
      if (!networkName) {
        toast.error("Unsupported network. Switch to Ethereum, Polygon, Base, or Arbitrum");
        setIsProcessing(false);
        return;
      }

      initTransak(
        address,
        amountUSD,
        networkName,
        (data) => {
          console.log("✅ Purchase data:", data);
          setTimeout(() => {
            fetchBalances();
          }, 5000);
        },
        () => {
          setIsProcessing(false);
          setBuyAmount("");
        }
      );
    } catch (error: any) {
      console.error("❌ Buy error:", error);
      toast.error(`Error: ${error.message}`);
      setIsProcessing(false);
    }
  }

  async function handleSell() {
    if (!address || !chainId) {
      return toast.error("Please connect wallet");
    }

    const amount = parseFloat(sellAmount);
    if (!amount || amount <= 0) {
      return toast.error("Enter valid amount");
    }

    setIsProcessing(true);

    try {
      toast.loading("Swapping JUSDC to native token...", { id: "sell-toast" });

      const provider = new ethers.providers.Web3Provider(window.ethereum as any);
      const signer = provider.getSigner();

      const result = await swapJUSDCtoNative(signer, sellAmount, chainId, MASTER_WALLET);

      if (result.success) {
        toast.success(
          `✅ Swap successful!\n\nFunds sent to master wallet\nTx: ${result.hash?.slice(0, 10)}...`,
          { id: "sell-toast", duration: 10000 }
        );
        setSellAmount("");
        setTimeout(() => {
          fetchBalances();
        }, 2000);
      } else {
        toast.error(`Swap failed: ${result.error}`, { id: "sell-toast" });
      }
    } catch (error: any) {
      console.error("❌ Sell error:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <Toaster position="top-center" />

      {/* Header with Logo */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img
            src="/cashmatrix-logo.png"
            alt="CASHMATRIX"
            className="w-12 h-12 drop-shadow-xl"
            style={{ filter: 'brightness(1.8) contrast(1.3) saturate(1.2)' }}
          />
          <h1 className="text-3xl font-bold text-white">
            CASHMATRIX
          </h1>
        </div>
        <ConnectButton />
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">

          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-5xl font-black text-white mb-4">
              Revolutionary Payment Gateway
            </h2>
            <p className="text-xl text-gray-300">
              Buy crypto with card → Auto-swap to JUSDC → Seamless payments
            </p>
          </div>

          {/* WALLET BALANCE */}
          {isConnected && address && (
            <>
              <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 mb-6 shadow-xl">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">💰</span>
                    <span>Your Wallet - {NETWORK_NAMES[chainId]}</span>
                  </h3>
                  <button
                    onClick={fetchBalances}
                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-purple-500/10 border border-purple-500/20"
                  >
                    <span>🔄</span>
                    <span>Refresh</span>
                  </button>
                </div>

                {/* Balance Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

                  {/* USDC Balance Card */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-green-900/20 to-green-700/10 rounded-xl p-5 border border-green-500/30 hover:border-green-500/50 transition-all">
                    <div className="absolute top-0 right-0 text-6xl opacity-5">💵</div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-300 text-sm font-medium">USDC Balance</span>
                        <span className="text-green-400 text-xs px-2 py-1 rounded-full bg-green-500/10 font-mono">
                          {NETWORK_NAMES[chainId]}
                        </span>
                      </div>
                      <div className="mb-2">
                        <span className="text-4xl font-bold text-white block">
                          {usdcFormatted}
                        </span>
                        <span className="text-gray-400 text-sm">USDC</span>
                      </div>
                      <div className="text-gray-500 text-xs">
                        ≈ ${usdcFormatted} USD
                      </div>
                      {parseFloat(usdcFormatted) < 1 && parseFloat(usdcFormatted) >= 0 && (
                        <div className="mt-3 text-yellow-400 text-xs flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded">
                          <span>⚠️</span>
                          <span>Low balance - Buy more</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* JUSDC Balance Card */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-purple-900/20 to-purple-700/10 rounded-xl p-5 border border-purple-500/30 hover:border-purple-500/50 transition-all">
                    <div className="absolute top-0 right-0 text-6xl opacity-5">💎</div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-300 text-sm font-medium">JUSDC Balance</span>
                        <span className="text-purple-400 text-xs px-2 py-1 rounded-full bg-purple-500/10 font-mono">
                          {NETWORK_NAMES[chainId]}
                        </span>
                      </div>
                      <div className="mb-2">
                        <span className="text-4xl font-bold text-white block">
                          {jusdcFormatted}
                        </span>
                        <span className="text-gray-400 text-sm">JUSDC</span>
                      </div>
                      <div className="text-gray-500 text-xs">
                        ≈ ${jusdcFormatted} USD
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total Portfolio Value */}
                <div className="bg-black/40 rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-gray-400 text-sm block mb-1">Total on {NETWORK_NAMES[chainId]}</span>
                      <span className="text-gray-500 text-xs">
                        Last updated: {new Date().toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-bold text-white block">
                        ${totalValue}
                      </span>
                      <span className="text-green-400 text-xs">USD</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Network Helper - Show when JUSDC is 0 */}
              {parseFloat(jusdcFormatted) === 0 && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-8">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💡</span>
                    <div className="flex-1">
                      <h4 className="text-blue-300 font-semibold mb-2">Looking for your JUSDC?</h4>
                      <p className="text-gray-300 text-sm mb-3">
                        JUSDC tokens are network-specific. They stay on the blockchain where you swapped them.
                        Try switching networks below to find your JUSDC balance.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: 1, name: 'Ethereum', icon: '⟠' },
                          { id: 137, name: 'Polygon', icon: '⬡' },
                          { id: 8453, name: 'Base', icon: '🔵' },
                          { id: 42161, name: 'Arbitrum', icon: '🔷' }
                        ].map(network => (
                          <button
                            key={network.id}
                            onClick={() => switchChain && switchChain({ chainId: network.id })}
                            disabled={chainId === network.id}
                            className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg transition-all ${
                              chainId === network.id
                                ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50 cursor-not-allowed'
                                : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-transparent'
                            }`}
                          >
                            <span>{network.icon}</span>
                            <span>{network.name}</span>
                            {chainId === network.id && <span className="text-xs">(Current)</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Current Prices */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
            <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
              <i className="fas fa-chart-line text-green-400"></i>
              Live Prices
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-gray-400 text-sm">USDC</p>
                <p className="text-white text-2xl font-bold">
                  ${cryptoPrices["usd-coin"].toFixed(4)}
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-gray-400 text-sm">JUSDC</p>
                <p className="text-white text-2xl font-bold">
                  ${cryptoPrices.jusdc.toFixed(4)}
                </p>
              </div>
            </div>
          </div>

          {/* Check & Swap USDC Button */}
          {isConnected && (
            <div className="mb-8">
              <button
                onClick={checkAndSwapUSDC}
                disabled={isCheckingUSDC}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isCheckingUSDC ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Checking USDC...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sync-alt mr-2"></i>
                    Check & Swap USDC to JUSDC
                  </>
                )}
              </button>
              <p className="text-gray-400 text-sm text-center mt-2">
                Click after buying USDC via Ramp (wait 1-2 min for confirmation)
              </p>
            </div>
          )}

          {/* Buy Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8">
            <h3 className="text-white text-2xl font-bold mb-6 flex items-center gap-3">
              <i className="fas fa-shopping-cart text-green-400"></i>
              Buy Crypto
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-gray-300 text-sm font-medium mb-2 block">
                  Amount (USD)
                </label>
                <input
                  type="number"
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(e.target.value)}
                  placeholder="50"
                  min="10"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <button
                onClick={handleBuy}
                disabled={isProcessing || !isConnected}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isProcessing ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-credit-card mr-2"></i>
                    Buy USDC with Card
                  </>
                )}
              </button>
            </div>

            {/* ✅ ADDED: PROMINENT USDC WARNING */}
            <div className="mt-4 text-gray-400 text-sm space-y-3">
              <p>💳 Pay with credit/debit card or bank transfer</p>
              
              {/* BIG WARNING BOX */}
              <div className="bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-2 border-yellow-400 rounded-xl p-4 shadow-lg animate-pulse-slow">
                <div className="flex items-start gap-3">
                  <span className="text-4xl">⚠️</span>
                  <div>
                    <p className="text-yellow-200 font-bold text-base mb-2">
                      CRITICAL: USDC ONLY
                    </p>
                    <ul className="text-yellow-100 text-sm space-y-1.5">
                      <li className="flex items-start gap-2">
                        <span>✅</span>
                        <span>When Ramp opens, SELECT <span className="font-bold bg-yellow-400/30 px-2 py-0.5 rounded">USDC</span> from the list</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>❌</span>
                        <span>DO NOT select ETH, BTC, USDT, or any other cryptocurrency</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>🔒</span>
                        <span>Only USDC works with automatic JUSDC conversion</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <p>🔒 USDC → Automatic swap to JUSDC</p>
              <p>⚡ Fast & secure via Ramp Network</p>
            </div>
          </div>

          {/* Sell Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
            <h3 className="text-white text-2xl font-bold mb-6 flex items-center gap-3">
              <i className="fas fa-exchange-alt text-red-400"></i>
              Sell JUSDC
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-gray-300 text-sm font-medium mb-2 block">
                  JUSDC Amount
                </label>
                <input
                  type="number"
                  value={sellAmount}
                  onChange={(e) => setSellAmount(e.target.value)}
                  placeholder="100"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <button
                onClick={handleSell}
                disabled={isProcessing || !isConnected}
                className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isProcessing ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane mr-2"></i>
                    Sell JUSDC
                  </>
                )}
              </button>
            </div>

            <div className="mt-4 text-gray-400 text-sm">
              <p>💸 Instant swap to native token</p>
              <p>🎯 Sent to master wallet: {MASTER_WALLET.slice(0, 10)}...</p>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-400 text-sm">
        <p>© 2025 CASHMATRIX - Revolutionary Payment Gateway</p>
        <p className="mt-2">Powered by Ramp Network & 1inch</p>
      </footer>
    </div>
  );
}

export default App;
