import { describe, it, expect } from 'vitest';
import { normalizeColMarkers, remarkResumeCols } from '@/preview/remarkResumeCols';

/** 构造一个仅含单个文本子节点的段落节点 */
const p = (value: string) => ({ type: 'paragraph', children: [{ type: 'text', value }] });
const h = (value: string) => ({ type: 'heading', depth: 2, children: [{ type: 'text', value }] });

describe('normalizeColMarkers', () => {
  it('在 ::: 标记行前后补空行', () => {
    const md = ':::left\nA\n:::\n';
    expect(normalizeColMarkers(md)).toBe(':::left\n\nA\n\n:::\n\n');
  });

  it('连续容器各自独立', () => {
    const md = ':::left\nA\n:::\n:::mid\nB\n:::\n';
    expect(normalizeColMarkers(md)).toBe(
      ':::left\n\nA\n\n:::\n\n:::mid\n\nB\n\n:::\n\n'
    );
  });

  it('标记前无空行时自动补齐', () => {
    const md = '上文段落\n:::left\nA\n:::\n';
    expect(normalizeColMarkers(md)).toBe('上文段落\n\n:::left\n\nA\n\n:::\n\n');
  });

  it('代码围栏内的 ::: 不做处理', () => {
    const md = '```js\nconst s = ":::left";\n```\n';
    expect(normalizeColMarkers(md)).toBe(md);
  });

  it('普通文本不受影响', () => {
    const md = '# 标题\n\n正文内容\n';
    expect(normalizeColMarkers(md)).toBe(md);
  });
});

describe('remarkResumeCols', () => {
  const transform = (children: ReturnType<typeof p>[]) => {
    const tree: any = { type: 'root', children };
    remarkResumeCols()(tree as never);
    return tree;
  };

  it('连续三个容器合并为一行三栏', () => {
    const tree = transform([
      p(':::left'), p('张三'), p(':::'),
      p(':::mid'), p('前端工程师'), p(':::'),
      p(':::right'), p('电话：138xxxx'), p(':::'),
    ]);
    expect(tree.children).toHaveLength(1);
    const row = tree.children[0];
    expect(row.data.hName).toBe('div');
    expect(row.data.hProperties.className).toEqual(['resume-cols']);
    expect(row.children).toHaveLength(3);
    expect(row.children.map((c: any) => c.data.hProperties.className[1])).toEqual([
      'resume-col-left',
      'resume-col-mid',
      'resume-col-right',
    ]);
    // 内容节点原样保留
    expect(row.children[0].children[0].children[0].value).toBe('张三');
  });

  it('容器内支持多块内容', () => {
    const tree = transform([p(':::left'), h('小节'), p('内容'), p(':::')]);
    const row = tree.children[0];
    expect(row.children[0].children).toHaveLength(2);
    expect(row.children[0].children[0].type).toBe('heading');
  });

  it('单个容器也渲染为行（占满宽度）', () => {
    const tree = transform([p(':::mid'), p('居中标题'), p(':::')]);
    expect(tree.children).toHaveLength(1);
    expect(tree.children[0].children[0].data.hProperties.className).toContain('resume-col-mid');
  });

  it('未闭合容器原样保留', () => {
    const tree = transform([p(':::left'), p('未闭合内容'), p('后续段落')]);
    expect(tree.children).toHaveLength(3);
    expect(tree.children[0].children[0].value).toBe(':::left');
  });

  it('普通内容不受影响', () => {
    const tree = transform([h('标题'), p('正文')]);
    expect(tree.children).toHaveLength(2);
    expect(tree.children[0].type).toBe('heading');
  });
});
