// src/components/Spinner.tsx
import React from "react";

const Spinner: React.FC<{ size?: number }> = ({ size = 40 }) => {
  return (
    <div
      className="inline-block animate-spin border-4 border-t-4 border-gray-200 rounded-full"
      style={{ width: size, height: size, borderTopColor: "#3498db" }}
    ></div>
  );
};

export default Spinner;
