'use client';

import { Facility, FACILITY_TYPE_LABELS } from '@/types';
import Link from 'next/link';
import { useState } from 'react';

interface NetworkMapProps {
  facilities: Facility[];
}

const statusColors = {
  normal: '#22c55e',
  warning: '#f59e0b',
  critical: '#ef4444',
};

const typeShapes: Record<string, string> = {
  compressor_station: 'M -8 -8 L 8 -8 L 8 8 L -8 8 Z',
  grs: 'M 0 -10 L 10 0 L 0 10 L -10 0 Z',
  metering_unit: 'M -7 -7 L 7 -7 L 7 7 L -7 7 Z',
  pipeline_segment: 'M -10 -5 L 10 -5 L 10 5 L -10 5 Z',
  gas_well: 'M 0 -10 L 8.66 5 L -8.66 5 Z',
  underground_storage: 'M -9 0 A 9 9 0 1 1 9 0 A 9 9 0 1 1 -9 0',
};

// Simplified Russia outline (western/central part, where gas infrastructure is)
const RUSSIA_OUTLINE = 'M 30,180 C 40,170 60,160 90,150 L 120,140 C 140,130 160,125 200,120 L 240,110 C 270,105 300,100 340,95 L 380,88 C 410,82 440,78 480,75 L 520,70 C 550,65 580,60 620,55 L 660,48 C 690,42 720,38 760,35 L 800,30 C 830,28 850,30 870,35 L 880,60 C 875,80 870,100 865,120 L 858,140 C 850,160 845,175 840,190 L 830,210 C 820,230 810,245 790,260 L 760,275 C 740,285 720,290 700,292 L 660,295 C 630,298 600,300 570,302 L 530,305 C 500,308 470,312 440,318 L 400,325 C 370,330 340,335 310,340 L 270,348 C 240,352 210,355 180,358 L 140,360 C 110,360 80,355 60,345 L 45,330 C 35,310 30,290 28,270 L 25,240 C 24,220 26,200 30,180 Z';

function facilityToSvg(_f: Facility, index: number): { x: number; y: number } {
  const cols = 5;
  const row = Math.floor(index / cols);
  const col = index % cols;
  const xSpacing = 160;
  const ySpacing = 120;
  const xOffset = 100;
  const yOffset = 60;
  return {
    x: xOffset + col * xSpacing + (row % 2 === 1 ? 80 : 0),
    y: yOffset + row * ySpacing,
  };
}

export function NetworkMap({ facilities }: NetworkMapProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const positions = facilities.map((f, i) => ({
    ...f,
    ...facilityToSvg(f, i),
  }));

  const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let i = 1; i < positions.length; i++) {
    const prev = positions[i - 1];
    const curr = positions[i];
    lines.push({ x1: prev.x, y1: prev.y, x2: curr.x, y2: curr.y });
  }

  const svgWidth = 900;
  const svgHeight = Math.max(400, Math.ceil(facilities.length / 5) * 120 + 80);

  return (
    <div className="relative overflow-auto">
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full" style={{ minHeight: 380 }}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.04" />
            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.07" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.04" />
          </linearGradient>
        </defs>

        {/* Russia background outline */}
        <path
          d={RUSSIA_OUTLINE}
          fill="url(#mapGradient)"
          stroke="#3b82f6"
          strokeWidth={1.5}
          strokeOpacity={0.15}
        />

        {/* Grid dots for "map" feel */}
        {Array.from({ length: 15 }).map((_, row) =>
          Array.from({ length: 25 }).map((_, col) => (
            <circle
              key={`dot-${row}-${col}`}
              cx={36 * col + 18}
              cy={28 * row + 14}
              r={0.5}
              fill="#94a3b8"
              opacity={0.2}
            />
          ))
        )}

        {/* Pipeline connections */}
        {lines.map((line, i) => (
          <line
            key={`line-${i}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="#93c5fd"
            strokeWidth={2}
            strokeDasharray="6 3"
            opacity={0.6}
          />
        ))}

        {/* Facility nodes */}
        {positions.map((p) => {
          const isHovered = hoveredId === p.id;
          const color = statusColors[p.status];

          return (
            <Link key={p.id} href={`/equipment/${p.id}`}>
              <g
                onMouseEnter={() => setHoveredId(p.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="cursor-pointer"
                filter={p.status === 'critical' ? 'url(#glow)' : undefined}
              >
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 22 : 18}
                  fill={color}
                  opacity={0.15}
                  className="transition-all duration-200"
                />
                <path
                  d={typeShapes[p.type] || typeShapes.compressor_station}
                  transform={`translate(${p.x}, ${p.y}) scale(${isHovered ? 1.2 : 1})`}
                  fill={color}
                  stroke="white"
                  strokeWidth={2}
                  className="transition-all duration-200"
                />
                <text
                  x={p.x}
                  y={p.y + 28}
                  textAnchor="middle"
                  fontSize={10}
                  fill="#71717a"
                  fontWeight={isHovered ? 600 : 400}
                >
                  {p.name.length > 20 ? p.name.substring(0, 20) + '…' : p.name}
                </text>
                {isHovered && (
                  <g>
                    <rect
                      x={p.x - 80}
                      y={p.y - 70}
                      width={160}
                      height={44}
                      rx={6}
                      fill="white"
                      stroke="#e4e4e7"
                      strokeWidth={1}
                    />
                    <text x={p.x} y={p.y - 52} textAnchor="middle" fontSize={11} fontWeight={600} fill="#18181b">
                      {FACILITY_TYPE_LABELS[p.type]}
                    </text>
                    <text x={p.x} y={p.y - 36} textAnchor="middle" fontSize={10} fill="#71717a">
                      {p.pressure} МПа · {p.temperature}°C · {p.flowRate} м³/ч
                    </text>
                  </g>
                )}
              </g>
            </Link>
          );
        })}
      </svg>
    </div>
  );
}
