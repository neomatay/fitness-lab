/**
 * 三引擎单元测试
 * 用 Excel 原表已知值反验公式正确性
 * 运行: npx vitest run  (或 npm test)
 */
import { describe, it, expect } from 'vitest';
import { calcDiet, calcFatG, TRAIN_BURN_TABLE } from './diet';
import { cardioKcalPerHour, cardioDailyForDiet, perKgBurn } from './cardio';
import { calcOneRM, recommendedOneRM } from './oneRM';

describe('引擎B: 有氧热量 (对照Excel表16)', () => {
  // 表16 R14: 静息心率60/运动心率120, E14=6.59
  it('每kg消耗系数: 静息60/运动120 = 6.59', () => {
    expect(perKgBurn(120, 60)).toBeCloseTo(6.59, 1);
  });

  // J14: 体重70kg列结果 = 460
  it('静息60/运动120/体重70 → 460 kcal', () => {
    expect(cardioKcalPerHour(120, 60, 70)).toBe(460);
  });

  // T14: 体重120kg列(校正0.90)结果 = 710
  it('静息60/运动120/体重120 → 710 kcal (校正0.90)', () => {
    expect(cardioKcalPerHour(120, 60, 120)).toBe(710);
  });

  it('填表d值 = 每小时 × 周时长 ÷ 7', () => {
    // 460 kcal/h × 3.5h/周 ÷ 7 = 230
    expect(cardioDailyForDiet(120, 60, 70, 3.5)).toBeCloseTo(230, 0);
  });
});

describe('引擎C: 1RM预测 (对照Excel表24)', () => {
  // 表24: D7=50(配重) E7=10(次数)
  it('Adams: 配重50/次数10 → 62.5', () => {
    const r = calcOneRM(50, 10).find((x) => x.author === 'Adams')!;
    expect(r.value).toBe(62.5);
  });

  it('Brzycki: 配重50/次数10 → 66.7', () => {
    const r = calcOneRM(50, 10).find((x) => x.author === 'Brzycki')!;
    expect(r.value).toBeCloseTo(66.7, 1);
  });

  it('O\'Connor: 配重50/次数10 → 62.5', () => {
    // 0.025×50×10 + 50 = 12.5 + 50 = 62.5
    const r = calcOneRM(50, 10).find((x) => x.author === "O'Connor")!;
    expect(r.value).toBe(62.5);
  });

  it('共8个公式', () => {
    expect(calcOneRM(50, 10).length).toBe(8);
  });

  it('女性推荐采用Brown/Brzycki/Lander均值', () => {
    // 三者: Brown=65.9, Brzycki=66.7, Lander=66.1 → 均≈66.2
    const rec = recommendedOneRM(50, 10, '女');
    expect(rec).toBeGreaterThan(65);
    expect(rec).toBeLessThan(68);
  });
});

describe('引擎A: 饮食方案', () => {
  // 测试用例: 男/175cm/75kg/30岁/减脂/有基础/无有氧
  const baseInput = {
    gender: '男' as const,
    heightCm: 175,
    weightKg: 75,
    age: 30,
    goal: '减脂' as const,
    trainLevel: '有基础' as const,
  };

  it('基础代谢 Mifflin-St Jeor 男性正确', () => {
    // 75×9.99 + 175×6.25 - 30×4.92 + 5 = 749.25 + 1093.75 - 147.6 + 5 = 1700.4
    const r = calcDiet(baseInput);
    expect(r.bmr).toBeCloseTo(1700.4, 1);
  });

  it('无运动总消耗 = 基础代谢 ÷ 0.7', () => {
    const r = calcDiet(baseInput);
    expect(r.noExerciseBurn).toBeCloseTo(1700.4 / 0.7, 1);
  });

  it('力训消耗查表: 男有基础 = 200', () => {
    const r = calcDiet(baseInput);
    expect(r.trainBurn).toBe(200);
  });

  it('减脂应吃系数 0.64', () => {
    const r = calcDiet(baseInput);
    expect(r.eatFactor).toBe(0.64);
  });

  it('减脂脂肪配额: 男60g', () => {
    expect(calcFatG('减脂', '男', 75)).toBe(60);
  });

  it('减脂大体重(120kg+)脂肪配额 = 70g', () => {
    expect(calcFatG('减脂', '男', 125)).toBe(70);
  });

  it('增肌脂肪配额: 男80g', () => {
    expect(calcFatG('增肌', '男', 75)).toBe(80);
  });

  it('训练日蛋白+碳水+脂肪热量 ≈ 应吃热量', () => {
    const r = calcDiet(baseInput);
    const totalKcal = r.trainDayKcal.carb + r.trainDayKcal.protein + r.trainDayKcal.fat;
    // 各营养素热量分别 Math.round，累积误差放宽到 ±3kcal
    expect(Math.abs(totalKcal - r.trainDayEat)).toBeLessThan(3);
  });

  it('休息日蛋白 = 训练日蛋白', () => {
    const r = calcDiet(baseInput);
    expect(r.restProteinG).toBe(r.trainProteinG);
  });

  it('增肌系数 0.84 且应吃热量高于减脂', () => {
    const cut = calcDiet(baseInput);
    const bulk = calcDiet({ ...baseInput, goal: '增肌' });
    expect(bulk.eatFactor).toBe(0.84);
    expect(bulk.trainDayEat).toBeGreaterThan(cut.trainDayEat);
  });

  it('手动覆盖碳水配额生效', () => {
    const r = calcDiet({ ...baseInput, overrideCarbPerKg: 3.0 });
    expect(r.trainCarbG).toBeCloseTo(3.0 * 75, 1); // 225
    expect(r.trainCarbPerKg).toBe(3.0);
  });

  it('力训消耗表完整', () => {
    expect(TRAIN_BURN_TABLE.男.新手).toBe(150);
    expect(TRAIN_BURN_TABLE.男.老手).toBe(250);
    expect(TRAIN_BURN_TABLE.女.新手).toBe(100);
    expect(TRAIN_BURN_TABLE.女.老手).toBe(200);
  });
});
