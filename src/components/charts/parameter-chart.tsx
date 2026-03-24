'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { SensorReading } from '@/types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface ParameterChartProps {
  data: SensorReading[];
  showPressure?: boolean;
  showTemperature?: boolean;
  showFlowRate?: boolean;
  height?: number;
}

export function ParameterChart({
  data,
  showPressure = true,
  showTemperature = true,
  showFlowRate = false,
  height = 300,
}: ParameterChartProps) {
  const chartData = data.map((r) => ({
    ...r,
    time: format(new Date(r.timestamp), 'dd.MM HH:mm', { locale: ru }),
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 11 }}
          stroke="#a1a1aa"
          interval="preserveStartEnd"
        />
        <YAxis tick={{ fontSize: 11 }} stroke="#a1a1aa" />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e4e4e7',
            borderRadius: '8px',
            fontSize: '12px',
          }}
        />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
        {showPressure && (
          <Line
            type="monotone"
            dataKey="pressure"
            name="Давление (МПа)"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        )}
        {showTemperature && (
          <Line
            type="monotone"
            dataKey="temperature"
            name="Температура (°C)"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        )}
        {showFlowRate && (
          <Line
            type="monotone"
            dataKey="flowRate"
            name="Расход (тыс. м³/ч)"
            stroke="#22c55e"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
