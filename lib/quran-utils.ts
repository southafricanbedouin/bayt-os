// Quran structure and calculation utilities

// Surah data: name, number of Ayas
export const QURAN_SURAHS = [
  { number: 1, name: 'Al-Fatiha', ayas: 7, pages: 1 },
  { number: 2, name: 'Al-Baqarah', ayas: 286, pages: 49 },
  { number: 3, name: 'Aal-E-Imran', ayas: 200, pages: 64 },
  { number: 4, name: 'An-Nisa', ayas: 176, pages: 77 },
  { number: 5, name: 'Al-Ma\'idah', ayas: 120, pages: 106 },
  { number: 6, name: 'Al-An\'am', ayas: 165, pages: 128 },
  { number: 7, name: 'Al-A\'raf', ayas: 206, pages: 149 },
  { number: 8, name: 'Al-Anfal', ayas: 75, pages: 177 },
  { number: 9, name: 'At-Taubah', ayas: 129, pages: 187 },
  { number: 10, name: 'Yunus', ayas: 109, pages: 208 },
  { number: 11, name: 'Hud', ayas: 123, pages: 221 },
  { number: 12, name: 'Yusuf', ayas: 111, pages: 235 },
  { number: 13, name: 'Ar-Ra\'d', ayas: 43, pages: 249 },
  { number: 14, name: 'Ibrahim', ayas: 52, pages: 255 },
  { number: 15, name: 'Al-Hijr', ayas: 99, pages: 262 },
  { number: 16, name: 'An-Nahl', ayas: 128, pages: 267 },
  { number: 17, name: 'Al-Isra', ayas: 111, pages: 282 },
  { number: 18, name: 'Al-Kahf', ayas: 110, pages: 293 },
  { number: 19, name: 'Maryam', ayas: 98, pages: 305 },
  { number: 20, name: 'Ta-Ha', ayas: 135, pages: 312 },
  { number: 21, name: 'Al-Anbiya', ayas: 112, pages: 331 },
  { number: 22, name: 'Al-Hajj', ayas: 78, pages: 342 },
  { number: 23, name: 'Al-Mu\'minun', ayas: 118, pages: 352 },
  { number: 24, name: 'An-Nur', ayas: 64, pages: 365 },
  { number: 25, name: 'Al-Furqan', ayas: 77, pages: 375 },
  { number: 26, name: 'Ash-Shu\'ara', ayas: 227, pages: 383 },
  { number: 27, name: 'An-Naml', ayas: 93, pages: 404 },
  { number: 28, name: 'Al-Qasas', ayas: 88, pages: 417 },
  { number: 29, name: 'Al-Ankabut', ayas: 69, pages: 427 },
  { number: 30, name: 'Ar-Rum', ayas: 60, pages: 435 },
  { number: 31, name: 'Luqman', ayas: 34, pages: 442 },
  { number: 32, name: 'As-Sajdah', ayas: 30, pages: 445 },
  { number: 33, name: 'Al-Ahzab', ayas: 73, pages: 448 },
  { number: 34, name: 'Saba', ayas: 54, pages: 461 },
  { number: 35, name: 'Fatir', ayas: 45, pages: 468 },
  { number: 36, name: 'Ya-Sin', ayas: 83, pages: 474 },
  { number: 37, name: 'As-Saffat', ayas: 182, pages: 483 },
  { number: 38, name: 'Sad', ayas: 88, pages: 495 },
  { number: 39, name: 'Az-Zumar', ayas: 75, pages: 504 },
  { number: 40, name: 'Al-Ghafir', ayas: 85, pages: 515 },
  { number: 41, name: 'Fussilat', ayas: 54, pages: 525 },
  { number: 42, name: 'Ash-Shura', ayas: 53, pages: 532 },
  { number: 43, name: 'Az-Zukhruf', ayas: 89, pages: 539 },
  { number: 44, name: 'Ad-Dukhan', ayas: 59, pages: 550 },
  { number: 45, name: 'Al-Jathiyah', ayas: 37, pages: 557 },
  { number: 46, name: 'Al-Ahqaf', ayas: 35, pages: 561 },
  { number: 47, name: 'Muhammad', ayas: 38, pages: 564 },
  { number: 48, name: 'Al-Fath', ayas: 29, pages: 567 },
  { number: 49, name: 'Al-Hujurat', ayas: 18, pages: 570 },
  { number: 50, name: 'Qaf', ayas: 45, pages: 572 },
  { number: 51, name: 'Ad-Dhariyat', ayas: 60, pages: 575 },
  { number: 52, name: 'At-Tur', ayas: 49, pages: 578 },
  { number: 53, name: 'An-Najm', ayas: 62, pages: 581 },
  { number: 54, name: 'Al-Qamar', ayas: 55, pages: 584 },
  { number: 55, name: 'Ar-Rahman', ayas: 78, pages: 587 },
  { number: 56, name: 'Al-Waqi\'ah', ayas: 96, pages: 590 },
  { number: 57, name: 'Al-Hadid', ayas: 29, pages: 596 },
  { number: 58, name: 'Al-Mujadilah', ayas: 22, pages: 599 },
  { number: 59, name: 'Al-Hashr', ayas: 24, pages: 601 },
  { number: 60, name: 'Al-Mumtahanah', ayas: 13, pages: 603 },
  { number: 61, name: 'As-Saff', ayas: 14, pages: 604 },
  { number: 62, name: 'Al-Jumu\'ah', ayas: 11, pages: 605 },
  { number: 63, name: 'Al-Munafiqun', ayas: 11, pages: 606 },
  { number: 64, name: 'At-Taghabun', ayas: 18, pages: 607 },
  { number: 65, name: 'At-Talaq', ayas: 12, pages: 609 },
  { number: 66, name: 'At-Tahrim', ayas: 12, pages: 610 },
  { number: 67, name: 'Al-Mulk', ayas: 30, pages: 611 },
  { number: 68, name: 'Al-Qalam', ayas: 52, pages: 612 },
  { number: 69, name: 'Al-Haqqah', ayas: 52, pages: 614 },
  { number: 70, name: 'Al-Ma\'arij', ayas: 44, pages: 615 },
  { number: 71, name: 'Nuh', ayas: 28, pages: 616 },
  { number: 72, name: 'Al-Jinn', ayas: 28, pages: 617 },
  { number: 73, name: 'Al-Muzzammil', ayas: 20, pages: 618 },
  { number: 74, name: 'Al-Muddaththir', ayas: 56, pages: 619 },
  { number: 75, name: 'Al-Qiyamah', ayas: 40, pages: 620 },
  { number: 76, name: 'Al-Insan', ayas: 31, pages: 621 },
  { number: 77, name: 'Al-Mursalat', ayas: 50, pages: 622 },
  { number: 78, name: 'An-Naba', ayas: 40, pages: 623 },
  { number: 79, name: 'An-Nazi\'at', ayas: 46, pages: 624 },
  { number: 80, name: '\'Abasa', ayas: 42, pages: 625 },
  { number: 81, name: 'At-Takwir', ayas: 29, pages: 625 },
  { number: 82, name: 'Al-Infitar', ayas: 19, pages: 626 },
  { number: 83, name: 'At-Tatfif', ayas: 36, pages: 627 },
  { number: 84, name: 'Al-Inshiqaq', ayas: 25, pages: 627 },
  { number: 85, name: 'Al-Buruj', ayas: 22, pages: 628 },
  { number: 86, name: 'At-Tariq', ayas: 17, pages: 628 },
  { number: 87, name: 'Al-A\'la', ayas: 19, pages: 629 },
  { number: 88, name: 'Al-Ghashiyah', ayas: 26, pages: 629 },
  { number: 89, name: 'Al-Fajr', ayas: 30, pages: 629 },
  { number: 90, name: 'Al-Balad', ayas: 20, pages: 630 },
  { number: 91, name: 'Ash-Shams', ayas: 15, pages: 630 },
  { number: 92, name: 'Al-Layl', ayas: 21, pages: 630 },
  { number: 93, name: 'Ad-Duha', ayas: 11, pages: 630 },
  { number: 94, name: 'Ash-Sharh', ayas: 8, pages: 631 },
  { number: 95, name: 'At-Tin', ayas: 8, pages: 631 },
  { number: 96, name: 'Al-Alaq', ayas: 19, pages: 631 },
  { number: 97, name: 'Al-Qadr', ayas: 5, pages: 631 },
  { number: 98, name: 'Al-Bayyinah', ayas: 8, pages: 631 },
  { number: 99, name: 'Az-Zilzal', ayas: 8, pages: 632 },
  { number: 100, name: 'Al-Adiyat', ayas: 11, pages: 632 },
  { number: 101, name: 'Al-Qari\'ah', ayas: 11, pages: 632 },
  { number: 102, name: 'At-Takathur', ayas: 8, pages: 632 },
  { number: 103, name: 'Al-Asr', ayas: 3, pages: 632 },
  { number: 104, name: 'Al-Humazah', ayas: 9, pages: 633 },
  { number: 105, name: 'Al-Fil', ayas: 5, pages: 633 },
  { number: 106, name: 'Quraish', ayas: 4, pages: 633 },
  { number: 107, name: 'Al-Ma\'un', ayas: 7, pages: 633 },
  { number: 108, name: 'Al-Kawthar', ayas: 3, pages: 633 },
  { number: 109, name: 'Al-Kafirun', ayas: 6, pages: 633 },
  { number: 110, name: 'An-Nasr', ayas: 3, pages: 633 },
  { number: 111, name: 'Al-Masad', ayas: 5, pages: 633 },
  { number: 112, name: 'Al-Ikhlas', ayas: 4, pages: 634 },
  { number: 113, name: 'Al-Falaq', ayas: 5, pages: 634 },
  { number: 114, name: 'An-Nas', ayas: 6, pages: 634 },
] as const

export const TOTAL_QURAN_AYAS = 6236 // Total Ayas in Quran

/**
 * Get Surah by number
 */
export function getSurah(number: number) {
  return QURAN_SURAHS.find(s => s.number === number)
}

/**
 * Get Surah name by number
 */
export function getSurahName(number: number): string {
  const surah = getSurah(number)
  return surah?.name || `Surah ${number}`
}

/**
 * Calculate pages between two Surahs/Ayas
 * Formula: page number when you reach ayah (surah, ayah)
 */
export function calculatePages(fromSurah: number, fromAyah: number, toSurah: number, toAyah: number): number {
  if (fromSurah > toSurah || (fromSurah === toSurah && fromAyah > toAyah)) {
    return 0 // Invalid range
  }

  let pages = 0
  let totalAyas = 0

  // Count Ayas from fromSurah:fromAyah to toSurah:toAyah
  for (let s = fromSurah; s <= toSurah; s++) {
    const surah = getSurah(s)
    if (!surah) continue

    let startAya = s === fromSurah ? fromAyah : 1
    let endAya = s === toSurah ? toAyah : surah.ayas

    totalAyas += endAya - startAya + 1
  }

  // Approximate: average 15 Ayas per page (rough estimation)
  // Use Surah pages if spanning full Surahs
  if (fromSurah === toSurah) {
    return Math.ceil((toAyah - fromAyah + 1) / 10)
  }

  // Estimate based on page boundaries
  pages += 1 // At least 1 page
  for (let s = fromSurah + 1; s < toSurah; s++) {
    const surah = getSurah(s)
    if (surah) {
      pages += Math.max(1, Math.ceil(surah.ayas / 15))
    }
  }
  pages += 1 // Partial last Surah

  return Math.max(1, pages)
}

/**
 * Calculate total Ayas in a range
 */
export function countAyas(fromSurah: number, fromAyah: number, toSurah: number, toAyah: number): number {
  if (fromSurah > toSurah || (fromSurah === toSurah && fromAyah > toAyah)) {
    return 0
  }

  let count = 0
  for (let s = fromSurah; s <= toSurah; s++) {
    const surah = getSurah(s)
    if (!surah) continue

    let startAya = s === fromSurah ? fromAyah : 1
    let endAya = s === toSurah ? toAyah : surah.ayas

    count += endAya - startAya + 1
  }

  return count
}

/**
 * Calculate Hifz progress
 */
export function calculateHifzProgress(
  totalAyasMemorized: number,
  currentRate: number // Ayas per day
): {
  percentage: number
  remaining: number
  daysToComplete: number
  estimatedDate: Date
} {
  const remaining = TOTAL_QURAN_AYAS - totalAyasMemorized
  const daysToComplete = currentRate > 0 ? Math.ceil(remaining / currentRate) : 0
  const estimatedDate = new Date()
  estimatedDate.setDate(estimatedDate.getDate() + daysToComplete)

  return {
    percentage: Math.round((totalAyasMemorized / TOTAL_QURAN_AYAS) * 100),
    remaining,
    daysToComplete,
    estimatedDate,
  }
}

/**
 * Get Juz number for a Surah/Ayah
 * Simplified: Each Juz is approximately 1/30th of Quran
 */
export function getJuzNumber(surah: number, ayah: number): number {
  // Estimate based on Surah position
  const approximateAyaPosition = QURAN_SURAHS.slice(0, surah - 1).reduce((sum, s) => sum + s.ayas, 0) + ayah
  return Math.ceil((approximateAyaPosition / TOTAL_QURAN_AYAS) * 30)
}
