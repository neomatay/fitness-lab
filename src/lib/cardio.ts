/**
 * 引擎 B：有氧运动热量消耗
 * 还原自「好人松松 健身Excel套表」表16（1950个公式）
 *
 * 核心公式：每kg体重活动热量消耗 = 运动心率 ÷ 静息心率 × 6.4 - 6.2
 * 每小时消耗(kcal) = 上式 × 体重 × 体重校正系数
 * 结果四舍五入到10的倍数 (Excel: ROUND(..., -1))
 */

/** 体重校正系数表 (50-120kg，每5kg一档) */
export const WEIGHT_FACTOR: Record<number, number> = {
  50: 1.0, 55: 1.0, 60: 1.0, 65: 1.0, 70: 1.0, 75: 1.0, 80: 1.0, 85: 1.0,
  90: 0.98, 95: 0.96, 100: 0.94, 105: 0.92, 110: 0.90, 115: 0.92, 120: 0.90,
};

/** 可选体重档位（用于展示查表） */
export const WEIGHT_BINS = [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120];

/** 取最接近的体重档位 (50-120) */
export function nearestWeightBin(weightKg: number): number {
  const clamped = Math.max(50, Math.min(120, weightKg));
  let best = WEIGHT_BINS[0];
  let bestDiff = Infinity;
  for (const b of WEIGHT_BINS) {
    const diff = Math.abs(b - clamped);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = b;
    }
  }
  return best;
}

/** 体重档位的校正系数（任意体重取最近档） */
export function weightFactor(weightKg: number): number {
  return WEIGHT_FACTOR[nearestWeightBin(weightKg)];
}

/**
 * 计算每kg体重的活动热量消耗系数
 * = 运动心率 ÷ 静息心率 × 6.4 - 6.2
 */
export function perKgBurn(exerciseHR: number, restHR: number): number {
  return (exerciseHR / restHR) * 6.4 - 6.2;
}

/**
 * 每小时有氧热量消耗 (kcal)
 * 已验证：静息60/运动120/体重70 → 460 (Excel表16 R14/J14)
 *        静息60/运动120/体重120 → 710 (Excel表16 R14/T14)
 */
export function cardioKcalPerHour(exerciseHR: number, restHR: number, weightKg: number): number {
  const perKg = perKgBurn(exerciseHR, restHR);
  const raw = perKg * weightKg * weightFactor(weightKg);
  // ROUND 到 10 的倍数 (Excel ROUND(x, -1))
  return Math.round(raw / 10) * 10;
}

/**
 * 填饮食表"有氧消耗d"的每日值
 * = 每小时消耗 × 每周小时数 ÷ 7
 */
export function cardioDailyForDiet(
  exerciseHR: number,
  restHR: number,
  weightKg: number,
  weeklyHours: number,
): number {
  return (cardioKcalPerHour(exerciseHR, restHR, weightKg) * weeklyHours) / 7;
}

/** 生成全体重档位的查表数据（用于M2展示） */
export function cardioTableByWeight(
  exerciseHR: number,
  restHR: number,
): { weight: number; kcal: number }[] {
  return WEIGHT_BINS.map((w) => ({
    weight: w,
    kcal: cardioKcalPerHour(exerciseHR, restHR, w),
  }));
}
