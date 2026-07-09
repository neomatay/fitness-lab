import { useState, useMemo } from 'react';
import exercises from '../data/exercises.json';
import mediaAssets from '../data/mediaAssets.json';
import { Card, SectionTitle, Chip, COLORS, PageHeader } from '../components/ui';

const PLANS = ['三分化', '四分化肩单练', '四分化臂单练', '居家'] as const;
type Plan = (typeof PLANS)[number];

const PLAN_LABEL: Record<Plan, string> = {
  三分化: '健身房三分化',
  四分化肩单练: '四分化·肩单练',
  四分化臂单练: '四分化·臂单练',
  居家: '居家三分化',
};

const DAY_IMAGE_HINTS = [
  { match: ['背', '肩后束', '肱二头'], asset: 'image18.png', title: '关节活动总览' },
  { match: ['胸', '肩前', '肱三头'], asset: 'image30.png', title: '肩关节活动' },
  { match: ['腿', '臀', '腹'], asset: 'image35.png', title: '下肢活动图示' },
  { match: ['肩'], asset: 'image31.png', title: '肩部肌肉活动' },
  { match: ['手臂'], asset: 'image32.png', title: '手臂动作图示' },
];

function imageForDay(day: string) {
  const hint = DAY_IMAGE_HINTS.find((item) => item.match.some((word) => day.includes(word))) ?? DAY_IMAGE_HINTS[0];
  const asset = mediaAssets.find((item) => item.name === hint.asset) ?? mediaAssets.find((item) => item.category === 'anatomy');
  return { src: asset?.path ?? '', title: hint.title };
}

function jointTags(exercise: (typeof exercises)[number]) {
  return [exercise.shoulder, exercise.elbow].filter(Boolean).join(' / ');
}

export function TrainingPage() {
  const [plan, setPlan] = useState<Plan>('三分化');

  const data = useMemo(() => exercises.filter((e) => e.plan === plan), [plan]);
  const days = useMemo(() => Array.from(new Set(data.map((e) => e.day))), [data]);

  return (
    <div className="space-y-5">
      <div>
        <PageHeader title="训练计划" desc="4种分化方案的动作库 · 加入套表解剖图示，避免只看文字硬练" />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {PLANS.map((p) => (
          <Chip key={p} active={plan === p} onClick={() => setPlan(p)} color={COLORS.gold}>
            {PLAN_LABEL[p]}
          </Chip>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="grid lg:grid-cols-[1fr_1.15fr] gap-5 items-center">
          <div>
            <SectionTitle hint="图例已接入">怎么读训练计划</SectionTitle>
            <p className="text-sm leading-relaxed text-muted dark:text-muted-dark">
              左边选分化，下面每个训练日按部位分组。每个动作后面的标签是关节活动，配合右侧图示理解“练的是哪条运动链”，比单纯背动作名更不容易乱。
            </p>
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="rounded-btn bg-black/5 dark:bg-white/5 p-3">
                <div className="text-lg font-bold tnum">{days.length}</div>
                <div className="text-xs text-muted dark:text-muted-dark">训练日</div>
              </div>
              <div className="rounded-btn bg-black/5 dark:bg-white/5 p-3">
                <div className="text-lg font-bold tnum">{data.length}</div>
                <div className="text-xs text-muted dark:text-muted-dark">动作</div>
              </div>
              <div className="rounded-btn bg-black/5 dark:bg-white/5 p-3">
                <div className="text-lg font-bold tnum">{new Set(data.map((e) => e.part)).size}</div>
                <div className="text-xs text-muted dark:text-muted-dark">部位</div>
              </div>
            </div>
          </div>
          <img
            src={imageForDay(days[0] ?? '').src}
            alt=""
            className="w-full max-h-80 object-contain rounded-card bg-white border border-line dark:border-line-dark"
          />
        </div>
      </Card>

      {days.map((day, dayIndex) => {
        const dayExercises = data.filter((e) => e.day === day);
        const parts = Array.from(new Set(dayExercises.map((e) => e.part)));
        const dayImage = imageForDay(day);
        return (
          <Card key={day} className="!p-0 overflow-hidden">
            <div className="grid lg:grid-cols-[310px_1fr]">
              <aside className="bg-black/[0.03] dark:bg-white/[0.03] border-b lg:border-b-0 lg:border-r border-line dark:border-line-dark p-4">
                <div className="text-xs text-muted dark:text-muted-dark mb-1">Day {dayIndex + 1}</div>
                <h2 className="text-xl font-bold tracking-tight">{day.replace(/^Day\d+：?/, '')}</h2>
                <div className="text-xs text-gold dark:text-gold-dark mt-2">{dayImage.title}</div>
                <img
                  src={dayImage.src}
                  alt=""
                  className="w-full aspect-[4/3] object-contain rounded-btn bg-white border border-line dark:border-line-dark mt-4"
                />
                <p className="text-xs text-muted dark:text-muted-dark leading-relaxed mt-3">
                  动作不需要全做，按组数提示选 1-2 个动作即可；害怕受伤时优先选器械或更稳定的动作。
                </p>
              </aside>

              <div className="p-4 md:p-5">
                <SectionTitle hint={`${dayExercises.length} 个动作`}>{day}</SectionTitle>
                <div className="space-y-5">
                  {parts.map((part) => {
                    const partEx = dayExercises.filter((e) => e.part === part);
                    const group = partEx[0]?.group?.replace(/\n/g, ' · ') || '';
                    return (
                      <section key={part}>
                        <div className="flex flex-wrap items-baseline gap-2 mb-2">
                          <span className="font-bold text-gold dark:text-gold-dark">{part}</span>
                          {group && <span className="text-xs text-muted dark:text-muted-dark">{group}</span>}
                        </div>
                        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-2">
                          {partEx.map((e, i) => (
                            <article
                              key={i}
                              className="rounded-btn border border-line dark:border-line-dark bg-card dark:bg-card-dark p-3 min-h-[92px]"
                            >
                              <div className="font-semibold text-sm leading-snug">{e.name}</div>
                              {jointTags(e) && (
                                <div className="text-xs text-muted dark:text-muted-dark mt-2 leading-relaxed">
                                  {jointTags(e)}
                                </div>
                              )}
                            </article>
                          ))}
                        </div>
                      </section>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>
        );
      })}

      <Card>
        <SectionTitle hint="完整图例在图库页">相关图例</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {mediaAssets
            .filter((asset) => asset.category === 'stretch' || asset.category === 'anatomy')
            .slice(0, 8)
            .map((asset) => (
              <img
                key={asset.path}
                src={asset.path}
                alt=""
                className="w-full aspect-[4/3] object-contain rounded-btn bg-white border border-line dark:border-line-dark"
              />
            ))}
        </div>
      </Card>

      <p className="text-xs text-muted dark:text-muted-dark px-1">
        💡 组数偏多可酌减；多关节动作组间休息2-3分钟，单关节1-2分钟。新手用三分化，有基础用三或四分化。
      </p>
    </div>
  );
}
