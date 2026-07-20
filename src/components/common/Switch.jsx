import React from "react";
import { C } from "../../theme";

export default function Switch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-5 w-9 items-center rounded-full shrink-0"
      style={{ backgroundColor: checked ? C.primary : C.border, transition: "background-color 0.15s" }}
      aria-label={label}
    >
      <span
        className="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow"
        style={{ transform: checked ? "translateX(18px)" : "translateX(4px)", transition: "transform 0.15s" }}
      />
    </button>
  );
}
