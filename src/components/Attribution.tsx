/**
 * 原创致谢页脚（常驻所有页面底部）
 * 本站内容基于 B站 @好人松松 分享的健身套表生成
 */
const BILIBILI = 'https://space.bilibili.com/2078781964?spm_id_from=333.337.0.0';

export function Attribution() {
  return (
    <footer className="mt-6 pt-4 border-t border-line dark:border-line-dark text-center">
      <div className="text-xs text-muted dark:text-muted-dark leading-relaxed">
        本站所有内容基于{' '}
        <a
          href={BILIBILI}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold dark:text-gold-dark font-medium hover:underline"
        >
          B站 @好人松松
        </a>{' '}
        分享的健身套表生成 · 尊重原创
      </div>
      <a
        href={BILIBILI}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 mt-1.5 text-[11px] text-muted dark:text-muted-dark hover:text-gold dark:hover:text-gold-dark transition-colors"
      >
        访问原博主主页 ↗
      </a>
    </footer>
  );
}
