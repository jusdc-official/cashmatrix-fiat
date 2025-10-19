import React, { useState } from "react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultFiat?: string;
  defaultPaymentMethod?: string;
  onSave?: (fiat: string, method: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  defaultFiat = "USD",
  defaultPaymentMethod = "Bank Transfer",
  onSave,
}) => {
  const [fiat, setFiat] = useState(defaultFiat);
  const [paymentMethod, setPaymentMethod] = useState(defaultPaymentMethod);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave?.(fiat, paymentMethod);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl p-6 w-96 shadow-lg">
        <h2 className="text-xl font-bold mb-4">Settings</h2>

        <label className="block mb-2 font-medium">Default Fiat Currency</label>
        <input
          type="text"
          value={fiat}
          onChange={(e) => setFiat(e.target.value)}
          className="w-full p-2 mb-4 border rounded-lg"
        />

        <label className="block mb-2 font-medium">Default Payment Method</label>
        <input
          type="text"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="w-full p-2 mb-4 border rounded-lg"
        />

        <button
          className="mt-2 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          onClick={handleSave}
        >
          Save Settings
        </button>
        <button
          className="mt-2 w-full py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;
