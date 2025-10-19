import React from "react";
import WalletConnect from "./WalletConnect";
import OptionCard from "./OptionCard";
import Section from "./Section";
import { StatusCard, Notification } from "./StatusNotification";
import { usePrice } from "../context/PriceContext";
import { Toaster } from "react-hot-toast";

const Dashboard: React.FC = () => {
  const { price } = usePrice();

  return (
    <div className="app">
      <WalletConnect />
      <Section title="Options">
        <OptionCard title="Buy" value="100 USD" />
        <OptionCard title="Sell" value="50 USD" />
        <OptionCard title="Current Price" value={`${price} USD`} />
      </Section>
      <Section title="Status">
        <StatusCard status="Connected" />
        <Notification message="Transaction successful!" />
      </Section>
      <Toaster position="top-right" />
    </div>
  );
};

export default Dashboard;
