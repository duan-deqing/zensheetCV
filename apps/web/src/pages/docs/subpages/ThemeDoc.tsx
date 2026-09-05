import { DocBlock, DocSectionHeader, DocsLayout } from '../DocsLayout';
import { useTr } from '@/i18n/LangContext';

/* ============ 03 主题配置 ============ */

/** 主题配置正文（文档页与编辑器抽屉共用） */
export function ThemeDocContent() {
  const tr = useTr();
  return (
    <>
      <DocBlock title={tr({ zh: '模板', en: 'Templates' })} desc={tr({ zh: '内置 8 套模板，以真实内容的预览卡片呈现，最多同屏 4 张，超出可滚动查看（带吸附）：', en: 'Eight built-in templates shown as preview cards with real content; up to 4 visible at once, scroll (with snap) for more:' })}>
        <div className="rounded-xl border border-gray-200 p-4 text-[13px] text-gray-600 leading-relaxed">
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>{tr({ zh: '切换模板只改变排版与配色，', en: 'Switching templates only changes layout and colors — ' })}<b>{tr({ zh: '简历内容始终保留', en: 'your resume content is always preserved' })}</b>{tr({ zh: '，可放心试遍所有模板。', en: ', so feel free to try every template.' })}</li>
            <li>{tr({ zh: '当前模板以主题色描边标识，点击卡片即完成切换。', en: 'The current template is highlighted with a themed border; click a card to switch.' })}</li>
          </ul>
        </div>
      </DocBlock>

      <DocBlock title={tr({ zh: '视觉风格', en: 'Visual Style' })} desc={tr({ zh: '六种主色调与五种正文字体，奠定简历的第一印象：', en: 'Six primary colors and five body fonts set the first impression of your resume:' })}>
        <div className="rounded-xl border border-gray-200 p-4 text-[13px] text-gray-600 leading-relaxed">
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>{tr({ zh: '主色影响标题、分隔线、图标等强调元素的配色。', en: 'The primary color drives accents — headings, dividers, icons and more.' })}</li>
          </ul>
        </div>
      </DocBlock>

      <DocBlock title={tr({ zh: '字号与行距', en: 'Font Size & Line Height' })} desc={tr({ zh: '独立分组精调排版：H1~H5、段落与列表字号分别可调，行距自由选择：', en: 'Fine-tuned typography in a dedicated group: H1–H5, paragraph and list sizes adjust separately, with free line-height choice:' })}>
        <div className="rounded-xl border border-gray-200 p-4 text-[13px] text-gray-600 leading-relaxed">
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>{tr({ zh: '字号按 H1 ~ H5、段落、列表分别设置（10 ~ 30 px，H1 可调至 40 px）：未调整的类别按默认字号渲染（H1 30 px、H2 20 px，其余 14 px），下拉中带「默认」标识；行距在 1.2 ~ 2.5 倍间选择，同时影响段落与条目的垂直留白，建议先选模板再微调。', en: 'Font sizes set separately for H1–H5, paragraphs and lists (10–30 px, H1 up to 40 px): untouched categories render at defaults (H1 30 px, H2 20 px, others 14 px) and are marked "Default" in the dropdowns. Line height ranges 1.2–2.5x and affects vertical spacing of paragraphs and items. Pick a template first, then fine-tune.' })}</li>
          </ul>
        </div>
      </DocBlock>

      <DocBlock
        title={tr({ zh: '页面布局', en: 'Page Layout' })}
        desc={tr({ zh: '左右与上下页边距独立可调（含「无」档位），另有内容边距控制正文与页面边缘的距离：', en: 'Horizontal and vertical page margins adjust independently (including "None"), plus a content padding controlling the gap between text and page edge:' })}
      >
        <div className="rounded-xl border border-gray-200 p-4 text-[13px] text-gray-600 leading-relaxed">
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>{tr({ zh: '页面留白 = 页边距 + 内容边距，两者叠加生效，导出 PDF 与预览严格一致。', en: 'Page whitespace = page margin + content padding; they stack, and the exported PDF matches the preview exactly.' })}</li>
            <li>{tr({ zh: '选择「无」页边距可获得整页出血式的排版自由度。', en: 'Choose "None" margins for full-bleed layout freedom.' })}</li>
          </ul>
        </div>
      </DocBlock>

      <DocBlock title={tr({ zh: '注意事项', en: 'Notes' })}>
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-[13px] text-amber-800 leading-relaxed">
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>{tr({ zh: '切换模板后，视觉风格与页面布局会重置为新模板的默认值，建议确定模板后再做微调。', en: 'Switching templates resets visual style and page layout to the new template\'s defaults — settle on a template before fine-tuning.' })}</li>
            <li>{tr({ zh: '主题面板为悬浮卡片，不影响预览内容的滚动；再次点击「主题」或按 Esc 可关闭。', en: 'The theme panel floats and never blocks preview scrolling; click "Theme" again or press Esc to close.' })}</li>
            <li>{tr({ zh: '所有改动实时保存到草稿，无需手动确认。', en: 'All changes save to the draft in real time — no manual confirmation needed.' })}</li>
          </ul>
        </div>
      </DocBlock>
    </>
  );
}

export function ThemeDocPage() {
  const tr = useTr();
  return (
    <DocsLayout>
      <DocSectionHeader
        no="03 · THEME"
        title={tr({ zh: '主题配置', en: 'Theme Settings' })}
        desc={tr({ zh: '点击预览窗口顶栏的「主题」按钮打开主题面板，分三组设置：模板、视觉风格与页面布局。', en: 'Click "Theme" on the preview toolbar to open the theme panel, organized into three groups: templates, visual style and page layout.' })}
      />
      <ThemeDocContent />
    </DocsLayout>
  );
}
