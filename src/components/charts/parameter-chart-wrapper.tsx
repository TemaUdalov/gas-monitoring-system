'use client';

import { ParameterChart } from './parameter-chart';
import { SensorReading } from '@/types';

interface Props {
  data: SensorReading[];
  showPressure?: boolean;
  showTemperature?: boolean;
  showFlowRate?: boolean;
  height?: number;
}

export function ParameterChartWrapper(props: Props) {
  return <ParameterChart {...props} />;
}
