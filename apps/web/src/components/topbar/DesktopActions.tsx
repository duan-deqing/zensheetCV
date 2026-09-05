import { Link } from 'react-router-dom';
import { HoverTip } from '@/components/HoverTip';
import { SaveButton } from '@/components/SaveButton';
import { ButtonStatus } from '@/components/ButtonStatus';
import { UserAvatar } from '@/components/UserAvatar';
import { useAuth } from '@/store/AuthContext';
import { useUI } from '@/store/UIContext';
import { useTr } from '@/i18n/LangContext';
import type { StatusKind, ButtonStatusState } from '@/components/ButtonStatus';
import { ExportIcon } from '@/components/topbar/icons';

/** 顶栏共享的提示状态（TopBar 根实例：EditableTitle / 导出 / 手机菜单的提示都渲染在保存按钮旁） */
export interface TopBarStatus {
  status: ButtonStatusState | null;
  exiting: boolean;
  show: (kind: StatusKind, text: string) => void;
}

interface DesktopActionsProps {
  buttonStatus: TopBarStatus;
  onExportPDF: () => Promise<void>;
  isExporting: boolean;
}

/** 顶栏右侧动作区（桌面端 md 起直显）：保存 / 导出 PDF / 用户信息 */
export function DesktopActions({ buttonStatus, onExportPDF, isExporting }: DesktopActionsProps) {
  const { user } = useAuth();
  const { toggleUserModal } = useUI();
  const tr = useTr();

  return (
    <div className="hidden md:flex items-center gap-1 lg:gap-1.5">
      <span className="relative inline-flex">
        <SaveButton />
        {/* 导出结果气泡与保存结果共用同一区域：保存按钮左侧 */}
        <ButtonStatus status={buttonStatus.status} exiting={buttonStatus.exiting} placement="left" />
      </span>
      <button
        onClick={() => void onExportPDF()}
        disabled={isExporting}
        className="px-2 lg:px-3.5 h-8 inline-flex items-center gap-1.5 text-[13px] font-medium rounded-full border border-primary-300 bg-white text-primary-700 hover:bg-primary-50 transition-colors disabled:opacity-50 whitespace-nowrap"
      >
        <ExportIcon />
        <span className="hidden lg:inline whitespace-nowrap">
          {isExporting ? tr({ zh: '导出中...', en: 'Exporting...' }) : tr({ zh: '导出 PDF', en: 'Export PDF' })}
        </span>
      </button>
      <div className="flex items-center gap-2 ml-0.5 sm:ml-1.5 pl-2 sm:pl-3 border-l border-gray-200">
        {/* 头像 + 用户名，点击打开用户信息弹窗 */}
        <HoverTip text={tr({ zh: '用户信息', en: 'User info' })}>
          <button onClick={toggleUserModal} className="flex items-center gap-2 group" aria-haspopup="dialog">
            <UserAvatar user={user} />
            <span className="hidden sm:inline md:hidden lg:inline text-[13px] text-gray-600 group-hover:text-primary-600 transition-colors max-w-24 truncate">
              {user.name}
            </span>
          </button>
        </HoverTip>
      </div>
    </div>
  );
}

/** 顶栏左侧「返回简历列表」链接（手机窄屏仅留箭头） */
export function BackToResumes() {
  const tr = useTr();
  return (
    <HoverTip text={tr({ zh: '返回简历列表', en: 'Back to my resumes' })}>
      <Link
        to="/resumes"
        className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-primary-600 transition-colors shrink-0"
      >
        <span className="font-mono text-primary-500" aria-hidden="true">&lt;</span>
        <span className="hidden sm:inline md:hidden lg:inline whitespace-nowrap">{tr({ zh: '我的简历', en: 'My Resumes' })}</span>
      </Link>
    </HoverTip>
  );
}
