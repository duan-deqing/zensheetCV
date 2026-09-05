import { describe, it, expect } from 'vitest';
import { paginate, collectBlocks, BOTTOM_SLACK_PX } from '@/preview/pagination';

describe('paginate（块级贪心分页）', () => {
  it('空内容：单页、无块归属', () => {
    expect(paginate([], [], 0, 1000)).toEqual({ offsets: [0], blockPages: [] });
    expect(paginate([0], [100], 0, 1000)).toEqual({ offsets: [0], blockPages: [] });
  });

  it('单块放得下：留在首页', () => {
    expect(paginate([0], [500], 500, 1000)).toEqual({
      offsets: [0],
      blockPages: [[0, 0]],
    });
  });

  it('多块依次装页，页满整块推至下一页（永不在块中间断开）', () => {
    // capacity 1000：三块 [0,300][310,600][610,900] 均放得下；
    // 第四块 [910,1200] 底部越界，整块推至下一页（新页起点 = 前页最后一块底部 900）
    const tops = [0, 310, 610, 910];
    const bottoms = [300, 600, 900, 1200];
    expect(paginate(tops, bottoms, 1200, 1000)).toEqual({
      offsets: [0, 900],
      blockPages: [
        [0, 0],
        [0, 0],
        [0, 0],
        [1, 1],
      ],
    });
  });

  it(`块底距页底不足 ${BOTTOM_SLACK_PX}px（页尾安全区）时整块推至下一页`, () => {
    // 第二块底部 985，距页底(1000)仅 15px < 20px 安全区 → 推至下一页
    expect(paginate([0, 500], [490, 985], 985, 1000)).toEqual({
      offsets: [0, 490],
      blockPages: [
        [0, 0],
        [1, 1],
      ],
    });
    // 对照：底部 950 距页底 50px > 安全区 → 留在首页
    expect(paginate([0, 500], [490, 950], 950, 1000)).toEqual({
      offsets: [0],
      blockPages: [
        [0, 0],
        [0, 0],
      ],
    });
  });

  it('超长块逐页铺开（跨页块 from < to），剩余部分留在末页', () => {
    // 单块高 2500，capacity 1000 → 铺满第 0/1 页，剩余 500 留在第 2 页
    expect(paginate([0], [2500], 2500, 1000)).toEqual({
      offsets: [0, 1000, 2000],
      blockPages: [[0, 2]],
    });
  });

  it('跨页块之后的块按铺开位置归属末页', () => {
    // 块 0 跨页 [0,2]（至 2500），块 1 [2400,2450] 落在第 2 页窗口内
    expect(paginate([0, 2400], [2500, 2450], 2500, 1000)).toEqual({
      offsets: [0, 1000, 2000],
      blockPages: [
        [0, 2],
        [2, 2],
      ],
    });
  });

  it('块前有整页级空白：新页直接以块顶开始（跳过空白，不重铺空白）', () => {
    // 块 1 顶部 2500 距前页内容底(100)超过一整页 → 新页起点直接取块顶
    expect(paginate([0, 2500], [100, 2600], 2600, 1000)).toEqual({
      offsets: [0, 2500],
      blockPages: [
        [0, 0],
        [1, 1],
      ],
    });
  });

  it('块恰好放得下（边界）与恰好放不下（越界 0.5px 容差）', () => {
    // 底部恰为 capacity - slack：条件是严格小于 → 980 不满足 → 推至下一页
    expect(paginate([0, 500], [400, 980], 980, 1000)).toEqual({
      offsets: [0, 400],
      blockPages: [
        [0, 0],
        [1, 1],
      ],
    });
  });

  it('多页连续排布：offsets 单调递增且首块起点为 0', () => {
    const tops = [0, 350, 700, 1050, 1400, 1750, 2100];
    const bottoms = tops.map((t) => t + 300);
    const { offsets, blockPages } = paginate(tops, bottoms, 2400, 1000);
    // 每页装 2 块（第 2 块底部 650/1650 距页底 > 20 安全区；第 3 块越界推下页）
    expect(offsets).toEqual([0, 650, 1350, 2050]);
    expect(blockPages).toEqual([
      [0, 0],
      [0, 0],
      [1, 1],
      [1, 1],
      [2, 2],
      [2, 2],
      [3, 3],
    ]);
    for (let i = 1; i < offsets.length; i++) {
      expect(offsets[i]).toBeGreaterThan(offsets[i - 1]);
    }
  });
});

describe('collectBlocks（分页候选块收集）', () => {
  const collect = (html: string) => {
    document.body.innerHTML = `<div id="root">${html}</div>`;
    return collectBlocks(document.getElementById('root')!);
  };

  it('P 段落（含文本节点）为叶子块', () => {
    const blocks = collect('<p>hello</p><p>world</p>');
    expect(blocks.map((b) => b.tagName)).toEqual(['P', 'P']);
  });

  it('LI 整块收集，内嵌 UL 继续下探', () => {
    const blocks = collect(
      '<ul><li>外层<ul><li>内层</li></ul></li></ul>',
    );
    expect(blocks.map((b) => b.tagName)).toEqual(['LI', 'LI']);
    expect(blocks[0].textContent).toContain('外层');
    expect(blocks[1].textContent).toBe('内层');
  });

  it('分栏容器纯元素子节点时下探到各栏内容', () => {
    const blocks = collect(
      '<div class="resume-cols"><div>左栏</div><div>右栏</div></div>',
    );
    expect(blocks.map((b) => b.textContent)).toEqual(['左栏', '右栏']);
  });

  it('含文本节点的分栏容器整块收集', () => {
    const blocks = collect(
      '<div class="resume-cols">标题<div>左栏</div></div>',
    );
    expect(blocks).toHaveLength(1);
    expect(blocks[0].classList.contains('resume-cols')).toBe(true);
  });

  it('嵌套容器下探收集内层叶子块，无子元素的元素整块收集', () => {
    const blocks = collect(
      '<section><div><p>深层数</p></div></section><span>独立块</span>',
    );
    expect(blocks.map((b) => b.textContent)).toEqual(['深层数', '独立块']);
  });

  it('纯元素容器（如仅含 span 的 p）下探而非整块收集', () => {
    const blocks = collect('<p><span>仅元素子节点</span></p>');
    expect(blocks.map((b) => b.tagName)).toEqual(['SPAN']);
  });
});
