import React from 'react';

interface TokenDropdownProps {
  tokens: { id: string; symbol: string }[];
  selectedToken: { id: string; symbol: string };
  onSelect: (token: { id: string; symbol: string }) => void;
}

const TokenDropdown: React.FC<TokenDropdownProps> = ({ tokens, selectedToken, onSelect }) => {
  return (
    <div className="relative w-full">
      <button
        className="w-full bg-gray-700 text-white p-3 rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-600 transition"
      >
        <span>{selectedToken.symbol}</span>
        <svg
          className="w-4 h-4 ml-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className="absolute mt-1 w-full bg-gray-700 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
        {tokens.map(token => (
          <div
            key={token.id}
            onClick={() => onSelect(token)}
            className="p-3 cursor-pointer hover:bg-gray-600 transition"
          >
            {token.symbol}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TokenDropdown;
