import React from 'react';

const LegendItem: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <div className="flex items-center gap-2">
    <div className={`w-4 h-4 rounded-full ${color}`}></div>
    <span className="text-xs text-slate-300">{label}</span>
  </div>
);

const MapLegend: React.FC = () => {
  return (
    <div className="bg-slate-700/80 p-3 rounded-lg flex flex-col gap-2 backdrop-blur-sm">
      <LegendItem color="bg-indigo-500" label="Root Node" />
      <LegendItem color="bg-violet-500" label="Parent Node" />
      <LegendItem color="bg-fuchsia-500" label="Leaf Node" />
      <LegendItem color="bg-pink-500" label="Collapsed Node" />
    </div>
  );
};

export default MapLegend;