/* ------------------------------------------------------------------ */
/* 分页引擎 —— 移植 MujiCV 开源实现（github.com/hua1995116/            */
/* react-resume-site，分页核心为其依赖 rs-md-html-parser@0.1.9 的       */
/* htmlParser 函数）：                                                 */
/*  1. 块收集：P/SVG/分栏容器直接含文本节点即为叶子块，纯元素容器下探；  */
/*     LI 整块收集（内嵌 UL 下探），无元素子节点的元素整块收集；         */
/*  2. 贪心装页：块底距页底不足 20px 时整块推至下一页（页尾安全区）；    */
/*     跨越页底的块整体移入下一页 —— 永不在块中间断开；超长块逐页铺开；  */
/*  3. 每页渲染 = 整份内容完整克隆 + translateY 上移 + overflow 裁切；   */
/*     非本页的块透明抹除，防止相邻页内容探入本页可视区。                */
/* ------------------------------------------------------------------ */

export interface Pagination {
  offsets: number[];
  /** 每个块所属的页下标区间 [from, to]（超长块可跨页，from < to） */
  blockPages: Array<[number, number]>;
}

/** 页尾安全区：块底距页底不足该值时整块推至下一页（与开源实现一致） */
export const BOTTOM_SLACK_PX = 20;

/** 收集分页候选块（DOM 顺序，规则与开源 htmlParser 的块收集函数一致）：
 *  - P/SVG/分栏容器：直接包含文本节点即为叶子块，纯元素容器则递归下探；
 *  - LI：整块收集，其内嵌 UL 递归下探继续收集；
 *  - 其余元素：含元素子节点则下探，否则整块收集 */
export function collectBlocks(root: Element): Element[] {
  const out: Element[] = [];
  const visit = (el: Element): void => {
    for (const child of Array.from(el.children)) {
      const tag = child.tagName.toUpperCase();
      const leafish =
        tag === 'P' || tag === 'SVG' || child.classList.contains('resume-cols');
      if (leafish) {
        if (child.childNodes.length !== child.children.length) out.push(child);
        else visit(child);
      } else if (tag === 'LI') {
        out.push(child);
        const nested = Array.from(child.children).find((c) => c.tagName === 'UL');
        if (nested) visit(nested);
      } else if (child.children.length > 0) {
        visit(child);
      } else {
        out.push(child);
      }
    }
  };
  visit(root);
  return out;
}

/** 块级贪心分页（整块装页，与开源 htmlParser 的装页规则一致）：
 *  tops/bottoms 为各块顶/底相对排版源顶部的坐标(px)，capacity 为每页
 *  内容窗口高度。返回每页窗口顶部坐标与各块所属页区间。 */
export function paginate(
  tops: number[],
  bottoms: number[],
  totalHeight: number,
  capacity: number,
): Pagination {
  if (totalHeight <= 0 || tops.length === 0) return { offsets: [0], blockPages: [] };
  const offsets: number[] = [0];
  const blockPages: Array<[number, number]> = [];
  let filled = 0; // 当前页窗口顶部（内容坐标）
  let fillTo = 0; // 当前页最后一块的底部
  let page = 0; // 当前页下标
  for (let i = 0; i < tops.length; i++) {
    const top = tops[i];
    const bottom = bottoms[i];
    if (bottom - filled < capacity - BOTTOM_SLACK_PX && top >= filled) {
      // 放得下且不贴页尾：留在当前页（开源 case 2）
      blockPages.push([page, page]);
      if (bottom > fillTo) fillTo = bottom;
      continue;
    }
    // 放不下 / 贴近页尾 / 跨越页底：整块推至下一页，永不在块中间断开
    // （开源 case 1/3）
    let next = fillTo > filled ? fillTo : filled;
    // 前有整页级空白：新页直接以块起点开始（开源 case 4）
    if (top - next > capacity + 0.5) next = top;
    if (next > filled) {
      offsets.push(next);
      filled = next;
      page += 1;
    }
    fillTo = filled;
    const from = page;
    // 块自身超过一整页：按整页逐页铺开，剩余部分留在当前页继续
    while (bottom - filled > capacity + 0.5) {
      filled += capacity;
      offsets.push(filled);
      page += 1;
    }
    blockPages.push([from, page]);
    if (bottom > fillTo) fillTo = bottom;
  }
  // 每次换页时新页起点均已入队（首页起点 0 初始化即入队），
  // 故循环结束后 offsets 已包含全部页起点，无需再补
  return { offsets, blockPages };
}
