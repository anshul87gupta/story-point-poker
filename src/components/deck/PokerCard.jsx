import React from "react";
import { C } from "../../theme";

export default function PokerCard({ value, selected, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={value}
      aria-pressed={selected}
      className="relative h-24 w-16 sm:h-28 sm:w-20 lg:h-32 lg:w-24 xl:h-36 xl:w-28 rounded-lg flex items-center justify-center font-semibold transition-all border-2"
      style={{
        backgroundColor: selected ? C.primaryTint : "#FFFFFF",
        borderColor: selected ? C.primary : C.border,
        color: selected ? C.primary : C.navy,
        transform: selected ? "translateY(-10px)" : "none",
        boxShadow: selected ? "0 6px 14px rgba(0,82,204,0.25)" : "0 1px 2px rgba(9,30,66,0.08)",
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <span className="absolute top-1.5 left-2 text-xs lg:text-sm font-bold">{value}</span>
      <span className="text-lg sm:text-2xl lg:text-3xl">{value}</span>
      <span className="absolute bottom-1.5 right-2 text-xs lg:text-sm font-bold" style={{ transform: "rotate(180deg)" }}>
        {value}
      </span>
    </button>
  );
}
