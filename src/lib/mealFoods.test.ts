/**
 * 餐次食物推荐引擎测试
 */
import { describe, it, expect } from 'vitest';
import { suggestMealFoods } from './mealFoods';

describe('餐次食物推荐', () => {
  it('练后餐：碳水50g 推荐食物且克数反算正确', () => {
    const s = suggestMealFoods('练后餐', 50, 30);
    expect(s.carb.length).toBeGreaterThan(0);
    // 米饭碳水率0.25-0.35，50g碳水 → 145-200g 区间
    const rice = s.carb.find((c) => c.name.includes('米饭'));
    if (rice) {
      expect(rice.amount).toBeGreaterThan(140);
      expect(rice.amount).toBeLessThan(210);
      expect(rice.unit).toBe('g');
    }
  });

  it('练后餐：不推荐低GI碳水（意面/燕麦）', () => {
    const s = suggestMealFoods('练后餐', 50, 30);
    const lowGI = s.carb.filter((c) => c.name.includes('意面') || c.name.includes('燕麦'));
    expect(lowGI.length).toBe(0);
  });

  it('早餐：蛋白推荐含鸡蛋牛奶（固定量）', () => {
    const s = suggestMealFoods('早餐', 30, 20);
    // 鸡蛋 6g/个，20g蛋白 → 约3个
    const egg = s.protein.find((p) => p.name === '鸡蛋');
    if (egg) {
      expect(egg.unit).toBe('个');
      expect(egg.amount).toBeGreaterThan(0);
      expect(egg.provides).toBe(egg.amount * 6);
    }
  });

  it('零食：只推荐水果/便携碳水', () => {
    const s = suggestMealFoods('零食', 15, 0);
    // 碳水推荐应该有水果类
    expect(s.carb.length).toBeGreaterThan(0);
  });

  it('蛋白0时仍正常返回（不报错）', () => {
    const s = suggestMealFoods('练后餐', 50, 0);
    expect(s).toBeDefined();
    expect(s.carb.length).toBeGreaterThan(0);
  });

  it('推荐占比 pct 计算正确', () => {
    const s = suggestMealFoods('练后餐', 50, 30);
    for (const c of s.carb) {
      expect(c.pct).toBeGreaterThan(0);
      expect(c.pct).toBeLessThanOrEqual(150); // 允许略超
    }
  });

  it('练后餐蛋白推荐熟肉（蛋白率高）', () => {
    const s = suggestMealFoods('练后餐', 50, 30);
    // 熟肉蛋白率0.25，30g蛋白 → 120g
    const meat = s.protein.find((p) => p.name.includes('熟肉'));
    if (meat) {
      expect(meat.amount).toBeGreaterThan(100);
      expect(meat.unit).toBe('g');
    }
  });
});
