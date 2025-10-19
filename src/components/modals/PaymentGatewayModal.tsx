import React from "react";

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  cryptoAmount?: number;
  fiatAmount?: number;
}

const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  isOpen,
  onClose,
  cryptoAmount,
  fiatAmount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl p-6 w-96 shadow-lg">
        <h2 className="text-xl font-bold mb-4">Payment Gateway</h2>
        <p>
          You are purchasing <strong>{cryptoAmount ?? 0} Crypto</strong> for{" "}
          <strong>{fiatAmount ?? 0} USD</strong>
        </p>
        <button
          className="mt-6 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          onClick={onClose}
        >
          Confirm Payment
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

export default PaymentGatewayModal;
