import { useState, useEffect } from "react";
import { ethers } from "ethers";

export const useWallet = () => {
  const [wallet, setWallet] = useState<string | null>(null);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("MetaMask not installed");
        return;
      }
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setWallet(accounts[0]);
    } catch (err) {
      console.error(err);
      alert("Wallet connection failed");
    }
  };

  useEffect(() => {
    const checkWallet = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) setWallet(accounts[0]);
      }
    };
    checkWallet();
  }, []);

  return { wallet, connectWallet };
};
