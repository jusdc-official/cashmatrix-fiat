import React, { useState } from "react";
import WalletConnect from "./WalletConnect";
import OptionCard from "./OptionCard";
import Section from "./Section";
import { StatusCard, Notification } from "./StatusNotification";
import { usePrice } from "../context/PriceContext";
import { Toaster } from "react-hot-toast";

// Import your modals
import PaymentGatewayModal from "./modals/PaymentGatewayModal";

const Dashboard: React.FC = () => {
  const { price } = usePrice();
  const [isTransakOpen, setIsTransakOpen] = useState(false);
  const [isCoinRemitterOpen, setIsCoinRemitterOpen] = useState(false);
  const [userAddress, setUserAddress] = useState(""); // will be set by WalletConnect

  return (
    <div className="app">
      <WalletConnect onConnect={(address) => setUserAddress(address)} />

      <Section title="Payment Gateways">
        <OptionCard
          title="Transak"
          value="Buy JUSDC"
          onClick={() => setIsTransakOpen(true)}
        />
        <OptionCard
          title="CoinRemitter"
          value="Buy JUSDC"
          onClick={() => setIsCoinRemitterOpen(true)}
        />
      </Section>

      <Section title="Options">
        <OptionCard title="Current Price" value={`${price} USD`} />
      </Section>

      <Section title="Status">
        <StatusCard status="Connected" />
        <Notification message="Transaction successful!" />
      </Section>

      <PaymentGatewayModal
        isOpen={isTransakOpen}
        onClose={() => setIsTransakOpen(false)}
        userAddress={userAddress}
      />

      <PaymentGatewayModal
        isOpen={isCoinRemitterOpen}
        onClose={() => setIsCoinRemitterOpen(false)}
        userAddress={userAddress}
      />

      <Toaster position="top-right" />
    </div>
  );
};

export default Dashboard;
