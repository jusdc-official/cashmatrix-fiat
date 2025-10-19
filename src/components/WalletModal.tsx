import React, { useEffect, useState } from "react";
import { Web3Modal, useWeb3Modal } from "@web3modal/react";
import { initWalletConnect } from "../wallet/connect";

export default function WalletModal() {
  const [clientReady, setClientReady] = useState(false);
  const { open } = useWeb3Modal();

  useEffect(() => {
    initWalletConnect().then(() => setClientReady(true));
  }, []);

  const handleConnect = async () => {
    if (!clientReady) return;
    open(); // Opens the WalletConnect modal
  };

  return (
    <div>
      <button
        onClick={handleConnect}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Connect Wallet
      </button>

      <Web3Modal
        projectId="YOUR_PROJECT_ID" // same as above
        theme="dark"
      />
    </div>
  );
}
