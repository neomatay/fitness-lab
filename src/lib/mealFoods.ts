/**
 * 餐次食物推荐引擎
 * 输入某餐的碳水/蛋白目标克数，推荐具体食物及食用克数
 *
 * 算法：推荐克数 = 目标克数 ÷ 食物率值
 * 筛选：按餐次场景（练前/练后/正餐/零食）套用作者的饮食规则
 *  - 练后餐：不用低GI碳水（意面/燕麦麸皮等），要快碳升糖快
 *  - 练前餐：太饱可选低饱腹碳水（馒头/面包/面条）
 *  - 鸡蛋牛奶是固定量食物（6g/个、10g/盒），按"个/盒"推荐
 */

import foodsRaw from '../data/foods.json';

interface FoodItem {
  category: string;
  name: string;
  note: string;
  carbRate?: number;
  carbRateText?: string;
  proteinRate?: number;
  proteinRateText?: string;
  gi?: string;
  role?: string;
}
const foods = foodsRaw as FoodItem[];

export type MealType = '早餐' | '练前餐' | '练后餐' | '午餐' | '晚餐' | '零食';

export interface FoodSuggestion {
  name: string;
  /** 推荐量（数值） */
  amount: number;
  /** 单位 g/个/盒 */
  unit: string;
  /** 该食物提供的目标营养素克数 */
  provides: number;
  /** 该餐目标占比 */
  pct: number;
  note?: string;
}

export interface MealSuggestion {
  carb: FoodSuggestion[];
  protein: FoodSuggestion[];
}

/** 是否低 GI 碳水（练后餐避免） */
function isLowGI(f: FoodItem): boolean {
  return f.gi === '低';
}

/** 碳水食物按餐次筛选 */
function carbFoodsForMeal(meal: MealType): FoodItem[] {
  const carbFoods = foods.filter((f) => 'carbRate' in f && typeof f.carbRate === 'number');
  switch (meal) {
    case '练后餐':
      // 快碳优先，排除低GI
      return carbFoods.filter((f) => !isLowGI(f));
    case '练前餐':
    case '早餐':
      // 低饱腹/常规碳水，避免太重
      return carbFoods.filter((f) => !isLowGI(f));
    case '零食':
      // 水果、便携碳水
      return carbFoods.filter((f) => f.category === '水果' || f.category === '便携碳水');
    default:
      // 午餐/晚餐：主食类 + 水果（排除便携加工碳水）
      return carbFoods.filter((f) => f.category !== '便携碳水');
  }
}

/** 蛋白食物按餐次筛选 */
function proteinFoodsForMeal(meal: MealType): FoodItem[] {
  const proteinFoods = foods.filter((f) => 'proteinRate' in f && typeof f.proteinRate === 'number');
  // 鸡蛋牛奶是固定量食物，单独处理
  const fixedEgg = foods.find((f) => f.name === '鸡蛋');
  const fixedMilk = foods.find((f) => f.name === '牛奶');

  if (meal === '早餐' || meal === '练前餐') {
    // 早餐优先鸡蛋牛奶
    return [fixedEgg, fixedMilk, ...proteinFoods].filter(Boolean) as FoodItem[];
  }
  return proteinFoods;
}

/** 按率值算推荐克数 */
function suggestByRate(f: FoodItem, targetG: number, nutrient: 'carb' | 'protein'): FoodSuggestion | null {
  const rate = nutrient === 'carb' ? f.carbRate : f.proteinRate;
  if (typeof rate !== 'number' || rate <= 0) return null;
  const amount = Math.round(targetG / rate / 5) * 5; // 取整到5g
  if (amount <= 0) return null;
  return {
    name: f.name,
    amount,
    unit: 'g',
    provides: Math.round(amount * rate),
    pct: 0, // 后面填
    note: f.note ? f.note.slice(0, 40) : undefined,
  };
}

/** 固定量食物（鸡蛋6g/个、牛奶10g/盒）推荐 */
function suggestFixed(f: FoodItem, targetG: number, perItemG: number, unit: string): FoodSuggestion | null {
  const count = Math.max(1, Math.round(targetG / perItemG));
  return {
    name: f.name,
    amount: count,
    unit,
    provides: count * perItemG,
    pct: 0,
    note: f.note ? f.note.slice(0, 40) : undefined,
  };
}

/**
 * 为某餐推荐食物
 * @param meal 餐次
 * @param carbG 该餐碳水目标
 * @param proteinG 该餐蛋白目标
 * @param carbCount 推荐几个碳水选项
 * @param proteinCount 推荐几个蛋白选项
 */
export function suggestMealFoods(
  meal: MealType,
  carbG: number,
  proteinG: number,
  carbCount = 3,
  proteinCount = 3,
): MealSuggestion {
  // 碳水推荐
  const carbPool = carbFoodsForMeal(meal);
  // 按率值排序，率值高 → 需要吃的量少（更精准/便携）；这里优先选常见主食
  const carbRanked = rankCarbs(carbPool, meal);
  const carb: FoodSuggestion[] = carbRanked
    .slice(0, carbCount)
    .map((f) => suggestByRate(f, carbG, 'carb'))
    .filter(Boolean)
    .map((s) => ({ ...s!, pct: carbG > 0 ? (s!.provides / carbG) * 100 : 0 }));

  // 蛋白推荐
  const proteinPool = proteinFoodsForMeal(meal);
  const protein: FoodSuggestion[] = [];
  for (const f of proteinPool) {
    if (protein.length >= proteinCount) break;
    if (f.name === '鸡蛋') {
      const s = suggestFixed(f, proteinG, 6, '个');
      if (s) protein.push({ ...s, pct: proteinG > 0 ? (s.provides / proteinG) * 100 : 0 });
    } else if (f.name === '牛奶') {
      const s = suggestFixed(f, proteinG, 10, '盒');
      if (s) protein.push({ ...s, pct: proteinG > 0 ? (s.provides / proteinG) * 100 : 0 });
    } else {
      const s = suggestByRate(f, proteinG, 'protein');
      if (s) protein.push({ ...s, pct: proteinG > 0 ? (s.provides / proteinG) * 100 : 0 });
    }
  }

  return { carb, protein };
}

/** 按餐次给碳水食物排序（常见主食优先） */
function rankCarbs(pool: FoodItem[], meal: MealType): FoodItem[] {
  const priority: Record<MealType, string[]> = {
    早餐: ['米类主食', '麦类主食'],
    练前餐: ['麦类主食', '米类主食'],
    练后餐: ['米类主食', '麦类主食', '其他主食'],
    午餐: ['米类主食', '麦类主食', '其他主食'],
    晚餐: ['米类主食', '麦类主食', '其他主食'],
    零食: ['水果', '便携碳水'],
  };
  const order = priority[meal] || [];
  return [...pool].sort((a, b) => {
    const ai = order.indexOf(a.category);
    const bi = order.indexOf(b.category);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}
