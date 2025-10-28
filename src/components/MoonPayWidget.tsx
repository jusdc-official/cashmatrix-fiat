import React from "react";
import { getMoonPayUrl } from "../utils/moonpay";

interface MoonPayWidgetProps {
  tokenSymbol: string;
  walletAddress: string;
}

const MoonPayWidget: React.FC<MoonPayWidgetProps> = ({ tokenSymbol, walletAddress }) => {
  const handleBuy = () => {
    const url = getMoonPayUrl(tokenSymbol, walletAddress);
    window.open(url, "_blank", "width=500,height=700");
  };

  return (
    <button
      onClick={handleBuy}
      className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all"
    >
      Buy {tokenSymbol} with Fiat
    </button>
  );
};

export default MoonPayWidget;
