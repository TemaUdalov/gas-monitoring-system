export type FacilityType = 'compressor_station' | 'grs' | 'metering_unit' | 'pipeline_segment' | 'gas_well' | 'underground_storage';

export type FacilityStatus = 'normal' | 'warning' | 'critical';

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export type AlertStatus = 'active' | 'acknowledged' | 'resolved';

export type TimePeriod = 'day' | 'week' | 'month';

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  location: { lat: number; lng: number; label: string };
  status: FacilityStatus;
  pressure: number;
  temperature: number;
  flowRate: number;
  lastUpdated: string;
  description: string;
}

export interface SensorReading {
  id: string;
  facilityId: string;
  timestamp: string;
  pressure: number;
  temperature: number;
  flowRate: number;
}

export interface Alert {
  id: string;
  facilityId: string;
  facilityName: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  createdAt: string;
  isRead?: boolean;
}

export interface Report {
  id: string;
  title: string;
  period: string;
  createdAt: string;
  summary: string;
  type: 'daily' | 'weekly' | 'monthly' | 'incident';
}

export interface DashboardMetrics {
  activeFacilities: number;
  criticalAlerts: number;
  avgTemperature: number;
  avgPressure: number;
}

export const FACILITY_TYPE_LABELS: Record<FacilityType, string> = {
  compressor_station: 'Компрессорная станция',
  grs: 'ГРС',
  metering_unit: 'Узел учёта',
  pipeline_segment: 'Магистральный участок',
  gas_well: 'Газовая скважина',
  underground_storage: 'ПХГ',
};

export const STATUS_LABELS: Record<FacilityStatus, string> = {
  normal: 'Норма',
  warning: 'Предупреждение',
  critical: 'Авария',
};

export const ALERT_SEVERITY_LABELS: Record<AlertSeverity, string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
  critical: 'Критический',
};

export const ALERT_STATUS_LABELS: Record<AlertStatus, string> = {
  active: 'Активно',
  acknowledged: 'Принято',
  resolved: 'Устранено',
};
