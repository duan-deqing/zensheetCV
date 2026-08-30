/**
 * :::left / :::mid / :::right 容器语法支持。
 *
 * 用法（三种容器连续书写时并排渲染为左中右三栏）：
 *
 *   :::left
 *   张三
 *   :::
 *
 *   :::mid
 *   前端工程师
 *   :::
 *
 *   :::right
 *   电话：138xxxx
 *   :::
 *
 * 实现分两步：
 * 1. normalizeColMarkers：在纯文本层面把 ::: 标记行前后补空行，
 *    保证标记在 AST 中总是独立段落（且不受内部内容影响）；
 * 2. remarkResumeCols：remark 插件把「标记段落 + 内容块 + 关闭标记」
 *    重写为带 data.hName 的自定义节点，remark-rehype 会将其渲染为
 *    <div class="resume-col resume-col-left"> 等元素（与 remark-directive 同机制）。
 */

const OPEN_RE = /^\s*:::(left|mid|right)\s*$/;
const CLOSE_RE = /^\s*:::\s*$/;
const FENCE_RE = /^\s*(```|~~~)/;

/** 在 ::: 标记行前后插入空行（跳过代码围栏内的内容），使标记成为独立段落 */
export function normalizeColMarkers(markdown: string): string {
  const lines = markdown.split('\n');
  const out: string[] = [];
  let inFence = false;
  for (const line of lines) {
    if (FENCE_RE.test(line)) inFence = !inFence;
    const isMarker = !inFence && (OPEN_RE.test(line) || CLOSE_RE.test(line));
    if (isMarker) {
      if (out.length > 0 && out[out.length - 1].trim() !== '') out.push('');
      out.push(line.trim());
      out.push('');
    } else {
      out.push(line);
    }
  }
  return out.join('\n');
}

/** 最小结构化节点类型，避免依赖 unified/mdast 类型包 */
interface MiniNode {
  type: string;
  value?: string;
  children?: MiniNode[];
  data?: {
    hName?: string;
    hProperties?: Record<string, unknown>;
  };
  [key: string]: unknown;
}

/** 标记段落检测：段落仅含一个文本子节点且整行匹配 */
function matchMarker(node: MiniNode | undefined, re: RegExp): RegExpMatchArray | null {
  if (!node || node.type !== 'paragraph') return null;
  const children = node.children ?? [];
  if (children.length !== 1 || children[0].type !== 'text') return null;
  return (children[0].value ?? '').trim().match(re);
}

function makeColNode(kind: string, inner: MiniNode[]): MiniNode {
  return {
    type: 'resumeCol',
    data: {
      hName: 'div',
      hProperties: { className: ['resume-col', `resume-col-${kind}`] },
    },
    children: inner,
  };
}

function makeRowNode(cols: MiniNode[]): MiniNode {
  return {
    type: 'resumeCols',
    data: {
      hName: 'div',
      hProperties: { className: ['resume-cols'] },
    },
    children: cols,
  };
}

/** remark 插件：把 ::: 容器重写为三栏布局节点，连续容器合并为一行 */
export function remarkResumeCols() {
  return (tree: MiniNode) => {
    const src = tree.children ?? [];
    const out: MiniNode[] = [];
    let i = 0;

    while (i < src.length) {
      let open = matchMarker(src[i], OPEN_RE);
      if (!open) {
        out.push(src[i]);
        i++;
        continue;
      }

      const startIdx = i;
      const cols: MiniNode[] = [];
      let valid = true;

      while (open) {
        i++; // 跳过起始标记
        const inner: MiniNode[] = [];
        let closed = false;
        while (i < src.length) {
          if (matchMarker(src[i], CLOSE_RE)) {
            closed = true;
            i++; // 跳过关闭标记
            break;
          }
          inner.push(src[i]);
          i++;
        }
        if (!closed) {
          valid = false;
          break;
        }
        cols.push(makeColNode(open[1], inner));
        // 紧随其后的另一容器并入同一行
        open = matchMarker(src[i], OPEN_RE);
      }

      if (valid && cols.length > 0) {
        out.push(makeRowNode(cols));
      } else {
        // 未闭合的容器：原样保留
        out.push(...src.slice(startIdx, i));
      }
    }

    tree.children = out;
  };
}
