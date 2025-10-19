import React from 'react';
import { NETWORK_MAP, NetworkKey } from '../utils/meld';

interface Props {
  value: NetworkKey;
  onChange: (n: NetworkKey) => void;
}

const NetworkSelector: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm text-gray-300 mb-1">Network</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as NetworkKey)}
        className="p-3 rounded bg-gray-800 text-white w-full"
      >
        {Object.keys(NETWORK_MAP).map((k) => {
          const key = k as NetworkKey;
          return <option key={key} value={key}>{NETWORK_MAP[key].label}</option>;
        })}
      </select>
    </div>
  );
};

export default NetworkSelector;
