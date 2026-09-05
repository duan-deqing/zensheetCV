import { DocBlock, DocSectionHeader, DocsLayout } from '../DocsLayout';
import { useTr, type Bi } from '@/i18n/LangContext';
import { DocPageLink } from './shared';

/* ============ 01 使用指南 ============ */

const QUICK_STEPS: { no: string; title: Bi; desc: Bi }[] = [
  { no: 'STEP 1', title: { zh: '打开即用', en: 'Open and Use' }, desc: { zh: '免注册登录，打开网站即可使用，默认用户名为 ZENSHEET；简历与配置仅保存在当前浏览器本地。点击导航栏用户名打开设置，可自定义用户名。', en: 'No sign-up required — open the site and start working. Your default username is ZENSHEET; resumes and settings are stored only in your current browser. Click your username in the navbar to open Settings and customize it.' } },
  { no: 'STEP 2', title: { zh: '创建简历', en: 'Create a Resume' }, desc: { zh: '进入「我的简历」页面，点击新建简历，会得到一份示例内容，随后在编辑器中替换为自己的经历。', en: 'Go to "My Resumes" and click New Resume. A sample resume is created for you — replace it with your own experience in the editor.' } },
  { no: 'STEP 3', title: { zh: '编辑内容', en: 'Edit Content' }, desc: { zh: '左侧为 Markdown 编辑器，右侧实时预览。使用标题、列表、分栏等语法组织内容，详见《Markdown 简历教程》。', en: 'Write Markdown on the left and preview live on the right. Organize content with headings, lists, columns and more — see the Markdown Resume Tutorial.' } },
  { no: 'STEP 4', title: { zh: '调样式并导出', en: 'Style & Export' }, desc: { zh: '通过「主题」面板选择模板与视觉风格；完成后点击「导出 PDF」——桌面与主流手机浏览器在打印窗口中「另存为 PDF」，逐页与预览一致；微信等内置浏览器会自动改用本机生成 PDF 并下载 / 分享。手机端各浏览器的差异详见下方「手机端导出注意事项」。', en: 'Pick a template and visual style in the Theme panel, then click "Export PDF" — on desktop and mainstream mobile browsers, choose "Save as PDF" in the print dialog and every page matches the preview; in in-app browsers like WeChat, a PDF is generated on-device automatically for download or sharing. See "Mobile Export Notes" below for browser-specific differences.' } },
];

const GUIDE_LINKS: { to: string; no: string; title: Bi; desc: Bi }[] = [
  { to: '/docs/markdown', no: '02', title: { zh: 'Markdown 简历教程', en: 'Markdown Resume Tutorial' }, desc: { zh: '标题、强调、列表、引用、分栏等常用语法与效果预览', en: 'Common syntax — headings, emphasis, lists, quotes, columns — with live previews' } },
  { to: '/docs/theme', no: '03', title: { zh: '主题配置', en: 'Theme Settings' }, desc: { zh: '模板切换、视觉风格与页面布局的各项设置与注意事项', en: 'Template switching, visual style and page layout options & notes' } },
  { to: '/docs/icons', no: '04', title: { zh: '图标库', en: 'Icon Library' }, desc: { zh: 'icon:语法、图标库的使用方式与常用图标一览', en: 'The icon: syntax, how to use the library, and all built-in icons' } },
  { to: '/docs/ai', no: '05', title: { zh: 'AI 助手', en: 'AI Assistant' }, desc: { zh: '润色、关键词分析、要点成段，以及 API KEY 的获取与配置', en: 'Polishing, keyword analysis, bullet expansion, and API KEY setup' } },
];

/** 使用指南正文（文档页与编辑器抽屉共用） */
export function GuideContent() {
  const tr = useTr();
  return (
    <>
      <DocBlock title={tr({ zh: '快速开始', en: 'Quick Start' })} desc={tr({ zh: '四步完成第一份简历：', en: 'Create your first resume in four steps:' })}>
        <ol className="flex flex-col gap-4">
          {QUICK_STEPS.map((s) => (
            <li key={s.no} className="flex gap-4 rounded-xl border border-gray-200 p-4">
              <span className="font-mono text-[11px] uppercase tracking-widest text-primary-600 shrink-0 pt-0.5">
                {s.no}
              </span>
              <div>
                <p className="font-medium text-gray-900">{tr(s.title)}</p>
                <p className="text-[13px] text-gray-500 leading-relaxed mt-1">{tr(s.desc)}</p>
              </div>
            </li>
          ))}
        </ol>
      </DocBlock>

      <DocBlock title={tr({ zh: '编辑器布局', en: 'Editor Layout' })} desc={tr({ zh: '编辑页面自左向右分为四个区域，均可拖拽中间的分隔手柄调整宽度：', en: 'The editor page has four areas from left to right; drag the divider handles to resize them:' })}>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { t: { zh: '编辑器', en: 'Editor' }, d: { zh: 'Markdown 源码编辑区，工具栏提供模板库、照片、图标、文档等快捷入口', en: 'Markdown source editor with a toolbar for quick access to templates, photos, icons and docs' } },
            { t: { zh: '实时预览', en: 'Live Preview' }, d: { zh: 'A4 纸张逐页渲染，与导出 PDF 效果一致；顶栏可缩放与全屏', en: 'Page-by-page A4 rendering identical to the exported PDF; zoom and fullscreen on the toolbar' } },
            { t: { zh: '主题面板', en: 'Theme Panel' }, d: { zh: '点击预览顶栏「主题」打开，切换模板、配色、字体与页边距', en: 'Open via "Theme" on the preview toolbar — switch templates, colors, fonts and margins' } },
            { t: { zh: 'AI 聊天窗', en: 'AI Chat' }, d: { zh: '点击顶栏「AI 助手」在预览右侧展开，支持流式回复与历史记录', en: 'Click "AI Assistant" on the toolbar to open beside the preview; streaming replies and history supported' } },
          ].map((item) => (
            <div key={tr(item.t)} className="rounded-xl border border-gray-200 p-4">
              <p className="font-medium text-gray-900 text-sm">{tr(item.t)}</p>
              <p className="text-[13px] text-gray-500 leading-relaxed mt-1">{tr(item.d)}</p>
            </div>
          ))}
        </div>
      </DocBlock>

      <DocBlock title={tr({ zh: '手机端导出注意事项', en: 'Mobile Export Notes' })} desc={tr({ zh: '手机浏览器环境差异较大，导出 PDF 前请先了解：', en: 'Mobile browsers vary widely — a few things to know before exporting PDF:' })}>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { t: { zh: '推荐环境', en: 'Recommended' }, d: { zh: '安卓推荐 Chrome，iOS 推荐 Safari：走系统打印生成矢量 PDF，文字清晰、体积小，逐页与预览一致。', en: 'Chrome on Android and Safari on iOS are recommended: they use system printing to produce vector PDFs — sharp text, small size, every page identical to the preview.' } },
            { t: { zh: '微信 / QQ 内置浏览器', en: 'In-App Browsers' }, d: { zh: '微信、QQ 等内置浏览器无法调起打印，打开页面时会弹窗提醒；导出时自动改用截图合成 PDF，完成后可下载或唤起系统分享。', en: 'In-app browsers like WeChat and QQ cannot open the print dialog and will show a reminder on open. Exporting falls back to assembling a PDF from snapshots, then downloads or shares via the system.' } },
            { t: { zh: '其他第三方浏览器', en: 'Other Browsers' }, d: { zh: 'iOS 的第三方浏览器与安卓国产浏览器（UC、夸克、小米等）同样自动降级为截图合成 PDF；折叠菜单「导出 PDF」旁的「?」可随时查看提示并复制链接。', en: 'Third-party iOS browsers and Android domestic browsers (UC, Quark, Xiaomi, etc.) also fall back to snapshot-based PDFs. The "?" next to "Export PDF" in the folded menu shows the hint and lets you copy the link anytime.' } },
            { t: { zh: '长简历提醒', en: 'Long Resumes' }, d: { zh: '截图方案逐页生成，页数越多耗时越长；超过 6 页时会自动降低截图精度以平衡速度与体积。长简历建议优先使用 Chrome / Safari 或电脑端导出。', en: 'Snapshot-based export renders page by page — more pages mean longer waits; over 6 pages, snapshot precision is reduced automatically. For long resumes, prefer Chrome / Safari or desktop.' } },
          ].map((item) => (
            <div key={tr(item.t)} className="rounded-xl border border-gray-200 p-4">
              <p className="font-medium text-gray-900 text-sm">{tr(item.t)}</p>
              <p className="text-[13px] text-gray-500 leading-relaxed mt-1">{tr(item.d)}</p>
            </div>
          ))}
        </div>
      </DocBlock>

      <DocBlock title={tr({ zh: '数据保存与隐私', en: 'Data & Privacy' })} desc={tr({ zh: '免登录版不设账号体系，你的数据只属于你：', en: 'The login-free edition has no account system — your data belongs to you alone:' })}>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { t: { zh: '本地存储', en: 'Local Storage' }, d: { zh: '简历与 AI 对话历史保存在浏览器的 IndexedDB 中，不经过任何服务器；模型密钥同样仅保存在本地。', en: 'Resumes and AI chat history live in your browser\'s IndexedDB — never on a server. Model API keys are also stored locally only.' } },
            { t: { zh: '隐私模式', en: 'Private Mode' }, d: { zh: '无痕 / 隐私模式下数据仅暂存在内存，关闭窗口后即清空，请注意提前导出 PDF 备份。', en: 'In incognito / private mode, data lives in memory only and is wiped when the window closes — export PDF backups in advance.' } },
            { t: { zh: '数量上限', en: 'Limit' }, d: { zh: '每个浏览器最多保存 15 份简历，超出后可删除不需要的简历再新建。', en: 'Each browser keeps up to 15 resumes; delete ones you no longer need to create new ones.' } },
            { t: { zh: '换设备提醒', en: 'Across Devices' }, d: { zh: '数据绑定当前浏览器，更换设备或浏览器后不会自动同步；建议养成定期导出 PDF 的习惯。', en: 'Data is bound to the current browser and won\'t sync across devices or browsers. Make a habit of exporting PDFs regularly.' } },
          ].map((item) => (
            <div key={tr(item.t)} className="rounded-xl border border-gray-200 p-4">
              <p className="font-medium text-gray-900 text-sm">{tr(item.t)}</p>
              <p className="text-[13px] text-gray-500 leading-relaxed mt-1">{tr(item.d)}</p>
            </div>
          ))}
        </div>
      </DocBlock>

      <DocBlock title={tr({ zh: '进阶教程', en: 'Advanced Tutorials' })} desc={tr({ zh: '完成基础流程后，按需阅读以下教程：', en: 'After the basics, read these as needed:' })}>
        <div className="grid sm:grid-cols-2 gap-3">
          {GUIDE_LINKS.map((l) => (
            <DocPageLink
              key={l.to}
              to={l.to}
              className="group text-left rounded-xl border border-gray-200 p-4 hover:border-primary-300 hover:bg-primary-50/40 transition-all"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400">
                {l.no}
              </p>
              <p className="font-medium text-gray-900 text-sm mt-1 group-hover:text-primary-700 transition-colors">
                {tr(l.title)} →
              </p>
              <p className="text-[13px] text-gray-500 leading-relaxed mt-1">{tr(l.desc)}</p>
            </DocPageLink>
          ))}
        </div>
      </DocBlock>
    </>
  );
}

export function GuidePage() {
  const tr = useTr();
  return (
    <DocsLayout>
      <DocSectionHeader
        no="01 · GUIDE"
        title={tr({ zh: '使用指南', en: 'Guide' })}
        desc={tr({ zh: '本页介绍从创建简历到导出 PDF 的完整使用流程，并汇总其余教程文档的入口。', en: 'The complete workflow from creating a resume to exporting PDF, plus links to all other tutorials.' })}
      />
      <GuideContent />
    </DocsLayout>
  );
}
