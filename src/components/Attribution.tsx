/**
 * 原创致谢页脚（常驻所有页面底部，不随内容滚动）
 * 本站内容基于 B站 @好人松松 分享的健身套表生成
 */
const BILIBILI = 'https://space.bilibili.com/2078781964?spm_id_from=333.337.0.0';

export function Attribution() {
  return (
    <footer className="shrink-0 border-t border-line dark:border-line-dark bg-bg/60 dark:bg-bg-dark/60">
      <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-center gap-1 text-[11px] text-muted dark:text-muted-dark">
        <span>本站内容基于</span>
        <a
          href={BILIBILI}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold dark:text-gold-dark font-medium hover:underline"
        >
          B站 @好人松松
        </a>
        <span>分享的健身套表生成 · 尊重原创</span>
        <a
          href={BILIBILI}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold dark:text-gold-dark hover:opacity-70 transition-opacity"
          title="访问原博主主页"
        >
          ↗
        </a>
      </div>
    </footer>
  );
}
