import { useEffect, useMemo, useRef, useState } from 'react';
import { useUI } from '@/store/UIContext';
import { useAuth } from '@/store/AuthContext';
import { HoverTip } from '@/components/HoverTip';
import { AvatarCropModal } from '@/components/AvatarCropModal';
import { apiClient } from '@/api/client';
import type { User } from '@stylan/shared-types';
import {
  loadAISettings,
  saveAISettings,
  fetchProviderModels,
  type AISettings,
} from '@/settings/aiSettings';
import { AI_PROVIDERS } from '@/settings/providers';

type UserTab = 'account' | 'ai' | 'security' | 'about';

/** 分类线性图标，颜色跟随 currentColor */
function TabIcon({ tab }: { tab: UserTab }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: 'w-3.5 h-3.5',
    'aria-hidden': true,
  };
  if (tab === 'account') {
    return (
      <svg {...common}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
      </svg>
    );
  }
  if (tab === 'security') {
    return (
      <svg {...common}>
        <path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5l8-3z" />
      </svg>
    );
  }
  if (tab === 'ai') {
    return (
      <svg {...common}>
        <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
        <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

const TABS: { id: UserTab; label: string }[] = [
  { id: 'account', label: '账号信息' },
  { id: 'ai', label: 'AI' },
  { id: 'security', label: '安全' },
  { id: 'about', label: '关于' },
];

/** 获取模型列表按钮：加载中禁用 */
function FetchModelsButton({
  state,
  onClick,
}: {
  state: 'idle' | 'loading' | 'error';
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={state === 'loading'}
      className="shrink-0 h-9 px-3 rounded-lg border border-gray-200 bg-white text-[12px] font-medium text-gray-600 hover:border-primary-300 hover:text-primary-600 transition-colors disabled:opacity-60 disabled:cursor-wait"
    >
      {state === 'loading' ? '获取中…' : '获取模型'}
    </button>
  );
}

/** 模型下拉选择：输入即过滤 + 列表点选 + 键盘导航；无列表时退化为普通输入框 */
function ModelCombobox({
  value,
  onChange,
  models,
  placeholder,
  prefix,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  models: string[];
  placeholder: string;
  prefix?: string;
  ariaLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);

  // 输入即过滤
  const filtered = useMemo(
    () => models.filter((m) => m.toLowerCase().includes(value.trim().toLowerCase())),
    [models, value],
  );

  // 点击外部关闭
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  // 展开时高亮当前选中项
  useEffect(() => {
    if (open) setHighlight(models.indexOf(value));
  }, [open, models, value]);

  // 高亮项滚动到可视区（jsdom 无 scrollIntoView，做可选调用防御）
  useEffect(() => {
    if (!open || highlight < 0) return;
    rootRef.current
      ?.querySelector(`[data-idx="${highlight}"]`)
      ?.scrollIntoView?.({ block: 'nearest' });
  }, [highlight, open]);

  const select = (m: string) => {
    onChange(m);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (!open) {
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && models.length > 0) {
        setOpen(true);
        e.preventDefault();
      }
      return;
    }
    if (e.key === 'ArrowDown' && filtered.length > 0) {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp' && filtered.length > 0) {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      if (highlight >= 0 && filtered[highlight]) {
        e.preventDefault();
        select(filtered[highlight]);
      } else {
        setOpen(false);
      }
    }
  };

  return (
    <div ref={rootRef} className="relative flex-1 min-w-0">
      <div className="flex items-center gap-2 w-full h-9 px-3 rounded-lg border border-gray-200 bg-white focus-within:border-primary-300 focus-within:ring-2 focus-within:ring-primary-100 transition">
        {prefix && (
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400 shrink-0">
            {prefix}
          </span>
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.trim())}
          onFocus={() => models.length > 0 && setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          spellCheck={false}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-label={ariaLabel}
          className="flex-1 min-w-0 bg-transparent font-mono text-[12px] text-gray-700 placeholder:text-gray-300 focus:outline-none"
        />
        {models.length > 0 && (
          <button
            type="button"
            onClick={() => setOpen((p) => !p)}
            aria-label={open ? '收起模型列表' : '展开模型列表'}
            className="shrink-0 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        )}
      </div>

      {open && models.length > 0 && (
        <div
          role="listbox"
          aria-label="模型列表"
          className="absolute left-0 right-0 top-full mt-1 z-10 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg py-1"
        >
          {filtered.length === 0 ? (
            <p className="px-3 py-2 text-[12px] text-gray-400">无匹配模型，直接使用当前输入</p>
          ) : (
            filtered.map((m, idx) => {
              const selected = m === value;
              return (
                <button
                  type="button"
                  key={m}
                  data-idx={idx}
                  role="option"
                  aria-selected={selected}
                  // mousedown 选择，避免点击时 input 先失焦关闭下拉
                  onMouseDown={(e) => {
                    e.preventDefault();
                    select(m);
                  }}
                  onMouseEnter={() => setHighlight(idx)}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-left font-mono text-[12px] transition-colors ${
                    idx === highlight ? 'bg-gray-100 text-gray-900' : 'text-gray-600'
                  }`}
                >
                  <span className={`shrink-0 ${selected ? 'text-primary-500' : 'text-transparent'}`}>
                    ✓
                  </span>
                  <span className="truncate">{m}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

/** AI 分类内容：供应商选择 + API KEY + 自定义 OpenAI 兼容端点，保存到本地。
 *  模型名称通过 GET /models 接口实时获取，也可手动输入 */
function AISettingsSection() {
  const [settings, setSettings] = useState<AISettings>(() => loadAISettings());
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [models, setModels] = useState<string[]>([]);
  const [fetchState, setFetchState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [fetchError, setFetchError] = useState('');

  const selectProvider = (id: string) => {
    const preset = AI_PROVIDERS.find((p) => p.id === id);
    if (!preset) return;
    setSettings((s) => ({
      ...s,
      provider: preset.id,
      baseUrl: preset.baseUrl,
      model: '',
    }));
    setModels([]);
    setFetchState('idle');
    setFetchError('');
    setSaved(false);
  };

  const isCustom = settings.provider === 'custom';

  /** 调用供应商 GET /models 拉取可用模型列表 */
  const handleFetchModels = async () => {
    const preset = AI_PROVIDERS.find((p) => p.id === settings.provider);
    const baseUrl = settings.provider === 'custom' ? settings.baseUrl : preset?.baseUrl;
    const apiKey = settings.apiKeys[settings.provider] ?? '';
    if (!apiKey || !baseUrl) {
      setFetchState('error');
      setFetchError(isCustom ? '请先填写 API KEY 和接口地址' : '请先填写 API KEY');
      return;
    }
    setFetchState('loading');
    setFetchError('');
    try {
      const list = await fetchProviderModels(baseUrl, apiKey);
      if (list.length === 0) {
        setFetchState('error');
        setFetchError('端点未返回任何模型，可手动输入模型名称');
        return;
      }
      setModels(list);
      setFetchState('idle');
      // 当前模型不在列表中时自动选第一个
      setSettings((s) => (list.includes(s.model) ? s : { ...s, model: list[0] }));
    } catch (e) {
      setFetchState('error');
      setFetchError(
        e instanceof Error
          ? `获取失败（${e.message}），可手动输入模型名称`
          : '获取失败，可手动输入模型名称',
      );
    }
  };

  const save = () => {
    saveAISettings(settings);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col h-full">
      {/* 服务商卡片 */}
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400">
        {'// 服务商'}
      </p>
      <div className="mt-2.5 grid grid-cols-3 gap-2" role="radiogroup" aria-label="AI 服务商">
        {AI_PROVIDERS.map((p) => {
          const active = settings.provider === p.id;
          return (
            <button
              key={p.id}
              onClick={() => selectProvider(p.id)}
              aria-pressed={active}
              className={`px-3 py-2 rounded-lg border text-left transition-colors ${
                active
                  ? 'border-primary-400 bg-primary-50/60'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span
                className={`block text-[13px] font-medium ${active ? 'text-primary-700' : 'text-gray-700'}`}
              >
                {p.label}
              </span>
              <span className="block mt-0.5 font-mono text-[10px] text-gray-400 truncate">
                {p.baseUrl || 'OpenAI 兼容协议'}
              </span>
            </button>
          );
        })}
      </div>

      {/* 凭证 */}
      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400">
        {'// 凭证'}
      </p>
      <div className="mt-2.5 space-y-2.5">
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={settings.apiKeys[settings.provider] ?? ''}
            onChange={(e) => {
              const key = e.target.value.trim();
              // Key 按供应商独立存储，切换供应商互不影响
              setSettings((s) => ({ ...s, apiKeys: { ...s.apiKeys, [s.provider]: key } }));
              setSaved(false);
            }}
            placeholder="sk-..."
            spellCheck={false}
            autoComplete="off"
            aria-label="API KEY"
            className="w-full h-9 pl-3 pr-10 rounded-lg border border-gray-200 bg-white font-mono text-[13px] text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100 transition"
          />
          <button
            onClick={() => setShowKey((p) => !p)}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={showKey ? '隐藏 API KEY' : '显示 API KEY'}
          >
            {showKey ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>

        {isCustom ? (
          <>
            <input
              type="text"
              value={settings.baseUrl}
              onChange={(e) => {
                setSettings((s) => ({ ...s, baseUrl: e.target.value.trim() }));
                setSaved(false);
              }}
              placeholder="https://your-host.com/v1（OpenAI 兼容端点）"
              spellCheck={false}
              aria-label="接口地址 Base URL"
              className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-white font-mono text-[13px] text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100 transition"
            />
            <div className="flex gap-2">
              <ModelCombobox
                value={settings.model}
                onChange={(v) => {
                  setSettings((s) => ({ ...s, model: v }));
                  setSaved(false);
                }}
                models={models}
                placeholder="模型名称，可点击右侧按钮获取"
                ariaLabel="模型名称"
              />
              <FetchModelsButton state={fetchState} onClick={handleFetchModels} />
            </div>
          </>
        ) : (
          <div className="flex gap-2">
            <ModelCombobox
              prefix="模型"
              value={settings.model}
              onChange={(v) => {
                setSettings((s) => ({ ...s, model: v }));
                setSaved(false);
              }}
              models={models}
              placeholder="点击右侧按钮获取"
              ariaLabel="模型名称"
            />
            <FetchModelsButton state={fetchState} onClick={handleFetchModels} />
          </div>
        )}
        {fetchState === 'error' && (
          <p className="text-[12px] text-red-500 leading-relaxed" role="alert">
            {fetchError}
          </p>
        )}
        {fetchState !== 'error' && models.length > 0 && (
          <p className="text-[12px] text-gray-400 leading-relaxed">
            已获取 {models.length} 个模型，可直接选择或手动输入
          </p>
        )}
      </div>

      <p className="mt-3 text-[12px] text-gray-400 leading-relaxed">
        每个供应商的 API KEY 独立保存，切换供应商互不影响；配置仅存于当前浏览器（localStorage），
        不会上传到服务器
      </p>

      <button
        onClick={save}
        disabled={saved}
        className="mt-auto w-full h-9 rounded-lg bg-primary-600 text-white text-[13px] font-medium hover:bg-primary-700 disabled:opacity-70 transition-colors"
      >
        {saved ? '已保存 ✓' : '保存'}
      </button>
    </div>
  );
}

const SEC_INPUT_CLS =
  'w-full h-9 px-3 rounded-lg border border-gray-200 bg-white text-[13px] text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100 transition';

interface SecMsg {
  ok: boolean;
  text: string;
}

/** 安全区块通用小节：mono 标题 + 表单行 */
function SecBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-gray-200 p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400 mb-3">
        {title}
      </p>
      {children}
    </section>
  );
}

function SecFeedback({ msg }: { msg: SecMsg | null }) {
  if (!msg) return null;
  return (
    <p
      className={`mt-2 text-[12px] ${msg.ok ? 'text-emerald-600' : 'text-red-500'}`}
      role="alert"
    >
      {msg.text}
    </p>
  );
}

/** 安全分类：修改用户名 / 邮箱 / 密码 */
function SecuritySection() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [nameMsg, setNameMsg] = useState<SecMsg | null>(null);
  const [nameSaving, setNameSaving] = useState(false);
  const [email, setEmail] = useState(user?.email ?? '');
  const [emailMsg, setEmailMsg] = useState<SecMsg | null>(null);
  const [emailSaving, setEmailSaving] = useState(false);
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdMsg, setPwdMsg] = useState<SecMsg | null>(null);
  const [pwdSaving, setPwdSaving] = useState(false);

  const saveName = async () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === user?.name) return;
    setNameSaving(true);
    setNameMsg(null);
    try {
      const { data } = await apiClient.put<User>('/auth/me', { name: trimmed });
      updateUser(data);
      setName(data.name);
      setNameMsg({ ok: true, text: '用户名已更新' });
    } catch (err: any) {
      setNameMsg({
        ok: false,
        text: err?.response?.data?.detail || '保存失败，请重试',
      });
    } finally {
      setNameSaving(false);
    }
  };

  const saveEmail = async () => {
    const trimmed = email.trim();
    if (!trimmed || trimmed === user?.email) return;
    setEmailSaving(true);
    setEmailMsg(null);
    try {
      const { data } = await apiClient.put<User>('/auth/me', { email: trimmed });
      updateUser(data);
      setEmail(data.email);
      setEmailMsg({ ok: true, text: '邮箱已更新' });
    } catch (err: any) {
      setEmailMsg({
        ok: false,
        text: err?.response?.data?.detail || '保存失败，请重试',
      });
    } finally {
      setEmailSaving(false);
    }
  };

  const savePassword = async () => {
    if (newPwd.length < 6) {
      setPwdMsg({ ok: false, text: '新密码至少需要 6 位' });
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdMsg({ ok: false, text: '两次输入的新密码不一致' });
      return;
    }
    setPwdSaving(true);
    setPwdMsg(null);
    try {
      await apiClient.put('/auth/password', {
        old_password: oldPwd,
        new_password: newPwd,
      });
      setOldPwd('');
      setNewPwd('');
      setConfirmPwd('');
      setPwdMsg({ ok: true, text: '密码已更新' });
    } catch (err: any) {
      setPwdMsg({
        ok: false,
        text: err?.response?.data?.detail || '修改失败，请重试',
      });
    } finally {
      setPwdSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <SecBlock title="// 修改用户名">
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="输入新的用户名"
            className={SEC_INPUT_CLS}
            aria-label="新的用户名"
          />
          <button
            onClick={saveName}
            disabled={nameSaving || !name.trim() || name.trim() === user?.name}
            className="shrink-0 h-9 px-4 rounded-lg bg-primary-600 text-white text-[13px] font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {nameSaving ? '保存中…' : '保存'}
          </button>
        </div>
        <SecFeedback msg={nameMsg} />
      </SecBlock>

      <SecBlock title="// 修改邮箱">
        <div className="flex gap-2">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="输入新的邮箱"
            className={`${SEC_INPUT_CLS} font-mono`}
            aria-label="新的邮箱"
          />
          <button
            onClick={saveEmail}
            disabled={emailSaving || !email.trim() || email.trim() === user?.email}
            className="shrink-0 h-9 px-4 rounded-lg bg-primary-600 text-white text-[13px] font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {emailSaving ? '保存中…' : '保存'}
          </button>
        </div>
        <SecFeedback msg={emailMsg} />
      </SecBlock>

      <SecBlock title="// 修改密码">
        <div className="flex flex-col gap-2">
          <input
            value={oldPwd}
            onChange={(e) => setOldPwd(e.target.value)}
            type="password"
            placeholder="原密码"
            className={SEC_INPUT_CLS}
            aria-label="原密码"
          />
          <input
            value={newPwd}
            onChange={(e) => setNewPwd(e.target.value)}
            type="password"
            placeholder="新密码（至少 6 位）"
            className={SEC_INPUT_CLS}
            aria-label="新密码"
          />
          <input
            value={confirmPwd}
            onChange={(e) => setConfirmPwd(e.target.value)}
            type="password"
            placeholder="确认新密码"
            className={SEC_INPUT_CLS}
            aria-label="确认新密码"
          />
          <button
            onClick={savePassword}
            disabled={pwdSaving || !oldPwd || !newPwd || !confirmPwd}
            className="h-9 rounded-lg bg-primary-600 text-white text-[13px] font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {pwdSaving ? '保存中…' : '更新密码'}
          </button>
        </div>
        <SecFeedback msg={pwdMsg} />
      </SecBlock>
    </div>
  );
}

/** 设置弹窗：点击导航栏用户名称进入。
 *  左右两栏：左侧分类卡片，右侧展示对应分类内容 */
export function UserModal() {
  const { userModalOpen, toggleUserModal } = useUI();
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState<UserTab>('account');

  // 头像上传：选择文件 → 裁剪弹窗 → 确定后上传
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState('');
  const [resumeCount, setResumeCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // 允许重复选择同一文件
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setAvatarError('仅支持 PNG / JPEG / WebP 图片');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('图片不能超过 5MB');
      return;
    }
    setAvatarError('');
    setAvatarSrc(URL.createObjectURL(file));
  };

  const closeAvatarCrop = () => {
    setAvatarSrc((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  };

  const handleAvatarUpload = async (blob: Blob) => {
    const fd = new FormData();
    fd.append('file', blob, 'avatar.png');
    const { data } = await apiClient.post<User>('/auth/avatar', fd);
    updateUser(data);
    closeAvatarCrop();
  };

  // 每次打开重置到第一个分类，并拉取简历数量（接口返回 { items: [...] }）
  useEffect(() => {
    if (userModalOpen) {
      setTab('account');
      apiClient
        .get('/resumes')
        .then(({ data }) => {
          const items = data?.items;
          setResumeCount(Array.isArray(items) ? items.length : null);
        })
        .catch(() => setResumeCount(null));
    }
  }, [userModalOpen]);

  // Esc 关闭
  useEffect(() => {
    if (!userModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') toggleUserModal();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [userModalOpen, toggleUserModal]);

  if (!userModalOpen || !user) return null;

  const registeredAt = new Date(user.created_at).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
      aria-label="设置"
    >
      <style>{`
        @keyframes userModalIn {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes userBackdropIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .user-modal-in { animation: userModalIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .user-backdrop-in { animation: userBackdropIn 0.2s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .user-modal-in, .user-backdrop-in { animation: none; }
        }
      `}</style>
      {/* 遮罩：打开后背景变灰聚焦，点击关闭 */}
      <div
        className="user-backdrop-in absolute inset-0 bg-gray-900/40 backdrop-blur-[2px]"
        onClick={toggleUserModal}
        aria-hidden="true"
      />
      {/* 尺寸与屏幕等比：66vw × 66vh 的比值恒等于屏幕宽高比；
          min/max 上限同样保持 16:9，保护极小/超大屏幕 */}
      <div className="user-modal-in relative w-[66vw] h-[66vh] min-w-[512px] min-h-[288px] max-w-[960px] max-h-[540px] bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* 顶栏：与模板库/图标库弹窗同构（mono 眉标 + py-2 + h-7 按钮 = 44px 等高） */}
        <div className="flex items-center gap-3 px-5 py-2 bg-white border-b border-gray-200 shrink-0">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary-600 shrink-0"
            aria-hidden="true"
          >
            {'< SETTINGS />'}
          </p>
          <h3 className="text-sm font-semibold text-gray-900">设置</h3>
          <HoverTip text="关闭">
            <button
              onClick={toggleUserModal}
              className="ml-auto w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors text-sm"
              aria-label="关闭设置"
            >
              ✕
            </button>
          </HoverTip>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* 左栏：分类卡片 */}
          <nav className="w-36 shrink-0 bg-gray-50 border-r border-gray-200 p-2.5 flex flex-col gap-1.5" aria-label="分类">
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  aria-pressed={active}
                  className={`flex items-center gap-2 h-9 px-3 rounded-lg border text-[13px] font-medium transition-colors ${
                    active
                      ? 'bg-white border-primary-200 text-primary-700 shadow-sm'
                      : 'border-transparent text-gray-600 hover:bg-white hover:text-gray-900 hover:border-gray-200'
                  }`}
                >
                  <span className={active ? 'text-primary-500' : 'text-gray-400'}>
                    <TabIcon tab={t.id} />
                  </span>
                  {t.label}
                </button>
              );
            })}
          </nav>

          {/* 右栏：对应分类内容 */}
          <div className="flex-1 min-w-0 p-5 overflow-y-auto">
            {tab === 'account' && (
              <div className="flex flex-col">
                {/* 头像 + 名称同行展示，圆角框宽度随内容区，内容靠左；点击头像更换 */}
                <div className="w-full flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
                  <HoverTip text="更换头像">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="relative group shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
                      aria-label="更换头像"
                    >
                      {user.avatar ? (
                        <img
                          src={`${import.meta.env.VITE_API_URL || ''}${user.avatar}`}
                          alt={`${user.name} 的头像`}
                          className="w-12 h-12 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <span
                          className="w-12 h-12 rounded-full bg-primary-50 text-primary-600 border border-primary-100 flex items-center justify-center text-lg font-semibold select-none"
                          aria-hidden="true"
                        >
                          {user.name.slice(0, 1).toUpperCase()}
                        </span>
                      )}
                      {/* 悬停遮罩 + 相机图标 */}
                      <span className="absolute inset-0 rounded-full bg-gray-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                          <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                          <circle cx="12" cy="13" r="4" />
                        </svg>
                      </span>
                    </button>
                  </HoverTip>
                  <p className="text-base font-semibold text-gray-900 truncate">{user.name}</p>
                </div>
                {avatarError && (
                  <p className="mt-2 text-[12px] text-red-500" role="alert">
                    {avatarError}
                  </p>
                )}
                {/* 信息行：mono 标签 + 值，与面板 mono 眉标风格同构 */}
                <dl className="mt-4 w-full rounded-lg border border-gray-200 divide-y divide-gray-100 overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-2.5">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400 w-16 shrink-0">
                      邮箱
                    </dt>
                    <dd className="text-[13px] text-gray-700 truncate">{user.email}</dd>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-2.5">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400 w-16 shrink-0">
                      注册时间
                    </dt>
                    <dd className="text-[13px] text-gray-700">{registeredAt}</dd>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-2.5">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400 w-16 shrink-0">
                      简历数量
                    </dt>
                    <dd className="text-[13px] text-gray-700 tabular-nums">
                      {resumeCount === null ? '—' : `${resumeCount} 份`}
                    </dd>
                  </div>
                </dl>
              </div>
            )}

            {tab === 'ai' && <AISettingsSection />}

            {tab === 'security' && <SecuritySection />}

            {tab === 'about' && (
              <div className="flex flex-col h-full">
                <p className="font-mono text-xs tracking-[0.18em] text-primary-600">
                  {'< ZENSHEET · 简历 />'}
                </p>
                <p className="mt-2 text-[13px] text-gray-600 leading-relaxed">
                  一个在线 Markdown 简历编辑器：左侧书写 Markdown，右侧实时预览排版，
                  内置多套模板与 AI 润色能力，服务端渲染导出高质量 PDF。
                </p>
                <dl className="mt-4 rounded-lg border border-gray-200 divide-y divide-gray-100 overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-2.5">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400 w-16 shrink-0">
                      项目名称
                    </dt>
                    <dd className="text-[13px] text-gray-700">ZENSHEET · 简历 — 在线 Markdown 简历编辑器</dd>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-2.5">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400 w-16 shrink-0">
                      当前版本
                    </dt>
                    <dd className="font-mono text-[13px] text-gray-700 tabular-nums">v0.9.0</dd>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-2.5">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400 w-16 shrink-0">
                      作者
                    </dt>
                    <dd className="text-[13px] text-gray-700">STYLAN &amp; GLM-5.3-flash</dd>
                  </div>
                  <div className="flex items-start gap-3 px-4 py-2.5">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400 w-16 shrink-0 pt-0.5">
                      技术栈
                    </dt>
                    <dd className="text-[13px] text-gray-700 leading-relaxed">
                      <span className="block">前端：React 18 · TypeScript · Vite · Tailwind CSS · CodeMirror 6</span>
                      <span className="block">后端：FastAPI · SQLAlchemy (async) · SQLite · JWT</span>
                      <span className="block">PDF 导出：Playwright 服务端渲染</span>
                    </dd>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-2.5">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400 w-16 shrink-0">
                      AI 接入
                    </dt>
                    <dd className="text-[13px] text-gray-700">OpenAI 兼容协议，支持 DeepSeek / GLM / LongCat / 自定义端点</dd>
                  </div>
                </dl>
              </div>
            )}
          </div>
        </div>

        {/* 隐藏的文件选择框：点击头像触发 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleAvatarSelect}
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      {/* 头像裁剪弹窗 */}
      {avatarSrc && (
        <AvatarCropModal src={avatarSrc} onCancel={closeAvatarCrop} onConfirm={handleAvatarUpload} />
      )}
    </div>
  );
}
