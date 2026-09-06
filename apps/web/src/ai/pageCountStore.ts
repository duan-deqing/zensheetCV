/** 页数发布/订阅：ResumePreview 分页重算时发布，Agent 工具 / 工作流读取。
 *  模块级单变量即可，无需订阅者通知（Agent 发起请求时同步拉取）。 */

let pageCount: number | null = null;

export function setPageCount(count: number): void {
  pageCount = count;
}

export function getPageCount(): number | null {
  return pageCount;
}
