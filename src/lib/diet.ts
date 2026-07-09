/**
 * 引擎 A：饮食方案热量与营养素计算
 * 还原自「好人松松 健身Excel套表」表1-15 的文字算法（这些表零Excel公式，算法写在注释里）
 *
 * 算法链：
 *  ① 基础代谢 a (Mifflin-St Jeor)
 *  ② 无运动总消耗 b = a ÷ 0.7   （基础代谢占人体消耗约70%）
 *  ③ 力训消耗 c (查表)
 *  ④ 有氧消耗 d (由引擎B传入，平均到每天)
 *  ⑤ 平衡热量：力训日 e1=b+c+d / 休息日 e2=b+d
 *  ⑥ 应吃热量系数：减脂 ×0.64 (20%缺口×0.8余地) / 增肌 ×0.84 (5%盈余×0.8余地)
 *  ⑦ 脂肪配额：减脂 男60女50(120kg+→70) / 增肌 男80女70
 *  ⑧ 营养素分配：训练日扣脂肪后 64%碳水/36%蛋白；休息日脂肪+蛋白同训练日，剩余全碳水
 */

export type Gender = '男' | '女';
export type Goal = '减脂' | '增肌';
export type TrainLevel = '新手' | '有基础' | '老手';

/** 训练时段（决定餐序排列） */
export type TrainTime =
  | '早饭前练'    // 起床直接练
  | '早饭后练'    // 早饭作练前餐
  | '午饭前练'
  | '午饭后练'
  | '晚饭前练'
  | '晚饭后练'
  | '夜里练'
  | '不力训';

/** 力训热量消耗表 (kcal) */
export const TRAIN_BURN_TABLE: Record<Gender, Record<TrainLevel, number>> = {
  男: { 新手: 150, 有基础: 200, 老手: 250 },
  女: { 新手: 100, 有基础: 150, 老手: 200 },
};

/** 热量系数：减脂0.64 / 增肌0.84 */
const EAT_FACTOR: Record<Goal, number> = {
  减脂: 0.64,
  增肌: 0.84,
};

/** 营养素热量 (kcal/g) */
const KCAL_PER_G = { carb: 4, protein: 4, fat: 9 };

/** 训练日扣脂肪后碳水占比 (剩余64%碳水 / 36%蛋白) */
const TRAIN_CARB_RATIO = 0.64;

export interface DietInput {
  gender: Gender;
  heightCm: number;
  weightKg: number;
  age: number;
  goal: Goal;
  trainLevel: TrainLevel;
  /** 有氧消耗，平均到每天(kcal)，由引擎B算出后传入，默认0 */
  cardioKcalPerDay?: number;
  /** 可选：手动覆盖碳水配额(g/kg)，不传则自动派生 */
  overrideCarbPerKg?: number;
  /** 可选：手动覆盖蛋白配额(g/kg) */
  overrideProteinPerKg?: number;
}

export interface DietResult {
  // 基础数据
  bmr: number;                 // 基础代谢 a
  noExerciseBurn: number;      // 无运动总消耗 b
  trainBurn: number;           // 力训消耗 c
  cardioBurn: number;          // 有氧消耗 d
  // 平衡热量
  trainDayBalance: number;     // 力训日 e1
  restDayBalance: number;      // 休息日 e2
  // 应吃热量
  trainDayEat: number;         // 力训日应吃 f1
  restDayEat: number;          // 休息日应吃 f2
  eatFactor: number;           // 使用的系数
  // 营养素 (g)
  fatG: number;                // 脂肪配额(训练日=休息日)
  trainCarbG: number;          // 训练日碳水
  trainProteinG: number;       // 训练日蛋白
  restCarbG: number;           // 休息日碳水
  restProteinG: number;        // 休息日蛋白
  // 派生配额 (g/kg，展示用)
  trainCarbPerKg: number;
  trainProteinPerKg: number;
  // 营养素热量构成 (kcal，用于可视化)
  trainDayKcal: { carb: number; protein: number; fat: number };
  restDayKcal: { carb: number; protein: number; fat: number };
}

/** 计算脂肪配额(g) */
export function calcFatG(goal: Goal, gender: Gender, weightKg: number): number {
  if (goal === '减脂') {
    if (weightKg >= 120) return 70;
    return gender === '男' ? 60 : 50;
  }
  // 增肌
  return gender === '男' ? 80 : 70;
}

/** 主计算函数 */
export function calcDiet(input: DietInput): DietResult {
  const { gender, heightCm, weightKg, age, goal, trainLevel } = input;
  const cardioBurn = input.cardioKcalPerDay ?? 0;

  // ① 基础代谢 Mifflin-St Jeor
  const base = weightKg * 9.99 + heightCm * 6.25 - age * 4.92;
  const bmr = gender === '男' ? base + 5 : base - 161;

  // ② 无运动总消耗
  const noExerciseBurn = bmr / 0.7;

  // ③ 力训消耗
  const trainBurn = TRAIN_BURN_TABLE[gender][trainLevel];

  // ⑤ 平衡热量
  const trainDayBalance = noExerciseBurn + trainBurn + cardioBurn;
  const restDayBalance = noExerciseBurn + cardioBurn;

  // ⑥ 应吃热量
  const factor = EAT_FACTOR[goal];
  const trainDayEat = trainDayBalance * factor;
  const restDayEat = restDayBalance * factor;

  // ⑦ 脂肪配额
  const fatG = calcFatG(goal, gender, weightKg);
  const fatKcal = fatG * KCAL_PER_G.fat;

  // ⑧ 营养素分配
  // 训练日：扣脂肪后剩余 64%碳水/36%蛋白
  const trainRemain = Math.max(0, trainDayEat - fatKcal);
  const trainProteinG = (trainRemain * (1 - TRAIN_CARB_RATIO)) / KCAL_PER_G.protein;
  const trainCarbG = (trainRemain * TRAIN_CARB_RATIO) / KCAL_PER_G.carb;

  // 休息日：脂肪+蛋白同训练日，剩余全给碳水
  const restProteinG = trainProteinG;
  const restCarbG = Math.max(0, (restDayEat - fatKcal - restProteinG * KCAL_PER_G.protein) / KCAL_PER_G.carb);

  // 应用手动覆盖
  let finalTrainCarbG = trainCarbG;
  let finalTrainProteinG = trainProteinG;
  if (input.overrideCarbPerKg != null) finalTrainCarbG = input.overrideCarbPerKg * weightKg;
  if (input.overrideProteinPerKg != null) finalTrainProteinG = input.overrideProteinPerKg * weightKg;

  return {
    bmr: round1(bmr),
    noExerciseBurn: round1(noExerciseBurn),
    trainBurn,
    cardioBurn,
    trainDayBalance: round1(trainDayBalance),
    restDayBalance: round1(restDayBalance),
    trainDayEat: round1(trainDayEat),
    restDayEat: round1(restDayEat),
    eatFactor: factor,
    fatG,
    trainCarbG: round1(finalTrainCarbG),
    trainProteinG: round1(finalTrainProteinG),
    restCarbG: round1(restCarbG),
    restProteinG: round1(restProteinG),
    trainCarbPerKg: round1(finalTrainCarbG / weightKg),
    trainProteinPerKg: round1(finalTrainProteinG / weightKg),
    trainDayKcal: {
      carb: Math.round(finalTrainCarbG * KCAL_PER_G.carb),
      protein: Math.round(finalTrainProteinG * KCAL_PER_G.protein),
      fat: Math.round(fatKcal),
    },
    restDayKcal: {
      carb: Math.round(restCarbG * KCAL_PER_G.carb),
      protein: Math.round(restProteinG * KCAL_PER_G.protein),
      fat: Math.round(fatKcal),
    },
  };
}

/** 按训练时段返回餐序（力训日） */
export function getMealOrder(trainTime: TrainTime): string[] {
  switch (trainTime) {
    case '早饭前练':
      return ['①练后餐(全天最大)', '②早饭=其他餐', '③午饭=其他餐', '④晚饭=其他餐'];
    case '早饭后练':
      return ['①早饭=练前餐', '②练后餐(全天最大)', '③午饭=其他餐', '④晚饭=其他餐'];
    case '午饭前练':
      return ['①早饭=其他餐', '②练后餐(全天最大)', '③午饭=练前餐后衔接', '④晚饭=其他餐'];
    case '午饭后练':
      return ['①早饭=其他餐', '②午饭=练前餐', '③练后餐(全天最大)', '④晚饭=其他餐'];
    case '晚饭前练':
      return ['①早饭=其他餐', '②午饭=其他餐', '③练后餐(全天最大)', '④晚饭=练前餐后衔接'];
    case '晚饭后练':
      return ['①早饭=其他餐', '②午饭=其他餐', '③晚饭=练前餐', '④练后餐(全天最大)'];
    case '夜里练':
      return ['①早饭=其他餐', '②午饭=其他餐', '③晚饭=练前餐', '④练后餐(夜间)'];
    case '不力训':
      return ['①早饭', '②午饭', '③晚饭', '④零食/夜宵'];
  }
}

/** 休息日餐序（所有时段通用） */
export function getRestMealOrder(): string[] {
  return ['①早饭', '②午饭', '③晚饭', '④零食/夜宵'];
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
