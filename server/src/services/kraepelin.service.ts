export interface ColumnStat {
  column: number;
  totalRow: number;
  attempted: number;
  correct: number;
  wrong: number;
}

export interface KraepelinCalculationResult {
  totalAnswered: number;
  totalCorrect: number;
  totalWrong: number;
  accuracyRate: number;
  workCapacity: number;
  consistencyScore: number;
  fatigueIndex: number;
  pattern: string;
}

export class KraepelinEngine {
  /**
   * Evaluasi metrik psikometri lengkap berstandar industri
   */
  public static calculate(stats: ColumnStat[]): KraepelinCalculationResult {
    if (!stats || stats.length === 0) {
      return {
        totalAnswered: 0,
        totalCorrect: 0,
        totalWrong: 0,
        accuracyRate: 0,
        workCapacity: 0,
        consistencyScore: 0,
        fatigueIndex: 0,
        pattern: 'flat',
      };
    }

    const totalAnswered = stats.reduce((acc, curr) => acc + curr.attempted, 0);
    const totalCorrect = stats.reduce((acc, curr) => acc + curr.correct, 0);
    const totalWrong = stats.reduce((acc, curr) => acc + curr.wrong, 0);

    // 1. Accuracy Rate (Ketelitian)
    const accuracyRate = totalAnswered > 0 
      ? parseFloat(((totalCorrect / totalAnswered) * 100).toFixed(2))
      : 0;

    // 2. Work Capacity (Panker / Kecepatan Kerja)
    const workCapacity = totalCorrect;

    // 3. Consistency Score (Kestabilan Ritme Kerja: 100 - CV)
    const attempts = stats.map((s) => s.attempted);
    const mean = attempts.reduce((a, b) => a + b, 0) / (attempts.length || 1);
    const variance = attempts.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (attempts.length || 1);
    const stdDev = Math.sqrt(variance);
    const cv = mean > 0 ? (stdDev / mean) * 100 : 0;
    const consistencyScore = parseFloat(Math.max(0, 100 - cv).toFixed(2));

    // 4. Fatigue Index (Indeks Kelelahan: Paruh Pertama vs Paruh Kedua)
    const half = Math.floor(attempts.length / 2) || 1;
    const firstHalfAvg = attempts.slice(0, half).reduce((a, b) => a + b, 0) / half;
    const secondHalfAvg = attempts.slice(half).reduce((a, b) => a + b, 0) / (attempts.length - half || 1);
    const fatigueIndex = firstHalfAvg > 0
      ? parseFloat((((firstHalfAvg - secondHalfAvg) / firstHalfAvg) * 100).toFixed(2))
      : 0;

    // 5. Pattern Detection (Deteksi Tren Kurva Kerja)
    const pattern = this.detectPattern(attempts);

    return {
      totalAnswered,
      totalCorrect,
      totalWrong,
      accuracyRate,
      workCapacity,
      consistencyScore,
      fatigueIndex,
      pattern,
    };
  }

  private static detectPattern(values: number[]): string {
    if (values.length < 3) return 'flat';

    const n = values.length;
    const quarter = Math.floor(n / 4) || 1;

    const q1Avg = values.slice(0, quarter).reduce((a, b) => a + b, 0) / quarter;
    const q4Avg = values.slice(n - quarter).reduce((a, b) => a + b, 0) / quarter;

    const diff = q4Avg - q1Avg;
    const relDiff = Math.abs(diff) / (q1Avg || 1);

    if (relDiff < 0.08) return 'flat';

    const midValues = values.slice(quarter, n - quarter);
    const midPeak = midValues.length > 0 ? Math.max(...midValues) : 0;
    const overallMax = Math.max(...values);

    if (diff < 0 && midPeak >= overallMax * 0.9 && midPeak > q1Avg * 1.05) {
      return 'peak-drop';
    }

    if (diff > 0) return 'ascending';
    if (diff < 0) return 'descending';

    return 'wavy';
  }
}
