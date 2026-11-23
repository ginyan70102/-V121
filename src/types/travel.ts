export type TransportMode = 'train' | 'hsr' | 'car' | 'flight' | 'ferry';

export type DestinationGroup =
  | 'in_county'
  | 'islands'
  | 'east_south'
  | 'north_tainan'
  | 'central';

export interface AllowanceRule {
  halfDay: number;
  fullDay: number;
  actualClaim?: boolean;
}

export interface DestinationConfig {
  id: string;
  name: string;
  shortName: string;
  group: DestinationGroup;
  groupLabel: string;
  supportedTransports: TransportMode[];
  defaultTransport: TransportMode;
  defaultHoursByTransport: Partial<Record<TransportMode, number>>;
  allowanceByTransport: Partial<Record<TransportMode, AllowanceRule>>;
  defaultFareDestinationId?: string;
  note?: string;
}

export interface TripInput {
  destinationId: string;
  transport: TransportMode;
  oneWayHours: number;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm (30-min stepped)
  endDate: string; // YYYY-MM-DD
  endTime: string; // HH:mm (30-min stepped)
}

export interface CalendarEntry {
  date: string; // YYYY-MM-DD
  isHoliday: boolean;
  category: string;
  name: string;
}

export interface CalendarDataset {
  sourceName: string;
  years: number[];
  totalRecords: number;
  entries: Record<string, CalendarEntry>;
  importedAt: string;
}

export type DayRole =
  | 'outbound_travel'
  | 'official_duty'
  | 'return_travel'
  | 'same_day_round_trip';

export interface DayScheduleItem {
  date: string;
  weekdayLabel: string;
  isHoliday: boolean;
  calendarLabel: string; // e.g., "國慶日調整放假" or "2026 正常工作日"
  calendarYearMatched: boolean;
  role: DayRole;
  roleLabel: string;
  leaveWindow: string; // e.g., "08:00 - 17:00"
  travelBudgetDays: number; // 0, 0.5, 1.0
  compLeaveHours: number;
  compLeaveReason: string;
  guidanceText: string;
}

export interface CalculationResult {
  valid: boolean;
  errorMessage?: string;
  destination: DestinationConfig;
  transport: TransportMode;
  oneWayHours: number;
  spanDays: number;
  isFullDayDuty: boolean;
  isActualClaim: boolean;
  baseAllowedDays: number;
  allowedDays: number;
  extraBudgetDays: number;
  reportStartDate: string;
  reportStartTime: string;
  reportEndDate: string;
  reportEndTime: string;
  reportRangeFormatted: string;
  reportRangeShort: string;
  totalCompLeaveHours: number;
  holidayCompLeaveHours: number;
  weekdayAfterHoursCompHours: number;
  modeDescription: string;
  v121AppliedRules: string[];
  dailySchedule: DayScheduleItem[];
}

export interface FareSegment {
  id: string;
  from: string;
  to: string;
  mode: 'bus' | 'train' | 'hsr' | 'ferry' | 'flight' | 'other';
  modeLabel: string;
  price: number;
  confirmed: boolean;
  note?: string;
  isCustom?: boolean;
}

export interface StoredFareOverride {
  price: number;
  confirmed: boolean;
}

export interface CustomFareLeg {
  id: string;
  routeKey: string;
  from: string;
  to: string;
  mode: FareSegment['mode'];
  price: number;
  confirmed: boolean;
}

export interface AppExportSettings {
  version: 'V121';
  exportedAt: string;
  customTravelHours: Record<string, number>;
  fareOverrides: Record<string, StoredFareOverride>;
  customFareLegs: CustomFareLeg[];
  defaultOriginId: string;
}
