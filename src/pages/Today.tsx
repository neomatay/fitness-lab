import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, isTrainingDay, WEEKDAY_LABELS } from '../store/useStore';
import { calcDiet, getMealOrder, getRestMealOrder } from '../lib/diet';
import { cardioDailyForDiet } from '../lib/cardio';
import { suggestMealFoods, type MealType } from '../lib/mealFoods';
import exercises from '../data/exercises.json';
import mediaAssets from '../data/mediaAssets.json';
import { Card, Metric, SectionTitle, COLORS } from '../components/ui';
import { DualRing } from '../components/DualRing';
import { NutrientDonut } from '../components/Donut';

// 三餐热量占比（训练日/休息日不同）
// 训练日：练前餐少、练后餐最大；休息日均分。这里给一组合理默认占比
const TRAIN_MEAL_RATIO: Record<string, number> = {
  早餐: 0.15, 练前餐: 0.1, 练后餐: 0.35, 午餐: 0.2, 晚餐: 0.15, 零食: 0.05,
};
const REST_MEAL_RATIO: Record<string, number> = {
  早餐: 0.3, 午餐: 0.35, 晚餐: 0.3, 零食: 0.05,
};

// 按部位匹配解剖图（从 mediaAssets 选 anatomy 类）
const PART_IMAGE_HINTS: { match: string[]; asset: string }[] = [
  { match: ['背'], asset: 'image18.png' },
  { match: ['胸'], asset: 'image30.png' },
  { match: ['肩'], asset: 'image31.png' },
  { match: ['肱二头', '肱三头', '手臂'], asset: 'image32.png' },
  { match: ['腿', '臀', '腹'], asset: 'image35.png' },
];
function imageForPart(part: string): string {
  const hint = PART_IMAGE_HINTS.find((h) => h.match.some((w) => part.includes(w)));
  if (!hint) return '';
  const asset = mediaAssets.find((a) => a.name === hint.asset);
  return asset?.path ?? '';
}

function parseMealName(meal: string): string {
  // "①早饭=练前餐" → "早餐"；"②练后餐(全天最大)" → "练后餐"
  const m = meal.replace(/^①|②|③|④|⑤/, '').replace(/^\d+\./, '');
  if (m.includes('早饭')) return '早餐';
  if (m.includes('练后')) return '练后餐';
  if (m.includes('练前')) return '练前餐';
  if (m.includes('午饭')) return '午餐';
  if (m.includes('晚饭')) return '晚餐';
  if (m.includes('夜宵') || m.includes('零食')) return '零食';
  return m;
}

export function TodayPage() {
  const navigate = useNavigate();
  const { profile, cardio, override, trainingDays, todayOverride, setTodayOverride } = useStore();
  const [showDetail, setShowDetail] = useState(false);
  const [openMeal, setOpenMeal] = useState<number | null>(null);
  const [openPart, setOpenPart] = useState<number | null>(null);

  const isTrainDay = isTrainingDay(useStore.getState());
  const today = new Date();
  const weekdayLabel = WEEKDAY_LABELS[today.getDay()];
  const isCalendarTrainDay = trainingDays.includes(today.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6);

  const cardioDaily = cardio.enabled
    ? cardioDailyForDiet(cardio.exerciseHR, cardio.restHR, profile.weightKg, cardio.weeklyHours)
    : 0;

  const result = useMemo(
    () =>
      calcDiet({
        gender: profile.gender,
        heightCm: profile.heightCm,
        weightKg: profile.weightKg,
        age: profile.age,
        goal: profile.goal,
        trainLevel: profile.trainLevel,
        cardioKcalPerDay: cardioDaily,
        overrideCarbPerKg: override.carbPerKg,
        overrideProteinPerKg: override.proteinPerKg,
      }),
    [profile, cardioDaily, override],
  );

  // 今日应吃热量 + 营养素
  const todayEat = isTrainDay ? result.trainDayEat : result.restDayEat;
  const todayCarbG = isTrainDay ? result.trainCarbG : result.restCarbG;
  const todayProteinG = isTrainDay ? result.trainProteinG : result.restProteinG;
  const todayKcal = isTrainDay ? result.trainDayKcal : result.restDayKcal;

  // 三餐分配
  const meals = isTrainDay ? getMealOrder(profile.trainTime) : getRestMealOrder();
  const mealRatio = isTrainDay ? TRAIN_MEAL_RATIO : REST_MEAL_RATIO;

  // 今日训练内容
  const todayTraining = useMemo(() => {
    if (!isTrainDay) return null;
    // 按训练日历顺序循环匹配分化方案的天数
    const plan = '三分化';
    const planDays = exercises.filter((e) => e.plan === plan);
    const dayNames = Array.from(new Set(planDays.map((e) => e.day)));
    if (dayNames.length === 0) return null;
    // 本周已训练次数（简化：按今天是第几个训练日）
    const pastTrainDaysThisWeek = trainingDays.filter((d) => d <= today.getDay() && d !== today.getDay()).length;
    const dayIdx = pastTrainDaysThisWeek % dayNames.length;
    const dayName = dayNames[dayIdx];
    const dayEx = planDays.filter((e) => e.day === dayName);
    // 按部位统计：动作数 + 组数
    const parts = Array.from(new Set(dayEx.map((e) => e.part))).map((part) => {
      const partEx = dayEx.filter((e) => e.part === part);
      // 从 group 提取组数文字（如 "下拉\n选1-2个动作 总共6-8组" → "6-8组"）
      const groupRaw = partEx[0]?.group || '';
      const setsMatch = groupRaw.match(/总共([\d\-]+)组/);
      const sets = setsMatch ? `${setsMatch[1]}组` : '—';
      return {
        name: part,
        exerciseCount: partEx.length,
        sets,
        image: imageForPart(part),
        exercises: partEx.map((e) => ({
          name: e.name,
          joint: [e.shoulder, e.elbow].filter(Boolean).join(' / ') || '',
        })),
      };
    });
    return { dayName, parts, count: dayEx.length };
  }, [isTrainDay, trainingDays]);

  return (
    <div className="space-y-5">
      {/* 日期 + 训练日切换 */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted dark:text-muted-dark">{today.getMonth() + 1}月{today.getDate()}日 · {weekdayLabel}</div>
          <h1 className="text-2xl font-bold tracking-tight mt-0.5">
            {isTrainDay ? '训练日' : '休息日'}
          </h1>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setTodayOverride(true)}
            className={`chip ${isTrainDay ? 'bg-gold dark:bg-gold-dark text-bg-dark dark:text-bg' : 'btn-ghost'}`}
          >
            训练
          </button>
          <button
            onClick={() => setTodayOverride(false)}
            className={`chip ${!isTrainDay ? 'bg-gold dark:bg-gold-dark text-bg-dark dark:text-bg' : 'btn-ghost'}`}
          >
            休息
          </button>
          {todayOverride !== undefined && (
            <button onClick={() => setTodayOverride(undefined)} className="chip btn-ghost" title="恢复按日历">
              ↺
            </button>
          )}
        </div>
      </div>

      {/* 双环：吃 × 练 + 净差 */}
      <DualRing
        intake={todayEat}
        burn={isTrainDay ? result.trainDayBalance : result.restDayBalance}
        goal={profile.goal}
        isTrainDay={isTrainDay}
        burnBreakdown={{
          base: Math.round(result.noExerciseBurn),
          train: result.trainBurn,
          cardio: Math.round(result.cardioBurn),
        }}
      />
      <div className="text-xs text-muted dark:text-muted-dark -mt-2 px-1">
        {todayOverride === undefined
          ? (isCalendarTrainDay ? '按训练日历判定为训练日' : '今日非训练日，默认显示训练日方案（可点休息切换）')
          : `手动${isTrainDay ? '训练日' : '休息日'}`}
        {cardio.enabled && ` · 含有氧 ${result.cardioBurn.toFixed(0)}kcal/日`}
      </div>

      {/* 营养素 + 三餐 合并卡：左圈右餐 */}
      <Card>
        <div className="grid md:grid-cols-[140px_1fr] gap-4 md:gap-5">
          {/* 左：甜甜圈 */}
          <div className="flex flex-col items-center md:items-start">
            <div className="text-xs text-muted dark:text-muted-dark mb-2 md:self-start">今日营养素</div>
            <NutrientDonut
              compact
              carbKcal={todayKcal.carb}
              proteinKcal={todayKcal.protein}
              fatKcal={todayKcal.fat}
              carbG={todayCarbG}
              proteinG={todayProteinG}
              fatG={result.fatG}
            />
          </div>

          {/* 右：三餐列表 */}
          <div className="md:border-l md:border-line md:dark:border-line-dark md:pl-5">
            <div className="flex items-baseline justify-between mb-2">
              <div className="text-sm font-medium">今日三餐</div>
              <span className="text-[11px] text-muted dark:text-muted-dark">
                {isTrainDay ? '按训练时段' : '三餐均分'} · 点开看食物
              </span>
            </div>
            <div className="space-y-1">
              {meals.map((meal, i) => {
                const name = parseMealName(meal);
                const ratio = mealRatio[name] ?? 0.2;
                const carbG = Math.round(todayCarbG * ratio);
                const proteinG = Math.round(todayProteinG * ratio);
                const kcal = (todayEat * ratio).toFixed(0);
                const isOpen = openMeal === i;
                const suggestions = isOpen ? suggestMealFoods(name as MealType, carbG, proteinG) : null;
                return (
                  <div key={i} className="border-b border-line dark:border-line-dark last:border-0">
                    <button
                      onClick={() => setOpenMeal(isOpen ? null : i)}
                      className="w-full flex items-center gap-2.5 py-2 text-left hover:bg-black/[0.02] dark:hover:bg-white/[0.02] rounded-btn px-1 transition-colors"
                    >
                      <span className="text-base shrink-0">
                        {name === '早餐' ? '🌅' : name === '练后餐' ? '🏋' : name === '午餐' ? '🍚' : name === '晚餐' ? '🌙' : '🍎'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{meal}</div>
                        <div className="text-[11px] text-muted dark:text-muted-dark tnum">
                          碳水 {carbG}g · 蛋白 {proteinG}g
                        </div>
                      </div>
                      <div className="tnum text-sm font-bold" style={{ color: COLORS.gold }}>
                        {kcal}
                      </div>
                      <span className="text-muted dark:text-muted-dark text-xs shrink-0">{isOpen ? '▴' : '▾'}</span>
                    </button>
                    {isOpen && suggestions && (
                      <div className="pb-2.5 pl-7 pr-1 space-y-2">
                        {suggestions.carb.length > 0 && (
                          <div>
                            <div className="text-[11px] font-medium mb-1" style={{ color: COLORS.carb }}>碳水 · 任选其一</div>
                            <div className="flex flex-wrap gap-1">
                              {suggestions.carb.map((c, j) => (
                                <span key={j} className="chip text-[11px]" style={{ backgroundColor: `${COLORS.carb}1a`, color: COLORS.carb }}>
                                  {c.name} <b className="tnum mx-0.5">{c.amount}{c.unit}</b>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {suggestions.protein.length > 0 && proteinG > 0 && (
                          <div>
                            <div className="text-[11px] font-medium mb-1" style={{ color: COLORS.protein }}>蛋白 · 任选其一</div>
                            <div className="flex flex-wrap gap-1">
                              {suggestions.protein.map((p, j) => (
                                <span key={j} className="chip text-[11px]" style={{ backgroundColor: `${COLORS.protein}1a`, color: COLORS.protein }}>
                                  {p.name} <b className="tnum mx-0.5">{p.amount}{p.unit}</b>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-muted dark:text-muted-dark mt-2 pt-2">
              💡 克数为建议分配，按饥饿感微调；蔬菜不限量，水果计入碳水
            </p>
          </div>
        </div>
      </Card>

      {/* 今日训练 */}
      {isTrainDay ? (
        <Card>
          <SectionTitle hint={`${todayTraining?.count ?? 0} 个动作`}>今天练什么</SectionTitle>
          {todayTraining ? (
            <div>
              <div className="text-lg font-bold mb-3 text-gold dark:text-gold-dark">
                {todayTraining.dayName.replace(/^Day\d+[：:]?/, '')}
              </div>
              <div className="space-y-2 mb-3">
                {todayTraining.parts.map((p, pi) => {
                  const isOpen = openPart === pi;
                  return (
                    <div key={p.name} className="rounded-btn border border-line dark:border-line-dark overflow-hidden">
                      <button
                        onClick={() => setOpenPart(isOpen ? null : pi)}
                        className="w-full bg-black/[0.02] dark:bg-white/[0.03] p-2.5 flex gap-2.5 items-center text-left hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors"
                      >
                        {p.image && (
                          <img
                            src={p.image}
                            alt=""
                            className="w-12 h-12 object-contain rounded-md bg-white shrink-0 border border-line dark:border-line-dark"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-sm truncate">{p.name.replace(/\n.*$/, '')}</div>
                          <div className="text-xs text-muted dark:text-muted-dark tnum mt-0.5">
                            {p.exerciseCount} 动作 · {p.sets}
                          </div>
                        </div>
                        <span className="text-muted dark:text-muted-dark text-xs shrink-0">{isOpen ? '▴' : '▾'}</span>
                      </button>
                      {isOpen && (
                        <div className="p-2.5 pt-2 space-y-1.5">
                          {p.exercises.map((ex, ei) => (
                            <div key={ei} className="flex items-baseline gap-2 text-sm">
                              <span className="text-gold dark:text-gold-dark shrink-0">·</span>
                              <span className="font-medium">{ex.name}</span>
                              {ex.joint && (
                                <span className="text-[11px] text-muted dark:text-muted-dark ml-auto text-right">
                                  {ex.joint}
                                </span>
                              )}
                            </div>
                          ))}
                          <div className="text-[11px] text-muted dark:text-muted-dark pt-1">
                            💡 任选 1-2 个动作，组数见上
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <button onClick={() => navigate('/library/training')} className="btn btn-ghost text-sm w-full">
                查看今日动作详情 →
              </button>
            </div>
          ) : (
            <div className="text-sm text-muted dark:text-muted-dark">暂无训练计划</div>
          )}
        </Card>
      ) : (
        <Card>
          <SectionTitle>休息日</SectionTitle>
          <p className="text-sm text-muted dark:text-muted-dark leading-relaxed">
            休息日不力训，按上面的营养素吃即可。脂肪和蛋白同训练日，碳水略低。可以做轻度活动或拉伸恢复。
          </p>
          <button onClick={() => navigate('/library')} className="btn btn-ghost text-sm mt-3">
            去拉伸图库 →
          </button>
        </Card>
      )}

      {/* 计算原理 - 折叠 */}
      <Card>
        <button onClick={() => setShowDetail(!showDetail)} className="w-full flex items-center justify-between">
          <span className="text-sm font-medium text-muted dark:text-muted-dark">计算原理 & 完整数据</span>
          <span className="text-muted dark:text-muted-dark">{showDetail ? '▴' : '▾'}</span>
        </button>
        {showDetail && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Metric label="基础代谢" value={result.bmr.toFixed(0)} unit="kcal" sub="Mifflin-St Jeor" />
              <Metric label="无运动消耗" value={result.noExerciseBurn.toFixed(0)} unit="kcal" />
              <Metric label="力训消耗" value={result.trainBurn} unit="kcal" sub={profile.trainLevel} />
              <Metric label="有氧消耗" value={result.cardioBurn.toFixed(0)} unit="kcal/日" color={COLORS.gold} />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-line dark:border-line-dark">
              <Metric label="训练日应吃" value={result.trainDayEat.toFixed(0)} unit="kcal" color={COLORS.carb} />
              <Metric label="休息日应吃" value={result.restDayEat.toFixed(0)} unit="kcal" />
            </div>
            <div className="text-xs text-muted dark:text-muted-dark pt-2 leading-relaxed">
              系数 {result.eatFactor}（减脂0.64/增肌0.84）· 训练日扣脂肪后64%碳水/36%蛋白 · 配额 {result.trainCarbPerKg}+{result.trainProteinPerKg} g/kg
            </div>
            <button onClick={() => navigate('/plan')} className="btn btn-ghost text-sm w-full">
              前往方案页调整 →
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
