import { useMemo, useState } from 'react';
import anatomy from '../data/anatomy.json';
import mediaAssets from '../data/mediaAssets.json';
import { Card, Chip, COLORS, SectionTitle, PageHeader } from '../components/ui';

type Filter = '全部' | '拉伸' | '解剖图示';

const filterToCategory: Record<Exclude<Filter, '全部'>, string> = {
  拉伸: 'stretch',
  解剖图示: 'anatomy',
};

const prettyName = (name: string, index: number) => {
  const labels = [
    '肩胸拉伸',
    '上背拉伸',
    '手臂拉伸',
    '髋腿拉伸',
    '关节活动图',
    '肌肉活动图',
  ];
  return `${labels[index % labels.length]} · ${name.replace(/\.(png|jpe?g)$/i, '')}`;
};

export function GalleryPage() {
  const [filter, setFilter] = useState<Filter>('全部');
  const [selected, setSelected] = useState<string | null>(null);

  const assets = useMemo(() => {
    return mediaAssets.filter((asset) => {
      if (asset.category === 'source') return false;
      if (filter === '全部') return true;
      return asset.category === filterToCategory[filter];
    });
  }, [filter]);

  const preview = selected ?? assets[0]?.path;

  return (
    <div className="space-y-5">
      <div>
        <PageHeader
          title="图例库"
          desc="套表里的拉伸图、关节活动图和肌肉活动图 · 用来补足训练计划的视觉参考"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(['全部', '拉伸', '解剖图示'] as Filter[]).map((item) => (
          <Chip key={item} active={filter === item} onClick={() => setFilter(item)} color={COLORS.gold}>
            {item}
          </Chip>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_1.45fr] gap-5">
        <Card>
          <SectionTitle hint={`${(anatomy as typeof anatomy).jointActions.length} 条`}>解剖关系</SectionTitle>
          <div className="max-h-[680px] overflow-auto pr-1 divide-y divide-line dark:divide-line-dark">
            {anatomy.jointActions.map((item) => (
              <article key={`${item.joint}-${item.action}`} className="py-3 first:pt-0">
                <h3 className="font-bold text-base">{item.joint} · {item.action}</h3>
                <p className="text-sm text-muted dark:text-muted-dark mt-1">
                  {item.description}
                  {item.example ? ` · ${item.example}` : ''}
                </p>
                <p className="text-sm text-gold dark:text-gold-dark mt-2">{item.muscles.join(' / ')}</p>
              </article>
            ))}
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="!p-3">
            {preview ? (
              <img
                src={preview}
                alt=""
                className="w-full rounded-card border border-line dark:border-line-dark bg-white object-contain max-h-[620px]"
              />
            ) : (
              <div className="h-80 grid place-items-center text-muted dark:text-muted-dark">暂无图片</div>
            )}
          </Card>

          <div className="grid sm:grid-cols-2 gap-3">
            {assets.map((asset, index) => (
              <button
                key={asset.path}
                onClick={() => setSelected(asset.path)}
                className={`card !p-2 text-left overflow-hidden transition ${
                  preview === asset.path ? 'ring-2 ring-gold dark:ring-gold-dark' : ''
                }`}
              >
                <img src={asset.path} alt="" className="w-full aspect-[4/3] object-contain bg-white rounded-btn" />
                <div className="px-2 py-2">
                  <div className="text-sm font-bold">{prettyName(asset.name, index)}</div>
                  <div className="text-xs text-muted dark:text-muted-dark mt-0.5">
                    {asset.category === 'stretch' ? '拉伸图例' : '解剖图示'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
