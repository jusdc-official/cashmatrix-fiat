import React, { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { ethers } from "ethers";
import { swapUSDCtoJUSDC } from "../../utils/swap";

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  signer?: ethers.Signer;
  chainId: number;
}

const MOONPAY_PUBLIC_KEY = "pk_test_6z5NLT7sPohxcve6reEygpQZeI7LUuP"; // Sandbox key

const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  isOpen,
  onClose,
  signer,
  chainId,
}) => {
  const [iframeUrl, setIframeUrl] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [status, setStatus] = useState<"idle" | "swapping">("idle");

  // Fetch wallet address
  useEffect(() => {
    const fetchAddress = async () => {
      if (signer) {
        const address = await signer.getAddress();
        setUserAddress(address);
      }
    };
    fetchAddress();
  }, [signer]);

  // Initialize MoonPay sandbox iframe
  useEffect(() => {
    if (isOpen && userAddress) {
      const url = new URL("https://buy-sandbox.moonpay.com/"); // Sandbox for local dev
      url.searchParams.append("apiKey", MOONPAY_PUBLIC_KEY);
      url.searchParams.append("currencyCode", "usdc"); // Only USDC
      url.searchParams.append("walletAddress", userAddress);
      url.searchParams.append("baseCurrencyCode", "usd");
      url.searchParams.append("enabledCurrencies", "usdc"); // Disable others
      url.searchParams.append("colorCode", "#111827");
      url.searchParams.append("redirectURL", `${window.location.origin}?moonpayRedirect=true`);
      setIframeUrl(url.toString());
      console.log("MoonPay Sandbox URL:", url.toString());
    }
  }, [isOpen, userAddress]);

  // Listen for MoonPay sandbox messages to auto-swap USDC → JUSDC
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== "https://buy-sandbox.moonpay.com") return;
      const data = event.data;

      if (data && data.type === "MOONPAY_TRANSACTION_COMPLETED" && signer && chainId) {
        const amountPurchased = data.baseCurrencyAmount;
        setStatus("swapping");

        try {
          const result = await swapUSDCtoJUSDC(signer, amountPurchased, chainId);
          if (result.success) {
            alert(`✅ JUSDC Swap Successful!\nTx Hash: ${result.hash}`);
          } else {
            alert(`⚠️ Swap failed: ${result.error}`);
          }
        } catch (err) {
          console.error(err);
          alert("Swap execution failed.");
        } finally {
          setStatus("idle");
          onClose();
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [signer, chainId, onClose]);

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
    >
      <Dialog.Panel className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-xl w-[90%] max-w-2xl">
        <h2 className="text-lg font-semibold mb-2 text-center">
          Buy JUSDC with Fiat (Sandbox)
        </h2>

        {iframeUrl ? (
          <iframe
            src={iframeUrl}
            title="MoonPay Sandbox Widget"
            className="w-full h-[600px] rounded-xl border border-gray-700"
          />
        ) : (
          <p className="text-center text-gray-400">Loading MoonPay widget...</p>
        )}

        {status === "swapping" && (
          <p className="text-center mt-4 text-blue-600 font-semibold">
            Swapping USDC → JUSDC...
          </p>
        )}
      </Dialog.Panel>
    </Dialog>
  );
};

export default PaymentGatewayModal;
