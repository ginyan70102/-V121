import { getDestinationById, TRANSPORT_LABELS } from '../data/destinations';
import { lookupCalendarDay } from '../data/taiwanCalendar';
import {
  CalculationResult,
  CalendarDataset,
  DayScheduleItem,
  FareSegment,
  TripInput,
} from '../types/travel';

const WEEKDAYS_ZH = ['日', '一', '二', '三', '四', '五', '六'];

export const TIME_STEP_OPTIONS: string[] = (() => {
  const opts: string[] = [];
  for (let mins = 8 * 60; mins <= 20 * 60; mins += 30) {
    opts.push(formatMinutesToHHmm(mins));
  }
  return opts;
})();

export function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseTimeToMinutes(hhmm: string): number {
  const [hStr, mStr] = hhmm.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return 8 * 60;
  return h * 60 + m;
}

export function formatMinutesToHHmm(totalMinutes: number): string {
  const clamped = Math.max(0, Math.min(24 * 60, Math.round(totalMinutes)));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * V121 時間修正原則：
 * - 公務開始時間：非整點/半點無條件捨去（08:40 -> 08:30）
 * - 公務結束時間：非整點/半點無條件進位（16:40 -> 17:00）
 */
export function roundStartTimeFloor30(hhmm: string): string {
  const mins = parseTimeToMinutes(hhmm);
  const floored = Math.floor(mins / 30) * 30;
  return formatMinutesToHHmm(Math.max(8 * 60, Math.min(20 * 60, floored)));
}

export function roundEndTimeCeil30(hhmm: string): string {
  const mins = parseTimeToMinutes(hhmm);
  const ceiled = Math.ceil(mins / 30) * 30;
  return formatMinutesToHHmm(Math.max(8 * 60, Math.min(20 * 60, ceiled)));
}

export function addDays(dateStr: string, delta: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + delta);
  const ny = dt.getFullYear();
  const nm = String(dt.getMonth() + 1).padStart(2, '0');
  const nd = String(dt.getDate()).padStart(2, '0');
  return `${ny}-${nm}-${nd}`;
}

export function diffDaysInclusive(startDate: string, endDate: string): number {
  const [sy, sm, sd] = startDate.split('-').map(Number);
  const [ey, em, ed] = endDate.split('-').map(Number);
  const s = Date.UTC(sy, sm - 1, sd);
  const e = Date.UTC(ey, em - 1, ed);
  return Math.round((e - s) / 86400000) + 1;
}

export function getWeekdayLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return `週${WEEKDAYS_ZH[dt.getDay()]}`;
}

export function formatShortDate(dateStr: string): string {
  const [, m, d] = dateStr.split('-').map(Number);
  return `${m}/${d}`;
}

export function formatSlashDate(dateStr: string): string {
  return dateStr.replace(/-/g, '/');
}

/**
 * 計算當日公務實際工時（扣除 12:00-13:00 午休保障時間）
 */
function calculateDutyHoursExcludingLunch(startMin: number, endMin: number): number {
  const lunchStart = 12 * 60;
  const lunchEnd = 13 * 60;
  const rawSpan = Math.max(0, endMin - startMin);
  const overlapStart = Math.max(startMin, lunchStart);
  const overlapEnd = Math.min(endMin, lunchEnd);
  const lunchOverlap = Math.max(0, overlapEnd - overlapStart);
  return Math.max(0, (rawSpan - lunchOverlap) / 60);
}

/**
 * 臺東縣政府出差天數、差勤起訖與路程補休計算核心引擎 (V121 規範)
 */
export function calculateTaitungTravel(
  input: TripInput,
  calendar: CalendarDataset
): CalculationResult {
  const destination = getDestinationById(input.destinationId);
  const transport = destination.supportedTransports.includes(input.transport)
    ? input.transport
    : destination.defaultTransport;
  const oneWayHours = Math.max(0.5, Math.min(16, Number(input.oneWayHours) || 1));
  const travelMinutes = Math.round(oneWayHours * 60);

  const spanDays = diffDaysInclusive(input.startDate, input.endDate);
  const startMin = parseTimeToMinutes(input.startTime);
  const endMin = parseTimeToMinutes(input.endTime);

  if (spanDays <= 0) {
    return buildErrorResult(destination, transport, oneWayHours, '公務結束日期不可早於開始日期。');
  }
  if (spanDays === 1 && endMin <= startMin) {
    return buildErrorResult(destination, transport, oneWayHours, '單日公務之結束時間必須晚於開始時間。');
  }

  // 1. 判定半日公務 vs 整日公務（跨午休 12:00-13:00 或連續多日即為整日）
  const crossesLunch = startMin < 12 * 60 && endMin > 12 * 60;
  const singleDayDutyHours = calculateDutyHoursExcludingLunch(startMin, endMin);
  const isFullDayDuty = spanDays > 1 || crossesLunch || singleDayDutyHours > 4;

  // 2. 查《臺東縣政府員工出差天數核給標準表》
  const rule = destination.allowanceByTransport[transport] ?? { halfDay: 1.0, fullDay: 1.0 };
  const isActualClaim = Boolean(rule.actualClaim);
  const baseAllowedDays = isFullDayDuty ? rule.fullDay : rule.halfDay;
  const allowedDays = Number((baseAllowedDays + (spanDays - 1)).toFixed(1));
  const extraBudgetDays = Number(Math.max(0, allowedDays - spanDays).toFixed(1));

  // 3. 決定前後延伸路程假配置
  let prevDayBudget = 0; // 0, 0.5, 1.0
  let nextDayBudget = 0; // 0, 0.5, 1.0

  if (extraBudgetDays >= 1.5) {
    prevDayBudget = 1.0;
    nextDayBudget = 1.0;
  } else if (extraBudgetDays === 1.0) {
    prevDayBudget = 0.5;
    nextDayBudget = 0.5;
  } else if (extraBudgetDays === 0.5) {
    if (startMin < 12 * 60) {
      prevDayBudget = 0.5;
    } else {
      nextDayBudget = 0.5;
    }
  }

  // 4. 推算當日去程出發與回程抵達（當無前一日或後一日延伸路程假時）
  // 保障 12:00-13:00 午休時間不計入路程
  let sameDayOutboundStartMin = 8 * 60;
  let sameDayEarlyCompHours = 0;
  if (prevDayBudget === 0) {
    const targetArrive = startMin >= 13 * 60 ? 12 * 60 : startMin;
    const rawDepart = targetArrive - travelMinutes;
    if (rawDepart <= 7 * 60 + 30) {
      sameDayOutboundStartMin = Math.max(0, rawDepart);
      const earlyMins = Math.max(0, 8 * 60 - sameDayOutboundStartMin);
      sameDayEarlyCompHours = earlyMins > 0 ? Math.ceil(earlyMins / 60) : 0;
    } else {
      sameDayOutboundStartMin = 8 * 60;
    }
  }

  let sameDayReturnArrivalMin = 17 * 60;
  let sameDayAfterHoursCompHours = 0;
  let returnDepartMin = endMin;
  if (nextDayBudget === 0) {
    // 若公務結束於 12:00，保障 12:00-13:00 午休後 13:00 啟程返程
    returnDepartMin = endMin <= 12 * 60 ? 13 * 60 : endMin;
    const rawArrival = returnDepartMin + travelMinutes;
    if (rawArrival > 17 * 60) {
      sameDayReturnArrivalMin = Math.min(24 * 60, rawArrival);
      const afterMins = Math.max(0, rawArrival - 17 * 60);
      sameDayAfterHoursCompHours = Math.ceil(afterMins / 60);
    } else {
      sameDayReturnArrivalMin = 17 * 60;
    }
  }

  // 5. 線上差勤系統應申報起訖時間
  const reportStartDate = prevDayBudget > 0 ? addDays(input.startDate, -1) : input.startDate;
  const reportStartTime =
    prevDayBudget === 1.0
      ? '08:00'
      : prevDayBudget === 0.5
      ? '13:00'
      : formatMinutesToHHmm(sameDayOutboundStartMin);

  const reportEndDate = nextDayBudget > 0 ? addDays(input.endDate, 1) : input.endDate;
  const reportEndTime =
    nextDayBudget === 1.0
      ? '17:00'
      : nextDayBudget === 0.5
      ? '12:00'
      : formatMinutesToHHmm(sameDayReturnArrivalMin);

  // 6. 逐日建立行程與 V121 路程補休解析
  const dailySchedule: DayScheduleItem[] = [];
  const v121AppliedRules: string[] = [];
  let holidayCompLeaveHours = 0;
  let weekdayAfterHoursCompHours = 0;

  // (A) 前一日去程路程日
  if (prevDayBudget > 0) {
    const prevDate = addDays(input.startDate, -1);
    const cal = lookupCalendarDay(prevDate, calendar);
    const leaveWindow = prevDayBudget === 1.0 ? '08:00 - 17:00' : '13:00 - 17:00';
    let compHours = 0;
    let compReason = '平日給薪路程公假（0 小時補休）';
    let guidanceText = '';

    if (cal.isHoliday) {
      if (prevDayBudget === 1.0) {
        compHours = 8;
        compReason = 'V121 假日全日路程假：全額核給法定工時 8 小時補休';
        guidanceText = `去程路程日適逢【${cal.label}】，差勤系統仍自 08:00 起報以維保險完整；全日路程假落在放假日，依規定核給 8 小時假日路程補休。`;
        v121AppliedRules.push(`去程 ${formatShortDate(prevDate)} 適逢假日（全日路程）➔ 直接核給 8 小時補休`);
      } else {
        compHours = Math.min(8, Math.ceil(oneWayHours));
        compReason = `V121 假日半日路程覈實採計：單趟 ${oneWayHours} 小時無條件進位 ➔ ${compHours} 小時（上限 8 小時）`;
        guidanceText = `去程半日路程適逢【${cal.label}】，差勤系統自 13:00 起報；依《注意事項八、六》全日皆屬非辦公時間，不硬扣為 4 小時，按單趟車程 ${oneWayHours} 小時無條件進位覈實核給 ${compHours} 小時補休。`;
        v121AppliedRules.push(
          `去程 ${formatShortDate(prevDate)} 適逢假日（半日路程）➔ 依 V121 按單趟車程 ${oneWayHours}h 覈實核給 ${compHours} 小時`
        );
      }
      holidayCompLeaveHours += compHours;
    } else {
      guidanceText =
        prevDayBudget === 1.0
          ? `平日全日去程路程公假（08:00 起報），安心前往出差地備勤。`
          : `平日下午半日去程路程公假（13:00 起報），上午於原機關正常辦公，下午啟程赴差。`;
    }

    dailySchedule.push({
      date: prevDate,
      weekdayLabel: getWeekdayLabel(prevDate),
      isHoliday: cal.isHoliday,
      calendarLabel: cal.label,
      calendarYearMatched: cal.yearMatched,
      role: 'outbound_travel',
      roleLabel: prevDayBudget === 1.0 ? '去程路程（全日）' : '去程路程（半日）',
      leaveWindow,
      travelBudgetDays: prevDayBudget,
      compLeaveHours: compHours,
      compLeaveReason: compReason,
      guidanceText,
    });
  }

  // (B) 實際公務執行日（單日或連續多日）
  for (let i = 0; i < spanDays; i++) {
    const curDate = addDays(input.startDate, i);
    const cal = lookupCalendarDay(curDate, calendar);
    const isFirstDay = i === 0;
    const isLastDay = i === spanDays - 1;

    let dayCompHours = 0;
    const reasons: string[] = [];
    const notes: string[] = [];

    const dayStartLabel = isFirstDay ? input.startTime : '08:00';
    const dayEndLabel = isLastDay ? input.endTime : '17:00';
    let windowStart = isFirstDay && prevDayBudget === 0 ? reportStartTime : '08:00';
    let windowEnd = isLastDay && nextDayBudget === 0 ? reportEndTime : '17:00';

    if (spanDays === 1 && prevDayBudget === 0 && nextDayBudget === 0) {
      windowStart = reportStartTime;
      windowEnd = reportEndTime;
    }

    if (cal.isHoliday) {
      // 假日執行公務（含當日往返車程）
      const dutyHrs = calculateDutyHoursExcludingLunch(
        parseTimeToMinutes(dayStartLabel),
        parseTimeToMinutes(dayEndLabel)
      );
      let holidayTravelExtra = 0;
      if (isFirstDay && prevDayBudget === 0) holidayTravelExtra += oneWayHours;
      if (isLastDay && nextDayBudget === 0) holidayTravelExtra += oneWayHours;
      const totalHolidayHrs = Math.min(8, Math.ceil(dutyHrs + holidayTravelExtra));
      dayCompHours = totalHolidayHrs;
      holidayCompLeaveHours += totalHolidayHrs;
      reasons.push(`假日公務／路程覈實採計（扣除午休，單日上限 8 小時）`);
      notes.push(
        `本日適逢【${cal.label}】，實際公務時間 ${dayStartLabel}–${dayEndLabel}${
          holidayTravelExtra > 0 ? `（含當日車程 ${holidayTravelExtra} 小時）` : ''
        }，可核實申請假日出差補休 ${totalHolidayHrs} 小時。`
      );
      v121AppliedRules.push(
        `公務日 ${formatShortDate(curDate)} 適逢假日 ➔ 依實際公務與車程覈實核給 ${totalHolidayHrs} 小時`
      );
    } else {
      // 平日公務：檢查當日早出發或 17:00 後返抵之非辦公時間路程補休
      notes.push(`執行公務時間 ${dayStartLabel}–${dayEndLabel}（12:00–13:00 為午休保障時間，不計路程）。`);

      if (isFirstDay && prevDayBudget === 0 && sameDayEarlyCompHours > 0) {
        dayCompHours += sameDayEarlyCompHours;
        weekdayAfterHoursCompHours += sameDayEarlyCompHours;
        reasons.push(`08:00 前提早出發（${reportStartTime} 啟程，補休 ${sameDayEarlyCompHours} 小時）`);
        notes.push(
          `因當日往返且單趟車程 ${oneWayHours} 小時，須於 ${reportStartTime} 提早出發，08:00 前屬非辦公時間，不足 1 小時以 1 小時計（+${sameDayEarlyCompHours} 小時）。`
        );
        v121AppliedRules.push(
          `${formatShortDate(curDate)} 提早於 ${reportStartTime} 出發 ➔ 核給 ${sameDayEarlyCompHours} 小時非辦公時間補休`
        );
      }

      if (isLastDay && nextDayBudget === 0 && sameDayAfterHoursCompHours > 0) {
        dayCompHours += sameDayAfterHoursCompHours;
        weekdayAfterHoursCompHours += sameDayAfterHoursCompHours;
        const rawArrStr = formatMinutesToHHmm(returnDepartMin + travelMinutes);
        reasons.push(`17:00 後返抵（預計 ${rawArrStr} 返抵，補休 ${sameDayAfterHoursCompHours} 小時）`);
        notes.push(
          `公務結束後於 ${formatMinutesToHHmm(returnDepartMin)} 啟程返程，車程 ${oneWayHours} 小時，預計 ${rawArrStr} 返抵；17:00 後依《注意事項六》不足 1 小時以 1 小時計（+${sameDayAfterHoursCompHours} 小時）。`
        );
        v121AppliedRules.push(
          `${formatShortDate(curDate)} 平日 17:00 後返抵（${rawArrStr}）➔ 依注意事項六進位核給 ${sameDayAfterHoursCompHours} 小時`
        );
      }

      if (reasons.length === 0) {
        reasons.push('正常辦公時間內執行公務（0 小時補休）');
      }
    }

    dailySchedule.push({
      date: curDate,
      weekdayLabel: getWeekdayLabel(curDate),
      isHoliday: cal.isHoliday,
      calendarLabel: cal.label,
      calendarYearMatched: cal.yearMatched,
      role:
        spanDays === 1 && prevDayBudget === 0 && nextDayBudget === 0
          ? 'same_day_round_trip'
          : 'official_duty',
      roleLabel:
        spanDays === 1 && prevDayBudget === 0 && nextDayBudget === 0
          ? '當日往返公務'
          : spanDays > 1
          ? `公務第 ${i + 1} 日`
          : '公務執行日',
      leaveWindow: `${windowStart} - ${windowEnd}`,
      travelBudgetDays: 0,
      compLeaveHours: dayCompHours,
      compLeaveReason: reasons.join('；'),
      guidanceText: notes.join(' '),
    });
  }

  // (C) 後一日回程路程日
  if (nextDayBudget > 0) {
    const nextDate = addDays(input.endDate, 1);
    const cal = lookupCalendarDay(nextDate, calendar);
    const leaveWindow = nextDayBudget === 1.0 ? '08:00 - 17:00' : '08:00 - 12:00';
    let compHours = 0;
    let compReason = '平日給薪路程公假（0 小時補休）';
    let guidanceText = '';

    if (cal.isHoliday) {
      if (nextDayBudget === 1.0) {
        compHours = 8;
        compReason = 'V121 假日全日路程假：全額核給法定工時 8 小時補休';
        guidanceText = `回程路程日適逢【${cal.label}】，差勤系統照常填報至 17:00 以確保平安保險完整；全日路程假落在放假日，直接全額核給 8 小時假日路程補休。`;
        v121AppliedRules.push(`回程 ${formatShortDate(nextDate)} 適逢假日（全日路程）➔ 直接核給 8 小時補休`);
      } else {
        compHours = Math.min(8, Math.ceil(oneWayHours));
        compReason = `V121 假日半日路程覈實採計：單趟 ${oneWayHours} 小時無條件進位 ➔ ${compHours} 小時（上限 8 小時）`;
        guidanceText = `回程半日路程適逢【${cal.label}】，差勤系統照常填報至 12:00 維繫出差保險；依《注意事項八、六》不限 4 小時，按單趟車程 ${oneWayHours} 小時無條件進位覈實核給 ${compHours} 小時補休。`;
        v121AppliedRules.push(
          `回程 ${formatShortDate(nextDate)} 適逢假日（半日路程）➔ 依 V121 按單趟車程 ${oneWayHours}h 覈實核給 ${compHours} 小時`
        );
      }
      holidayCompLeaveHours += compHours;
    } else {
      guidanceText =
        nextDayBudget === 1.0
          ? `平日全日回程路程公假（申報至 17:00），從容返抵臺東。`
          : `平日上午半日回程路程公假（申報至 12:00），下午 13:00 返機關正常上班。`;
    }

    dailySchedule.push({
      date: nextDate,
      weekdayLabel: getWeekdayLabel(nextDate),
      isHoliday: cal.isHoliday,
      calendarLabel: cal.label,
      calendarYearMatched: cal.yearMatched,
      role: 'return_travel',
      roleLabel: nextDayBudget === 1.0 ? '回程路程（全日）' : '回程路程（半日）',
      leaveWindow,
      travelBudgetDays: nextDayBudget,
      compLeaveHours: compHours,
      compLeaveReason: compReason,
      guidanceText,
    });
  }

  const totalCompLeaveHours = holidayCompLeaveHours + weekdayAfterHoursCompHours;

  const modeDescription = isActualClaim
    ? `離島／外島覈實申報參考（基準 ${baseAllowedDays.toFixed(1)} 天${spanDays > 1 ? ` + 續日 ${spanDays - 1} 天` : ''}）`
    : spanDays > 1
    ? `連續 ${spanDays} 日公務模式（基準 ${baseAllowedDays.toFixed(1)} 天 + ${spanDays - 1} 天）`
    : isFullDayDuty
    ? `單日整天公務（跨午休，核給 ${baseAllowedDays.toFixed(1)} 天）`
    : `單日半天公務（未跨午休，核給 ${baseAllowedDays.toFixed(1)} 天）`;

  const reportRangeFormatted = `${formatSlashDate(reportStartDate)} ${reportStartTime} 至 ${formatSlashDate(reportEndDate)} ${reportEndTime}`;
  const reportRangeShort = `${formatShortDate(reportStartDate)} ${reportStartTime} 至 ${formatShortDate(reportEndDate)} ${reportEndTime}`;

  return {
    valid: true,
    destination,
    transport,
    oneWayHours,
    spanDays,
    isFullDayDuty,
    isActualClaim,
    baseAllowedDays,
    allowedDays,
    extraBudgetDays,
    reportStartDate,
    reportStartTime,
    reportEndDate,
    reportEndTime,
    reportRangeFormatted,
    reportRangeShort,
    totalCompLeaveHours,
    holidayCompLeaveHours,
    weekdayAfterHoursCompHours,
    modeDescription,
    v121AppliedRules,
    dailySchedule,
  };
}

function buildErrorResult(
  destination: ReturnType<typeof getDestinationById>,
  transport: TripInput['transport'],
  oneWayHours: number,
  errorMessage: string
): CalculationResult {
  return {
    valid: false,
    errorMessage,
    destination,
    transport,
    oneWayHours,
    spanDays: 0,
    isFullDayDuty: false,
    isActualClaim: false,
    baseAllowedDays: 0,
    allowedDays: 0,
    extraBudgetDays: 0,
    reportStartDate: '',
    reportStartTime: '',
    reportEndDate: '',
    reportEndTime: '',
    reportRangeFormatted: '--',
    reportRangeShort: '--',
    totalCompLeaveHours: 0,
    holidayCompLeaveHours: 0,
    weekdayAfterHoursCompHours: 0,
    modeDescription: '',
    v121AppliedRules: [],
    dailySchedule: [],
  };
}

export function generateReimbursementTextReport(
  result: CalculationResult,
  input: TripInput,
  fareSegments: FareSegment[],
  originLabel: string,
  destLabel: string
): string {
  const oneWayFare = fareSegments.reduce((sum, s) => sum + s.price, 0);
  const roundTripFare = oneWayFare * 2;

  const lines: string[] = [
    '【臺東縣政府員工出差差勤與核銷明細表（V121 規範）】',
    '------------------------------------------------------------',
    `出差地點：${result.destination.name}`,
    `交通工具：${TRANSPORT_LABELS[result.transport]}（單趟預估車程 ${result.oneWayHours} 小時）`,
    `實際公務期間：${formatSlashDate(input.startDate)} ${input.startTime} 至 ${formatSlashDate(input.endDate)} ${input.endTime}（計 ${result.spanDays} 日）`,
    '',
    '一、線上差勤系統應申報項目',
    `・公差起訖時間：${result.reportRangeFormatted}`,
    `・核給公差天數：${result.allowedDays.toFixed(1)} 天（${result.modeDescription}）`,
    `・可申報路程補休：${result.totalCompLeaveHours} 小時` +
      (result.totalCompLeaveHours > 0
        ? `（假日補休 ${result.holidayCompLeaveHours}h ／ 平日非辦公時間 ${result.weekdayAfterHoursCompHours}h）`
        : '（無須另行申請補休）'),
    '',
    '二、逐日行程與辦公日曆對照',
  ];

  for (const day of result.dailySchedule) {
    const holTag = day.isHoliday ? `【${day.calendarLabel}】` : `（${day.calendarLabel}）`;
    const compTag = day.compLeaveHours > 0 ? `｜補休 ${day.compLeaveHours} 小時` : '';
    lines.push(
      `・${formatSlashDate(day.date)}（${day.weekdayLabel}）${holTag}｜${day.roleLabel} ${day.leaveWindow}${compTag}`
    );
    lines.push(`  說明：${day.guidanceText}`);
  }

  if (fareSegments.length > 0) {
    lines.push('');
    lines.push(`三、分段交通費試算（${originLabel} ➔ ${destLabel}）`);
    for (const seg of fareSegments) {
      lines.push(
        `・${seg.from} ➔ ${seg.to}（${seg.modeLabel}）：NT$ ${seg.price.toLocaleString()}［${seg.confirmed ? '已確認' : '未確認'}］`
      );
    }
    lines.push(`・單趟交通費小計：NT$ ${oneWayFare.toLocaleString()}`);
    lines.push(`・來回交通費合計：NT$ ${roundTripFare.toLocaleString()}`);
  }

  lines.push('------------------------------------------------------------');
  lines.push('註：依據《臺東縣政府員工出差天數核給標準表》及注意事項六、八試算，實際核銷請以票根及機關差勤審核為準。');
  return lines.join('\n');
}
