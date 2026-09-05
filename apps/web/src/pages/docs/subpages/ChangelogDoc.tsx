import { DocSectionHeader, DocsLayout } from '../DocsLayout';
import { useTr } from '@/i18n/LangContext';
import { CHANGELOG, STATIC_CHANGELOG, type ChangelogEntry } from '../data/changelog';

/** 单个分支的版本时间线，全栈版与免登录版共用 */
function ChangelogTimeline({ versions }: { versions: ChangelogEntry[] }) {
  const tr = useTr();
  return (
    <div className="flex flex-col gap-8">
      {versions.map((v, i) => (
        <section
          key={v.version}
          data-docs-reveal
          className="relative sm:ml-28 pl-6 border-l-2 border-gray-100"
        >
          {/* 时间信息：置于时间线圆点左侧（窄屏时回退到版本号右侧） */}
          <span className="hidden sm:block absolute top-0.5 -left-28 w-24 text-right font-mono text-sm text-gray-500 tabular-nums">
            {v.date}
          </span>
          <span className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-primary-500 ring-4 ring-primary-50" />
          <p className="font-mono text-sm text-primary-600 font-medium">
            {v.version}
            {/* 最新版本标记 NEW */}
            {i === 0 && (
              <span className="ml-2 inline-block align-[1px] rounded-full bg-primary-500 px-1.5 py-px font-sans text-[10px] font-semibold tracking-widest text-white">
                NEW
              </span>
            )}
            {/* 分支标识徽章（如：免登录版） */}
            {v.tag && (
              <span className="ml-2 inline-block align-[1px] rounded-full bg-emerald-500 px-1.5 py-px font-sans text-[10px] font-semibold tracking-widest text-white">
                {tr(v.tag)}
              </span>
            )}
            <span className="sm:hidden ml-2.5 text-gray-500 font-normal">{v.date}</span>
          </p>
          <p className="font-semibold text-gray-900 mt-1">{tr(v.title)}</p>
          <ul className="list-disc pl-5 mt-2 flex flex-col gap-1 text-[13px] text-gray-500 leading-relaxed">
            {v.items.map((it) => (
              <li key={it.zh}>{tr(it)}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export function ChangelogPage() {
  const tr = useTr();
  return (
    <DocsLayout>
      <DocSectionHeader no="CHANGELOG" title={tr({ zh: '更新日志', en: 'Changelog' })} desc={tr({ zh: 'ZENSHEET · 简历 的版本演进记录。', en: 'The version history of ZENSHEET · Resume.' })} />

      {/* 免登录在线版（static 分支）：版本号独立计数 */}
      <div data-docs-reveal className="mb-8">
        <h2 className="text-lg font-bold tracking-tight flex items-center gap-2.5">
          {tr({ zh: '免登录在线版', en: 'Login-free Web Edition' })}
          <span className="rounded-full bg-emerald-500 px-2 py-0.5 font-sans text-[10px] font-semibold tracking-widest text-white">
            {tr({ zh: '免登录版', en: 'Login-free' })}
          </span>
        </h2>
        <p className="text-[13px] text-gray-500 mt-1">
          {tr({ zh: '纯前端版本，无需注册登录、打开即用；版本号独立计数，不随全栈版演进。', en: 'A pure-frontend edition — no sign-up, open and use. Version numbers are counted independently of the full-stack edition.' })}
        </p>
      </div>
      <ChangelogTimeline versions={STATIC_CHANGELOG} />

      {/* 全栈版 */}
      <div data-docs-reveal className="mt-14 mb-8">
        <h2 className="text-lg font-bold tracking-tight">{tr({ zh: '全栈版', en: 'Full-stack Edition' })}</h2>
        <p className="text-[13px] text-gray-500 mt-1">
          {tr({ zh: '支持注册登录与账号体系的服务端版本，功能最完整。', en: 'The server-side edition with accounts and sign-in — the most feature-complete.' })}
        </p>
      </div>
      <ChangelogTimeline versions={CHANGELOG} />
    </DocsLayout>
  );
}
