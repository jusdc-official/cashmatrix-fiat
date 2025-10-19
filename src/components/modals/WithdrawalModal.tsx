import React, { useState } from "react";

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  cryptoAmount?: number;
  fiatAmount?: number;
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  isOpen,
  onClose,
  cryptoAmount,
  fiatAmount,
}) => {
  const [smsCode, setSmsCode] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl p-6 w-96 shadow-lg">
        <h2 className="text-xl font-bold mb-4">Withdraw Crypto</h2>
        <p>
          You are selling <strong>{cryptoAmount ?? 0} Crypto</strong> for{" "}
          <strong>{fiatAmount ?? 0} USD</strong>
        </p>

        <input
          type="text"
          placeholder="Enter SMS code"
          value={smsCode}
          onChange={(e) => setSmsCode(e.target.value)}
          className="mt-4 w-full p-2 border rounded-lg"
        />

        <button
          className="mt-6 w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          onClick={onClose}
        >
          Confirm Withdrawal
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

export default WithdrawalModal;
