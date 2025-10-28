import { useEffect, useState } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { swapJUSDCtoNative, USDC_ADDRESSES } from "./utils/swap";
import { Transak } from "@transak/transak-sdk"; // ✅ Corrected import
import { ethers } from "ethers";
import { toast, Toaster } from "react-hot-toast";

const MASTER_WALLET = "0x0ef7B60b804f41B9bd5F1C2B46b4404571aF5b3d";

const NETWORK_NAMES: { [key: number]: string } = {
  1: "Ethereum",
  137: "Polygon",
  8453: "Base",
  42161: "Arbitrum",
};

const RPC_URLS: { [key: number]: string } = {
  1: "https://eth.llamarpc.com",
  137: "https://polygon-rpc.com",
  8453: "https://mainnet.base.org",
  42161: "https://arb1.arbitrum.io/rpc",
};

const JUSDC_ADDRESSES: { [key: number]: `0x${string}` } = {
  1: "0x3a4184028de3f2B2fB63d596ec9101328aC7A736",
  137: "0xFfF13F7Df6db0811A45b162D5CA742f970888eE0",
  8453: "0xfF9dEfDB71e9aeBA1FAAB543c5e2989f5eFc152A",
  42161: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
};

const JUSDC_DECIMALS: { [key: number]: number } = {
  1: 18,
  137: 6,
  8453: 6,
  42161: 6,
};

function App() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const [buyAmount, setBuyAmount] = useState("");
  const [sellAmount, setSellAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [usdcFormatted, setUsdcFormatted] = useState("0.00");
  const [jusdcFormatted, setJusdcFormatted] = useState("0.00");
  const [cryptoPrices, setCryptoPrices] = useState({
    "usd-coin": 1,
    jusdc: 0.945,
  });

  const totalValue = (
    parseFloat(usdcFormatted) + parseFloat(jusdcFormatted)
  ).toFixed(2);

  // Fetch wallet balances
  async function fetchBalances() {
    if (!address || !chainId) {
      setUsdcFormatted("0.00");
      setJusdcFormatted("0.00");
      return;
    }

    try {
      const provider = new ethers.providers.JsonRpcProvider(RPC_URLS[chainId]);
      const usdcAddress = USDC_ADDRESSES[chainId as keyof typeof USDC_ADDRESSES];
      if (usdcAddress) {
        const usdcContract = new ethers.Contract(
          usdcAddress,
          ["function balanceOf(address) view returns (uint256)"],
          provider
        );
        const balance = await usdcContract.balanceOf(address);
        setUsdcFormatted(parseFloat(ethers.utils.formatUnits(balance, 6)).toFixed(2));
      }

      const jusdcAddress = JUSDC_ADDRESSES[chainId];
      if (jusdcAddress) {
        const code = await provider.getCode(jusdcAddress);
        if (code !== "0x" && code !== "0x0") {
          const jusdcContract = new ethers.Contract(
            jusdcAddress,
            ["function balanceOf(address) view returns (uint256)"],
            provider
          );
          const balance = await jusdcContract.balanceOf(address);
          const decimals = JUSDC_DECIMALS[chainId] || 6;
          setJusdcFormatted(parseFloat(ethers.utils.formatUnits(balance, decimals)).toFixed(2));
        } else {
          setJusdcFormatted("0.00");
        }
      }
    } catch (err) {
      setUsdcFormatted("0.00");
      setJusdcFormatted("0.00");
      console.error("Error fetching balances:", err);
    }
  }

  useEffect(() => {
    if (isConnected && address && chainId) fetchBalances();
    else {
      setUsdcFormatted("0.00");
      setJusdcFormatted("0.00");
    }
  }, [address, chainId, isConnected]);

  // Fetch crypto prices
  useEffect(() => {
    async function fetchPrices() {
      try {
        const res = await fetch("http://localhost:3003/api/prices");
        const data = await res.json();
        setCryptoPrices({
          "usd-coin": data["usd-coin"]?.usd || 1,
          jusdc: data["jusdc"]?.usd || 0.945,
        });
      } catch {
        setCryptoPrices({ "usd-coin": 1, jusdc: 0.945 });
      }
    }
    fetchPrices();
  }, []);

  // Handle Transak Buy
  async function handleBuy() {
    if (!address || !chainId) return toast.error("Please connect wallet");
    const amountUSD = parseFloat(buyAmount);
    if (!amountUSD || amountUSD < 10) return toast.error("Minimum $10 required");

    setIsProcessing(true);

    try {
      const container = document.getElementById("transak-container");
      if (!container) throw new Error("Transak container not found");

      const transak = new Transak({
        apiKey: "YOUR_TRANSAC_API_KEY", // Replace with your key
        environment: "STAGING",
        walletAddress: address,
        fiatCurrency: "USD",
        defaultCryptoCurrency: "USDC",
        themeColor: "000000",
        hostURL: window.location.origin, // Required
        widgetHeight: "600px",
        widgetWidth: "450px",
        disableWalletAddressForm: true,
        container: container, // Must specify container
      });

      transak.init();

      transak.on(Transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, () => {
        toast.success("✅ Buy successful!");
        setTimeout(fetchBalances, 5000);
        setBuyAmount("");
        setIsProcessing(false);
      });

      transak.on(Transak.EVENTS.TRANSAK_WIDGET_CLOSE, () => setIsProcessing(false));
    } catch (err: any) {
      toast.error(err.message || "Buy error");
      setIsProcessing(false);
    }
  }

  // Handle Sell
  async function handleSell() {
    if (!address || !chainId) return toast.error("Please connect wallet");
    const amount = parseFloat(sellAmount);
    if (!amount || amount <= 0) return toast.error("Invalid amount");

    setIsProcessing(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum as any);
      const signer = provider.getSigner();
      const result = await swapJUSDCtoNative(signer, sellAmount, chainId, MASTER_WALLET);
      if (result.success) {
        toast.success(`✅ Swap successful! Tx: ${result.hash?.slice(0, 10)}...`);
        setSellAmount("");
        setTimeout(fetchBalances, 2000);
      } else {
        toast.error(`Swap failed: ${result.error}`);
      }
    } catch (err: any) {
      toast.error(err.message || "Sell error");
    } finally {
      setIsProcessing(false);
    }
  }

  // Handle network switch
  const handleNetworkSwitch = async (targetChainId: number) => {
    if (!switchChain) return toast.error("Network switching not available");
    if (chainId === targetChainId) return;

    try {
      toast.loading(`Switching to ${NETWORK_NAMES[targetChainId]}...`, { id: "network-switch" });
      await switchChain({ chainId: targetChainId });
      toast.success(`Switched to ${NETWORK_NAMES[targetChainId]}!`, { id: "network-switch" });
      setTimeout(fetchBalances, 1500);
    } catch (err: any) {
      toast.error(`Failed to switch network: ${err.message || "Unknown error"}`, { id: "network-switch" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col items-center justify-start p-6">
      <Toaster position="top-center" />
      <header className="w-full max-w-xl flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <img src="/cashmatrix-logo.png" alt="CashMatrix Logo" className="h-10 w-10 object-contain" />
          <h1 className="text-white text-2xl font-bold">CashMatrix JUSDC</h1>
        </div>
        <ConnectButton />
      </header>

      <div className="bg-gray-800 rounded p-6 w-full max-w-xl space-y-4 text-white">
        <div className="flex justify-between">
          <span>USDC Balance:</span>
          <div className="text-right">
            <div>${usdcFormatted}</div>
            <div className="text-gray-400 text-sm">Price: ${cryptoPrices["usd-coin"]}</div>
          </div>
        </div>
        <div className="flex justify-between">
          <span>JUSDC Balance:</span>
          <div className="text-right">
            <div>${jusdcFormatted}</div>
            <div className="text-gray-400 text-sm">Price: ${cryptoPrices.jusdc}</div>
          </div>
        </div>
        <div className="flex justify-between font-bold">
          <span>Total Value:</span>
          <span>${totalValue}</span>
        </div>

        <div id="transak-container" className="mt-4"></div>

        <div className="mt-4 flex">
          <input
            type="number"
            placeholder="USD Amount to Buy"
            className="px-3 py-1 rounded text-black w-2/3"
            value={buyAmount}
            onChange={(e) => setBuyAmount(e.target.value)}
          />
          <button
            className={`ml-2 px-3 py-1 rounded hover:bg-green-500 flex items-center justify-center ${
              isProcessing ? "bg-green-400 cursor-not-allowed" : "bg-green-600"
            }`}
            onClick={handleBuy}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Buy JUSDC"}
          </button>
        </div>

        <div className="mt-2 flex">
          <input
            type="number"
            placeholder="JUSDC Amount to Sell"
            className="px-3 py-1 rounded text-black w-2/3"
            value={sellAmount}
            onChange={(e) => setSellAmount(e.target.value)}
          />
          <button
            className={`ml-2 px-3 py-1 rounded hover:bg-red-500 flex items-center justify-center ${
              isProcessing ? "bg-red-400 cursor-not-allowed" : "bg-red-600"
            }`}
            onClick={handleSell}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Sell JUSDC"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
