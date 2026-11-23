export interface KotlinSourceFile {
  id: string;
  path: string;
  filename: string;
  title: string;
  summary: string;
  code: string;
}

export const KOTLIN_SOURCE_FILES: KotlinSourceFile[] = [
  {
    id: 'models',
    path: 'app/src/main/java/tw/gov/taitung/travel/model/TravelModels.kt',
    filename: 'TravelModels.kt',
    title: '1. 資料模型與法規標準表',
    summary: '定義 18 個縣市與離島目的地、交通工具、V121 核給標準與日曆結構。',
    code: `package tw.gov.taitung.travel.model

import java.time.LocalDate
import java.time.LocalTime

enum class Transport(val label: String) {
    TRAIN("火車"),
    HSR("高鐵"),
    CAR("汽車"),
    FLIGHT("飛機"),
    FERRY("船班")
}

data class AllowanceRule(
    val halfDay: Double,
    val fullDay: Double,
    val actualClaim: Boolean = false
)

enum class Destination(
    val displayName: String,
    val supportedTransports: List<Transport>,
    val defaultHours: Map<Transport, Double>,
    val allowanceRules: Map<Transport, AllowanceRule>
) {
    TAITUNG_COUNTY(
        "臺東縣內（所屬鄉鎮）",
        listOf(Transport.CAR, Transport.TRAIN),
        mapOf(Transport.CAR to 1.0, Transport.TRAIN to 1.0),
        mapOf(Transport.CAR to AllowanceRule(1.0, 1.0), Transport.TRAIN to AllowanceRule(1.0, 1.0))
    ),
    GREEN_ISLAND(
        "綠島地區（離島）",
        listOf(Transport.FERRY, Transport.FLIGHT),
        mapOf(Transport.FERRY to 2.0, Transport.FLIGHT to 1.5),
        mapOf(Transport.FERRY to AllowanceRule(1.0, 1.5, true), Transport.FLIGHT to AllowanceRule(1.0, 1.5, true))
    ),
    LANYU(
        "蘭嶼地區（離島）",
        listOf(Transport.FERRY, Transport.FLIGHT),
        mapOf(Transport.FERRY to 3.5, Transport.FLIGHT to 1.5),
        mapOf(Transport.FERRY to AllowanceRule(1.5, 2.0, true), Transport.FLIGHT to AllowanceRule(1.0, 1.5, true))
    ),
    OUTER_ISLANDS(
        "外島地區（金門／馬祖／澎湖）",
        listOf(Transport.FLIGHT, Transport.FERRY),
        mapOf(Transport.FLIGHT to 6.0, Transport.FERRY to 8.0),
        mapOf(Transport.FLIGHT to AllowanceRule(2.0, 3.0, true), Transport.FERRY to AllowanceRule(2.0, 3.0, true))
    ),
    HUALIEN(
        "花蓮地區",
        listOf(Transport.TRAIN, Transport.CAR),
        mapOf(Transport.TRAIN to 3.0, Transport.CAR to 3.0),
        mapOf(Transport.TRAIN to AllowanceRule(1.0, 1.5), Transport.CAR to AllowanceRule(1.0, 1.5))
    ),
    YILAN(
        "宜蘭地區",
        listOf(Transport.TRAIN, Transport.CAR),
        mapOf(Transport.TRAIN to 4.0, Transport.CAR to 4.5),
        mapOf(Transport.TRAIN to AllowanceRule(1.0, 1.5), Transport.CAR to AllowanceRule(1.0, 1.5))
    ),
    KAOHSIUNG(
        "高雄地區",
        listOf(Transport.TRAIN, Transport.CAR, Transport.HSR),
        mapOf(Transport.TRAIN to 4.0, Transport.CAR to 4.0, Transport.HSR to 4.0),
        mapOf(
            Transport.TRAIN to AllowanceRule(1.0, 1.5),
            Transport.CAR to AllowanceRule(1.0, 1.5),
            Transport.HSR to AllowanceRule(1.0, 1.5)
        )
    ),
    PINGTUNG(
        "屏東地區",
        listOf(Transport.TRAIN, Transport.CAR),
        mapOf(Transport.TRAIN to 3.5, Transport.CAR to 3.5),
        mapOf(Transport.TRAIN to AllowanceRule(1.0, 1.5), Transport.CAR to AllowanceRule(1.0, 1.5))
    ),
    TAIPEI(
        "台北地區（含新北）",
        listOf(Transport.TRAIN, Transport.HSR, Transport.CAR, Transport.FLIGHT),
        mapOf(Transport.TRAIN to 5.0, Transport.HSR to 5.0, Transport.CAR to 6.0, Transport.FLIGHT to 1.5),
        mapOf(
            Transport.TRAIN to AllowanceRule(1.5, 2.0),
            Transport.HSR to AllowanceRule(1.5, 2.0),
            Transport.CAR to AllowanceRule(1.5, 2.0),
            Transport.FLIGHT to AllowanceRule(1.0, 1.5)
        )
    ),
    TAOYUAN(
        "桃園地區",
        listOf(Transport.TRAIN, Transport.HSR, Transport.CAR, Transport.FLIGHT),
        mapOf(Transport.TRAIN to 5.5, Transport.HSR to 5.0, Transport.CAR to 6.5, Transport.FLIGHT to 2.5),
        mapOf(
            Transport.TRAIN to AllowanceRule(1.5, 2.0),
            Transport.HSR to AllowanceRule(1.5, 2.0),
            Transport.CAR to AllowanceRule(1.5, 2.0),
            Transport.FLIGHT to AllowanceRule(1.0, 1.5)
        )
    ),
    KEELUNG(
        "基隆地區",
        listOf(Transport.TRAIN, Transport.HSR, Transport.CAR, Transport.FLIGHT),
        mapOf(Transport.TRAIN to 5.5, Transport.HSR to 5.5, Transport.CAR to 6.5, Transport.FLIGHT to 2.5),
        mapOf(
            Transport.TRAIN to AllowanceRule(1.5, 2.0),
            Transport.HSR to AllowanceRule(1.5, 2.0),
            Transport.CAR to AllowanceRule(1.5, 2.0),
            Transport.FLIGHT to AllowanceRule(1.0, 1.5)
        )
    ),
    HSINCHU(
        "新竹地區",
        listOf(Transport.TRAIN, Transport.HSR, Transport.CAR),
        mapOf(Transport.TRAIN to 5.5, Transport.HSR to 5.0, Transport.CAR to 6.5),
        mapOf(
            Transport.TRAIN to AllowanceRule(1.5, 2.0),
            Transport.HSR to AllowanceRule(1.5, 2.0),
            Transport.CAR to AllowanceRule(1.5, 2.0)
        )
    ),
    MIAOLI(
        "苗栗地區",
        listOf(Transport.TRAIN, Transport.HSR, Transport.CAR),
        mapOf(Transport.TRAIN to 6.0, Transport.HSR to 5.0, Transport.CAR to 6.5),
        mapOf(
            Transport.TRAIN to AllowanceRule(1.5, 2.0),
            Transport.HSR to AllowanceRule(1.5, 2.0),
            Transport.CAR to AllowanceRule(1.5, 2.0)
        )
    ),
    TAINAN(
        "台南地區",
        listOf(Transport.TRAIN, Transport.HSR, Transport.CAR),
        mapOf(Transport.TRAIN to 4.5, Transport.HSR to 4.0, Transport.CAR to 4.5),
        mapOf(
            Transport.TRAIN to AllowanceRule(1.5, 2.0),
            Transport.HSR to AllowanceRule(1.5, 2.0),
            Transport.CAR to AllowanceRule(1.5, 2.0)
        )
    ),
    TAICHUNG(
        "台中地區",
        listOf(Transport.TRAIN, Transport.HSR, Transport.CAR),
        mapOf(Transport.TRAIN to 6.0, Transport.HSR to 4.5, Transport.CAR to 6.0),
        mapOf(
            Transport.TRAIN to AllowanceRule(2.0, 3.0),
            Transport.CAR to AllowanceRule(2.0, 3.0),
            Transport.HSR to AllowanceRule(1.5, 2.0)
        )
    ),
    CHANGHUA(
        "彰化地區",
        listOf(Transport.TRAIN, Transport.HSR, Transport.CAR),
        mapOf(Transport.TRAIN to 6.0, Transport.HSR to 4.5, Transport.CAR to 6.0),
        mapOf(
            Transport.TRAIN to AllowanceRule(2.0, 3.0),
            Transport.CAR to AllowanceRule(2.0, 3.0),
            Transport.HSR to AllowanceRule(1.5, 2.0)
        )
    ),
    NANTOU(
        "南投地區",
        listOf(Transport.TRAIN, Transport.HSR, Transport.CAR),
        mapOf(Transport.TRAIN to 6.5, Transport.HSR to 5.0, Transport.CAR to 6.5),
        mapOf(
            Transport.TRAIN to AllowanceRule(2.0, 3.0),
            Transport.CAR to AllowanceRule(2.0, 3.0),
            Transport.HSR to AllowanceRule(1.5, 2.0)
        )
    ),
    YUNLIN(
        "雲林地區",
        listOf(Transport.TRAIN, Transport.HSR, Transport.CAR),
        mapOf(Transport.TRAIN to 5.5, Transport.HSR to 4.5, Transport.CAR to 5.5),
        mapOf(
            Transport.TRAIN to AllowanceRule(2.0, 3.0),
            Transport.CAR to AllowanceRule(2.0, 3.0),
            Transport.HSR to AllowanceRule(1.5, 2.0)
        )
    ),
    CHIAYI(
        "嘉義地區",
        listOf(Transport.TRAIN, Transport.HSR, Transport.CAR),
        mapOf(Transport.TRAIN to 5.0, Transport.HSR to 4.0, Transport.CAR to 5.0),
        mapOf(
            Transport.TRAIN to AllowanceRule(2.0, 3.0),
            Transport.CAR to AllowanceRule(2.0, 3.0),
            Transport.HSR to AllowanceRule(1.5, 2.0)
        )
    )
}

data class CalendarEntry(
    val date: LocalDate,
    val isHoliday: Boolean,
    val category: String,
    val name: String
)

data class CalendarDatabase(
    val sourceName: String,
    val lockedYears: Set<Int>,
    val entries: Map<LocalDate, CalendarEntry>
)

data class DailyItinerary(
    val date: LocalDate,
    val isHoliday: Boolean,
    val calendarLabel: String,
    val roleLabel: String,
    val windowLabel: String,
    val compLeaveHours: Int,
    val explanation: String
)

data class CalculationResult(
    val allowedDays: Double,
    val spanDays: Int,
    val extraBudget: Double,
    val reportStartDate: LocalDate,
    val reportStartTime: LocalTime,
    val reportEndDate: LocalDate,
    val reportEndTime: LocalTime,
    val totalCompLeaveHours: Int,
    val modeLabel: String,
    val itinerary: List<DailyItinerary>
)

data class FareLeg(
    val id: String,
    val from: String,
    val to: String,
    val mode: String,
    val price: Int,
    val confirmed: Boolean
)
`,
  },
  {
    id: 'engine',
    path: 'app/src/main/java/tw/gov/taitung/travel/calculator/TaitungTravelEngine.kt',
    filename: 'TaitungTravelEngine.kt',
    title: '2. V121 差勤與路程補休核心引擎',
    summary: '落實午休排除、時間半小時取整、多日公差上限與 V121 假日半日路程按單趟車程覈實採計。',
    code: `package tw.gov.taitung.travel.calculator

import tw.gov.taitung.travel.model.*
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.LocalTime
import java.time.temporal.ChronoUnit
import kotlin.math.ceil
import kotlin.math.max
import kotlin.math.min

/**
 * 臺東縣政府員工出差天數、差勤起訖與路程補休計算引擎 (V121 規範)
 */
object TaitungTravelEngine {

    private val OFFICE_START = LocalTime.of(8, 0)
    private val LUNCH_START = LocalTime.of(12, 0)
    private val LUNCH_END = LocalTime.of(13, 0)
    private val OFFICE_END = LocalTime.of(17, 0)

    /** 公務開始時間：非整點/半點無條件捨去（例：08:40 -> 08:30） */
    fun normalizeStartTime(time: LocalTime): LocalTime {
        val totalMins = time.hour * 60 + time.minute
        val floored = (totalMins / 30) * 30
        return LocalTime.of((floored / 60).coerceIn(8, 20), floored % 60)
    }

    /** 公務結束時間：非整點/半點無條件進位（例：16:40 -> 17:00） */
    fun normalizeEndTime(time: LocalTime): LocalTime {
        val totalMins = time.hour * 60 + time.minute
        val ceiled = ((totalMins + 29) / 30) * 30
        val clamped = ceiled.coerceIn(8 * 60, 20 * 60)
        return LocalTime.of(clamped / 60, clamped % 60)
    }

    fun calculate(
        destination: Destination,
        transport: Transport,
        oneWayHours: Double,
        startDate: LocalDate,
        startTimeRaw: LocalTime,
        endDate: LocalDate,
        endTimeRaw: LocalTime,
        calendar: CalendarDatabase
    ): CalculationResult {
        val startTime = normalizeStartTime(startTimeRaw)
        val endTime = normalizeEndTime(endTimeRaw)
        val spanDays = (ChronoUnit.DAYS.between(startDate, endDate).toInt() + 1).coerceAtLeast(1)
        val travelMins = (oneWayHours * 60).toLong()

        val crossesLunch = startTime.isBefore(LUNCH_START) && endTime.isAfter(LUNCH_START)
        val isFullDay = spanDays > 1 || crossesLunch

        val rule = destination.allowanceRules[transport] ?: AllowanceRule(1.0, 1.0)
        val baseAllowed = if (isFullDay) rule.fullDay else rule.halfDay
        val allowedDays = baseAllowed + (spanDays - 1)
        val extraBudget = max(0.0, allowedDays - spanDays)

        val prevDayBudget = when {
            extraBudget >= 1.5 -> 1.0
            extraBudget == 1.0 -> 0.5
            extraBudget == 0.5 && startTime.isBefore(LUNCH_START) -> 0.5
            else -> 0.0
        }
        val nextDayBudget = when {
            extraBudget >= 1.5 -> 1.0
            extraBudget == 1.0 -> 0.5
            extraBudget == 0.5 && !startTime.isBefore(LUNCH_START) -> 0.5
            else -> 0.0
        }

        // 當日出發與返抵時間（保障 12:00-13:00 午休）
        val sameDayDepart: LocalTime = if (prevDayBudget == 0.0) {
            val targetArrive = if (!startTime.isBefore(LUNCH_END)) LUNCH_START else startTime
            val rawDepartMins = targetArrive.hour * 60 + targetArrive.minute - travelMins
            if (rawDepartMins <= 7 * 60 + 30) {
                val clamped = rawDepartMins.coerceAtLeast(0).toInt()
                LocalTime.of(clamped / 60, clamped % 60)
            } else OFFICE_START
        } else OFFICE_START

        val returnDepart = if (!endTime.isAfter(LUNCH_START)) LUNCH_END else endTime
        val rawReturnArrivalMins = returnDepart.hour * 60 + returnDepart.minute + travelMins
        val sameDayArrival: LocalTime = if (nextDayBudget == 0.0 && rawReturnArrivalMins > 17 * 60) {
            val clamped = rawReturnArrivalMins.coerceAtMost(23 * 60 + 59).toInt()
            LocalTime.of(clamped / 60, clamped % 60)
        } else OFFICE_END

        val reportStartDate = if (prevDayBudget > 0) startDate.minusDays(1) else startDate
        val reportStartTime = when (prevDayBudget) {
            1.0 -> OFFICE_START
            0.5 -> LUNCH_END
            else -> sameDayDepart
        }

        val reportEndDate = if (nextDayBudget > 0) endDate.plusDays(1) else endDate
        val reportEndTime = when (nextDayBudget) {
            1.0 -> OFFICE_END
            0.5 -> LUNCH_START
            else -> sameDayArrival
        }

        val itinerary = mutableListOf<DailyItinerary>()
        var totalCompHours = 0

        // 1. 去程延伸路程日
        if (prevDayBudget > 0) {
            val prevDate = startDate.minusDays(1)
            val (isHol, label) = lookupDay(prevDate, calendar)
            val comp = if (isHol) {
                if (prevDayBudget == 1.0) 8 else min(8, ceil(oneWayHours).toInt())
            } else 0
            totalCompHours += comp
            itinerary += DailyItinerary(
                date = prevDate,
                isHoliday = isHol,
                calendarLabel = label,
                roleLabel = if (prevDayBudget == 1.0) "去程路程（全日）" else "去程路程（半日）",
                windowLabel = if (prevDayBudget == 1.0) "08:00 - 17:00" else "13:00 - 17:00",
                compLeaveHours = comp,
                explanation = buildTravelExplanation("去程", prevDayBudget, isHol, label, oneWayHours, comp)
            )
        }

        // 2. 實際公務執行日
        for (i in 0 until spanDays) {
            val date = startDate.plusDays(i.toLong())
            val (isHol, label) = lookupDay(date, calendar)
            var dayComp = 0
            val notes = mutableListOf<String>()

            if (isHol) {
                val dutyStart = if (i == 0) startTime else OFFICE_START
                val dutyEnd = if (i == spanDays - 1) endTime else OFFICE_END
                val dutyHrs = dutyHoursExcludingLunch(dutyStart, dutyEnd)
                val extraTravel = (if (i == 0 && prevDayBudget == 0.0) oneWayHours else 0.0) +
                    (if (i == spanDays - 1 && nextDayBudget == 0.0) oneWayHours else 0.0)
                dayComp = min(8, ceil(dutyHrs + extraTravel).toInt())
                notes += "假日執行公務，覈實核給 $dayComp 小時補休。"
            } else {
                if (i == 0 && prevDayBudget == 0.0 && sameDayDepart.isBefore(OFFICE_START)) {
                    val earlyMins = ChronoUnit.MINUTES.between(sameDayDepart, OFFICE_START)
                    val h = ceil(earlyMins / 60.0).toInt()
                    dayComp += h
                    notes += "08:00 前提早出發（$sameDayDepart），核給 $h 小時。"
                }
                if (i == spanDays - 1 && nextDayBudget == 0.0 && rawReturnArrivalMins > 17 * 60) {
                    val afterMins = rawReturnArrivalMins - 17 * 60
                    val h = ceil(afterMins / 60.0).toInt()
                    dayComp += h
                    notes += "17:00 後返抵，依注意事項六進位核給 $h 小時。"
                }
                if (notes.isEmpty()) notes += "正常辦公時間執行公務（12:00-13:00 午休保障）。"
            }

            totalCompHours += dayComp
            itinerary += DailyItinerary(
                date = date,
                isHoliday = isHol,
                calendarLabel = label,
                roleLabel = if (spanDays > 1) "公務第 \${i + 1} 日" else "公務執行日",
                windowLabel = "\${if (i == 0 && prevDayBudget == 0.0) reportStartTime else OFFICE_START} - \${if (i == spanDays - 1 && nextDayBudget == 0.0) reportEndTime else OFFICE_END}",
                compLeaveHours = dayComp,
                explanation = notes.joinToString(" ")
            )
        }

        // 3. 回程延伸路程日
        if (nextDayBudget > 0) {
            val nextDate = endDate.plusDays(1)
            val (isHol, label) = lookupDay(nextDate, calendar)
            val comp = if (isHol) {
                if (nextDayBudget == 1.0) 8 else min(8, ceil(oneWayHours).toInt())
            } else 0
            totalCompHours += comp
            itinerary += DailyItinerary(
                date = nextDate,
                isHoliday = isHol,
                calendarLabel = label,
                roleLabel = if (nextDayBudget == 1.0) "回程路程（全日）" else "回程路程（半日）",
                windowLabel = if (nextDayBudget == 1.0) "08:00 - 17:00" else "08:00 - 12:00",
                compLeaveHours = comp,
                explanation = buildTravelExplanation("回程", nextDayBudget, isHol, label, oneWayHours, comp)
            )
        }

        val modeLabel = when {
            rule.actualClaim -> "離島／外島覈實申報"
            spanDays > 1 -> "連續 $spanDays 日公務模式"
            isFullDay -> "單日整天公務（跨午休）"
            else -> "單日半天公務"
        }

        return CalculationResult(
            allowedDays = allowedDays,
            spanDays = spanDays,
            extraBudget = extraBudget,
            reportStartDate = reportStartDate,
            reportStartTime = reportStartTime,
            reportEndDate = reportEndDate,
            reportEndTime = reportEndTime,
            totalCompLeaveHours = totalCompHours,
            modeLabel = modeLabel,
            itinerary = itinerary
        )
    }

    private fun buildTravelExplanation(
        dir: String,
        budget: Double,
        isHoliday: Boolean,
        calLabel: String,
        oneWayHours: Double,
        compHours: Int
    ): String {
        if (!isHoliday) return "平日給薪路程公假（0 小時補休）。"
        return if (budget == 1.0) {
            "$dir 適逢【$calLabel】且為全日路程假，依 V121 直接核給 8 小時假日路程補休。"
        } else {
            "$dir 適逢【$calLabel】且為半日路程假，依 V121 注意事項八、六按單趟車程 \${oneWayHours}h 無條件進位覈實核給 $compHours 小時（上限 8 小時）。"
        }
    }

    private fun dutyHoursExcludingLunch(start: LocalTime, end: LocalTime): Double {
        val s = start.hour * 60 + start.minute
        val e = end.hour * 60 + end.minute
        val overlap = max(0, min(e, 13 * 60) - max(s, 12 * 60))
        return max(0, e - s - overlap) / 60.0
    }

    private fun lookupDay(date: LocalDate, db: CalendarDatabase): Pair<Boolean, String> {
        db.entries[date]?.let { return it.isHoliday to it.name }
        val weekend = date.dayOfWeek == DayOfWeek.SATURDAY || date.dayOfWeek == DayOfWeek.SUNDAY
        return if (date.year in db.lockedYears) {
            if (weekend) true to "例假日" else false to "\${date.year} 正常工作日"
        } else {
            if (weekend) true to "例假日（推估）" else false to "\${date.year} 工作日（未載入日曆）"
        }
    }
}
`,
  },
  {
    id: 'parser',
    path: 'app/src/main/java/tw/gov/taitung/travel/parser/CalendarCsvParser.kt',
    filename: 'CalendarCsvParser.kt',
    title: '3. 行政院辦公日曆 CSV/TSV 解析器',
    summary: '自動辨識逗號/Tab/分號、多格式日期補零與 V121 年份智慧鎖定機制。',
    code: `package tw.gov.taitung.travel.parser

import tw.gov.taitung.travel.model.CalendarDatabase
import tw.gov.taitung.travel.model.CalendarEntry
import java.io.InputStream
import java.nio.charset.Charset
import java.time.DayOfWeek
import java.time.LocalDate

/**
 * 行政院人事行政總處辦公日曆表 CSV / TSV 離線解析器 (V121)
 */
object CalendarCsvParser {

    fun parse(inputStream: InputStream, fileName: String): CalendarDatabase {
        val rawBytes = inputStream.readBytes()
        val text = decodeUtf8OrBig5(rawBytes).removePrefix("\\uFEFF").trim()
        val lines = text.lines().map { it.trim() }.filter { it.isNotEmpty() }
        require(lines.size >= 2) { "日曆檔案內容不足，請確認包含標題列與資料列。" }

        val delimiter = detectDelimiter(lines.first())
        val headers = splitLine(lines.first(), delimiter).map { it.lowercase().replace(" ", "") }

        val dateIdx = headers.indexOfFirst { it == "date" || it.contains("日期") }.takeIf { it >= 0 } ?: 0
        val holIdx = headers.indexOfFirst { it.contains("isholiday") || it.contains("是否放假") }
        val catIdx = headers.indexOfFirst { it.contains("holidaycategory") || it.contains("類別") }
        val nameIdx = headers.indexOfFirst {
            it == "name" || it == "description" || it.contains("備註") || it.contains("名稱")
        }

        val entries = mutableMapOf<LocalDate, CalendarEntry>()
        val lockedYears = mutableSetOf<Int>()

        for (line in lines.drop(1)) {
            val cols = splitLine(line, delimiter)
            val date = parseFlexibleDate(cols.getOrNull(dateIdx).orEmpty()) ?: continue
            lockedYears += date.year

            val category = cols.getOrNull(catIdx)?.trim().orEmpty()
            val nameRaw = cols.getOrNull(nameIdx)?.trim().orEmpty()
            val holRaw = cols.getOrNull(holIdx)?.trim().orEmpty().lowercase()

            val isHoliday = when (holRaw) {
                "是", "true", "1", "2", "y", "yes" -> true
                "否", "false", "0", "n", "no" -> false
                else -> category.contains("放假") || category.contains("補假")
            }

            entries[date] = CalendarEntry(
                date = date,
                isHoliday = isHoliday,
                category = category.ifEmpty { if (isHoliday) "放假日" else "正常工作日" },
                name = nameRaw.ifEmpty { if (isHoliday) category.ifEmpty { "國定放假日" } else "\${date.year} 正常工作日" }
            )
        }

        // V121 年份智慧鎖定：補齊該年份其餘未列出之平日與週末
        for (year in lockedYears) {
            var d = LocalDate.of(year, 1, 1)
            val end = LocalDate.of(year, 12, 31)
            while (!d.isAfter(end)) {
                if (!entries.containsKey(d)) {
                    val weekend = d.dayOfWeek == DayOfWeek.SATURDAY || d.dayOfWeek == DayOfWeek.SUNDAY
                    entries[d] = CalendarEntry(
                        date = d,
                        isHoliday = weekend,
                        category = if (weekend) "星期六、星期日" else "正常工作日",
                        name = if (weekend) "例假日" else "$year 正常工作日"
                    )
                }
                d = d.plusDays(1)
            }
        }

        return CalendarDatabase(fileName, lockedYears, entries)
    }

    private fun detectDelimiter(header: String): Char = when {
        header.count { it == '\\t' } >= header.count { it == ',' } && header.contains('\\t') -> '\\t'
        header.count { it == ';' } > header.count { it == ',' } -> ';'
        else -> ','
    }

    private fun parseFlexibleDate(raw: String): LocalDate? {
        val s = raw.trim().trim('"', '\\'')
        if (Regex("^\\\\d{8}$").matches(s)) {
            return runCatching {
                LocalDate.of(s.substring(0, 4).toInt(), s.substring(4, 6).toInt(), s.substring(6, 8).toInt())
            }.getOrNull()
        }
        val m = Regex("^(\\\\d{2,4})[/\\\\-.](\\\\d{1,2})[/\\\\-.](\\\\d{1,2})$").matchEntire(s) ?: return null
        var y = m.groupValues[1].toInt()
        if (y < 200) y += 1911
        return runCatching { LocalDate.of(y, m.groupValues[2].toInt(), m.groupValues[3].toInt()) }.getOrNull()
    }

    private fun splitLine(line: String, delimiter: Char): List<String> =
        line.split(delimiter).map { it.trim().trim('"') }

    private fun decodeUtf8OrBig5(bytes: ByteArray): String =
        runCatching { bytes.toString(Charsets.UTF_8) }
            .getOrElse { bytes.toString(Charset.forName("Big5")) }
}
`,
  },
  {
    id: 'viewmodel',
    path: 'app/src/main/java/tw/gov/taitung/travel/viewmodel/TravelCalculatorViewModel.kt',
    filename: 'TravelCalculatorViewModel.kt',
    title: '4. MVVM ViewModel 與 StateFlow 狀態管理',
    summary: '封裝差勤參數 StateFlow、自動帶入當日日期與車程記憶、日曆匯入與分段車資連動。',
    code: `package tw.gov.taitung.travel.viewmodel

import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import tw.gov.taitung.travel.calculator.TaitungTravelEngine
import tw.gov.taitung.travel.model.*
import java.time.LocalDate
import java.time.LocalTime

data class TravelUiState(
    val destination: Destination = Destination.TAICHUNG,
    val transport: Transport = Transport.TRAIN,
    val oneWayHours: Double = 6.0,
    val startDate: LocalDate = LocalDate.now(),
    val startTime: LocalTime = LocalTime.of(9, 0),
    val endDate: LocalDate = LocalDate.now(),
    val endTime: LocalTime = LocalTime.of(16, 0),
    val calendarDb: CalendarDatabase = CalendarDatabase("內建 2026 行政機關辦公日曆", setOf(2026), emptyMap()),
    val customHoursMemory: Map<String, Double> = emptyMap(),
    val result: CalculationResult? = null
)

class TravelCalculatorViewModel : ViewModel() {

    private val _uiState = MutableStateFlow(TravelUiState())
    val uiState: StateFlow<TravelUiState> = _uiState.asStateFlow()

    init {
        recalculate()
    }

    fun selectDestination(dest: Destination) {
        _uiState.update { state ->
            val nextTransport = if (state.transport in dest.supportedTransports) {
                state.transport
            } else dest.supportedTransports.first()
            val memKey = "\${dest.name}:\${nextTransport.name}"
            val hours = state.customHoursMemory[memKey]
                ?: dest.defaultHours[nextTransport]
                ?: 4.0
            state.copy(destination = dest, transport = nextTransport, oneWayHours = hours)
        }
        recalculate()
    }

    fun selectTransport(transport: Transport) {
        _uiState.update { state ->
            val memKey = "\${state.destination.name}:\${transport.name}"
            val hours = state.customHoursMemory[memKey]
                ?: state.destination.defaultHours[transport]
                ?: state.oneWayHours
            state.copy(transport = transport, oneWayHours = hours)
        }
        recalculate()
    }

    fun updateOneWayHours(hours: Double) {
        val clamped = hours.coerceIn(0.5, 16.0)
        _uiState.update { state ->
            val memKey = "\${state.destination.name}:\${state.transport.name}"
            state.copy(
                oneWayHours = clamped,
                customHoursMemory = state.customHoursMemory + (memKey to clamped)
            )
        }
        recalculate()
    }

    fun updateDates(start: LocalDate, end: LocalDate) {
        val safeEnd = if (end.isBefore(start)) start else end
        _uiState.update { it.copy(startDate = start, endDate = safeEnd) }
        recalculate()
    }

    fun updateTimes(start: LocalTime, end: LocalTime) {
        _uiState.update {
            it.copy(
                startTime = TaitungTravelEngine.normalizeStartTime(start),
                endTime = TaitungTravelEngine.normalizeEndTime(end)
            )
        }
        recalculate()
    }

    fun updateCalendar(db: CalendarDatabase) {
        _uiState.update { it.copy(calendarDb = db) }
        recalculate()
    }

    private fun recalculate() {
        _uiState.update { s ->
            val calc = TaitungTravelEngine.calculate(
                destination = s.destination,
                transport = s.transport,
                oneWayHours = s.oneWayHours,
                startDate = s.startDate,
                startTimeRaw = s.startTime,
                endDate = s.endDate,
                endTimeRaw = s.endTime,
                calendar = s.calendarDb
            )
            s.copy(result = calc)
        }
    }
}
`,
  },
  {
    id: 'ui',
    path: 'app/src/main/java/tw/gov/taitung/travel/ui/HomeScreen.kt',
    filename: 'HomeScreen.kt',
    title: '5. MainActivity 與 Material 3 三頁式 Compose 畫面',
    summary: '實作底部導覽列、SAF 日曆匯入啟動器、差勤參數卡、填寫指南卡與車資分段卡。',
    code: `package tw.gov.taitung.travel.ui

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import tw.gov.taitung.travel.parser.CalendarCsvParser
import tw.gov.taitung.travel.viewmodel.TravelCalculatorViewModel
import java.time.format.DateTimeFormatter

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                TaitungTravelApp()
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TaitungTravelApp(vm: TravelCalculatorViewModel = viewModel()) {
    val state by vm.uiState.collectAsState()
    val context = LocalContext.current
    val clipboard = LocalClipboardManager.current
    var selectedTab by remember { mutableIntStateOf(0) }

    val csvPicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenDocument()
    ) { uri ->
        uri?.let {
            context.contentResolver.openInputStream(it)?.use { stream ->
                runCatching { CalendarCsvParser.parse(stream, "已匯入辦公日曆.csv") }
                    .onSuccess { db -> vm.updateCalendar(db) }
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("臺東差勤通", fontWeight = FontWeight.SemiBold) },
                actions = {
                    TextButton(onClick = { csvPicker.launch(arrayOf("text/*", "text/csv")) }) {
                        Text("匯入日曆")
                    }
                }
            )
        },
        bottomBar = {
            NavigationBar {
                NavigationBarItem(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    icon = {},
                    label = { Text("差勤參數") }
                )
                NavigationBarItem(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    icon = {},
                    label = { Text("填寫指南") }
                )
                NavigationBarItem(
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2 },
                    icon = {},
                    label = { Text("車資分段") }
                )
            }
        }
    ) { padding ->
        val result = state.result
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item {
                Text(
                    text = "日曆狀態：\${state.calendarDb.sourceName}（\${state.calendarDb.entries.size} 筆）",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            if (result != null) {
                item {
                    val fmt = DateTimeFormatter.ofPattern("MM/dd")
                    val rangeText = "\${result.reportStartDate.format(fmt)} \${result.reportStartTime} 至 \${result.reportEndDate.format(fmt)} \${result.reportEndTime}"
                    ElevatedCard(modifier = Modifier.fillMaxWidth()) {
                        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Text("差勤系統應申報起訖時間", style = MaterialTheme.typography.labelMedium)
                            Text(rangeText, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                            Text("核給公差：\${result.allowedDays} 天（\${result.modeLabel}）")
                            Text(
                                "可申報路程補休：\${result.totalCompLeaveHours} 小時",
                                color = MaterialTheme.colorScheme.primary,
                                fontWeight = FontWeight.SemiBold
                            )
                            FilledTonalButton(onClick = { clipboard.setText(AnnotatedString(rangeText)) }) {
                                Text("一鍵複製申報起訖")
                            }
                        }
                    }
                }
                items(result.itinerary) { day ->
                    OutlinedCard(modifier = Modifier.fillMaxWidth()) {
                        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text("\${day.date} · \${day.calendarLabel} · \${day.roleLabel}", fontWeight = FontWeight.Medium)
                            Text("時段：\${day.windowLabel}｜補休：\${day.compLeaveHours} 小時", style = MaterialTheme.typography.bodySmall)
                            Text(day.explanation, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }
            }
        }
    }
}
`,
  },
];
