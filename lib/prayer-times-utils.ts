// Prayer times fetching and calculation utilities

export interface AladhanTimings {
  Fajr: string
  Sunrise: string
  Dhuhr: string
  Asr: string
  Sunset: string
  Maghrib: string
  Isha: string
  Imsak: string
  Midnight: string
  Firstthird: string
  Lastthird: string
}

export interface AladhanHijri {
  date: string
  day: string
  weekday: { en: string; ar: string }
  month: { number: number; en: string; ar: string }
  year: string
  designation: { abbreviated: string; expanded: string }
  holidays: string[]
}

export interface AladhanData {
  timings: AladhanTimings
  date: {
    readable: string
    timestamp: string
    gregorian: {
      date: string
      day: string
      weekday: { en: string }
      month: { number: number; en: string }
      year: string
    }
    hijri: AladhanHijri
  }
}

export interface PrayerTime {
  name: 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha'
  time: string
  mins: number // minutes from midnight
}

const PRAYER_NAMES = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const

/**
 * Fetch prayer times for Doha, Qatar from Aladhan API
 */
export async function fetchPrayerTimes(): Promise<AladhanData | null> {
  try {
    const response = await fetch('https://api.aladhan.com/v1/timingsByCity?city=Doha&country=Qatar&method=3')
    const json = await response.json()
    if (json.code === 200) {
      return json.data
    }
    return null
  } catch (error) {
    console.error('Failed to fetch prayer times:', error)
    return null
  }
}

/**
 * Convert "HH:MM" string (24-hour, may have trailing " (XYZ)") to minutes from midnight
 */
export function timeToMinutes(timeStr: string): number {
  const clean = timeStr.split(' ')[0]
  const [h, m] = clean.split(':').map(Number)
  return h * 60 + m
}

/**
 * Get list of prayers with their times and minutes from midnight
 */
export function getPrayerList(data: AladhanData | null): PrayerTime[] {
  if (!data) return []
  return PRAYER_NAMES.map(name => ({
    name,
    time: data.timings[name],
    mins: timeToMinutes(data.timings[name]),
  }))
}

/**
 * Get the next prayer based on current time
 * @param prayerList - Array of prayers with times
 * @param nowMins - Current time in minutes from midnight
 * @returns The next prayer, or Fajr if all have passed (next day)
 */
export function getNextPrayer(prayerList: PrayerTime[], nowMins: number): PrayerTime | null {
  if (!prayerList.length) return null
  return prayerList.find(p => p.mins > nowMins) ?? prayerList[0]
}

/**
 * Calculate remaining time until next prayer
 * @param nextPrayerMins - Next prayer time in minutes from midnight
 * @param nowMins - Current time in minutes from midnight
 * @param nowSecs - Current seconds within the minute
 * @returns Object with hours, minutes, seconds remaining
 */
export function getCountdownTime(
  nextPrayerMins: number,
  nowMins: number,
  nowSecs: number
): { hours: number; minutes: number; seconds: number; totalSeconds: number } {
  let totalSeconds: number

  if (nextPrayerMins > nowMins) {
    // Same day
    totalSeconds = (nextPrayerMins - nowMins) * 60 - nowSecs
  } else {
    // Next day (all prayers passed)
    totalSeconds = (24 * 60 - nowMins + nextPrayerMins) * 60 - nowSecs
  }

  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: Math.floor(totalSeconds % 60),
    totalSeconds,
  }
}

/**
 * Get start of week (Monday) for a given date
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

/**
 * Get end of week (Sunday) for a given date
 */
export function getWeekEnd(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? 0 : 7)
  return new Date(d.setDate(diff))
}

/**
 * Format date as YYYY-MM-DD
 */
export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Get all dates in a week (Monday to Sunday)
 */
export function getWeekDates(weekStart: Date): Date[] {
  const dates = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    dates.push(d)
  }
  return dates
}
