"use client";

import { useState } from "react";

interface FilterBarProps {
  onFilterChange: (filters: { vehicleType: string; color: string }) => void;
}

const vehicleTypes = ["All", "Car", "Motorcycle", "Truck", "ATV"];
const colors = ["All", "Red", "Blue", "Black", "White", "Silver", "Yellow", "Green", "Orange"];

export function FilterBar({ onFilterChange }: FilterBarProps) {
  const [vehicleType, setVehicleType] = useState("All");
  const [color, setColor] = useState("All");

  const handleVehicle = (v: string) => {
    setVehicleType(v);
    onFilterChange({ vehicleType: v, color });
  };

  const handleColor = (c: string) => {
    setColor(c);
    onFilterChange({ vehicleType, color: c });
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        {vehicleTypes.map((v) => (
          <button
            key={v}
            onClick={() => handleVehicle(v)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
              vehicleType === v
                ? "bg-accent text-white"
                : "bg-bg-elevated text-text-secondary hover:bg-bg-hover hover:text-text-primary"
            }`}
          >
            {v}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => handleColor(c)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              color === c
                ? "bg-accent text-white"
                : "bg-bg-elevated text-text-secondary hover:bg-bg-hover hover:text-text-primary"
            }`}
          >
            {c !== "All" && (
              <div
                className="h-2 w-2 rounded-full border border-white/20"
                style={{ backgroundColor: c.toLowerCase() }}
              />
            )}
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}