/**
 * 引擎 C：最大力量(1RM)预测
 * 还原自「好人松松 健身Excel套表」表24（9个公式）
 *
 * 输入：配重(kg) + 力竭次数(reps)
 * 输出：8个预测方程的结果 + 性别适配标注
 *
 * 已验证：配重50/次数10 → Adams 62.5, Brzycki 66.68 (Excel表24)
 */

export type Gender = '男' | '女';

export interface OneRMFormula {
  author: string;
  /** 公式文字（用于展示） */
  formula: string;
  /** 性别适配标注 */
  genderNote?: '对女性较准确' | '对男性较准确';
  /** 计算函数 */
  calc: (weight: number, reps: number) => number;
}

/** 8个1RM预测方程（顺序与Excel表24一致） */
export const ONE_RM_FORMULAS: OneRMFormula[] = [
  {
    author: 'Adams',
    formula: '配重 / (1 - 0.02 × 次数)',
    calc: (w, r) => w / (1 - 0.02 * r),
  },
  {
    author: 'Brown',
    formula: '(次数 × 0.0328 + 0.9849) × 配重',
    genderNote: '对女性较准确',
    calc: (w, r) => (r * 0.0328 + 0.9849) * w,
  },
  {
    author: 'Brzycki',
    formula: '配重 / (1.0278 - 0.0278 × 次数)',
    genderNote: '对女性较准确',
    calc: (w, r) => w / (1.0278 - 0.0278 * r),
  },
  {
    author: 'Lander',
    formula: '配重 / (1.013 - 0.0267123 × 次数)',
    genderNote: '对女性较准确',
    calc: (w, r) => w / (1.013 - 0.0267123 * r),
  },
  {
    author: 'Lombardi',
    formula: '次数^0.1 × 配重',
    genderNote: '对男性较准确',
    calc: (w, r) => Math.pow(r, 0.1) * w,
  },
  {
    author: 'Mayhew',
    formula: '配重 / (0.522 + 0.419 × e^(-0.055 × 次数))',
    calc: (w, r) => w / (0.522 + 0.419 * Math.exp(-0.055 * r)),
  },
  {
    author: "O'Connor",
    formula: '0.025 × (配重 × 次数) + 配重',
    calc: (w, r) => 0.025 * w * r + w,
  },
  {
    author: 'Wathen',
    formula: '配重 / (0.488 + 0.538 × e^(-0.075 × 次数))',
    calc: (w, r) => w / (0.488 + 0.538 * Math.exp(-0.075 * r)),
  },
];

export interface OneRMResult {
  author: string;
  formula: string;
  genderNote?: string;
  value: number; // kg
}

/** 计算所有公式的1RM预测值 */
export function calcOneRM(weight: number, reps: number): OneRMResult[] {
  return ONE_RM_FORMULAS.map((f) => ({
    author: f.author,
    formula: f.formula,
    genderNote: f.genderNote,
    value: Math.round(f.calc(weight, reps) * 10) / 10,
  }));
}

/** 取所有公式的平均预测值 */
export function avgOneRM(weight: number, reps: number): number {
  const results = calcOneRM(weight, reps);
  const sum = results.reduce((s, r) => s + r.value, 0);
  return Math.round((sum / results.length) * 10) / 10;
}

/**
 * 按性别给出推荐值（优先采用标注性别的公式，取均值）
 * 无性别公式则用全体均值
 */
export function recommendedOneRM(weight: number, reps: number, gender: Gender): number {
  const results = calcOneRM(weight, reps);
  const targetNote = gender === '女' ? '对女性较准确' : '对男性较准确';
  const matched = results.filter((r) => r.genderNote === targetNote);
  const pool = matched.length > 0 ? matched : results;
  const sum = pool.reduce((s, r) => s + r.value, 0);
  return Math.round((sum / pool.length) * 10) / 10;
}
