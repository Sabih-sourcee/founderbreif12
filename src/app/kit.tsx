import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  ArrowLeft,
  ArrowUp,
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  Crown,
  Download,
  FileText,
  Folder,
  HelpCircle,
  Home,
  Mic,
  MoreHorizontal,
  MoreVertical,
  Pause,
  Play,
  Search,
  Square,
  User,
  Volume2,
  X,
} from "lucide-react";
import { COLORS, SHADOW } from "./theme";
import { TabId } from "./types";
import { initialsOf } from "./text";

export type TransitionDirection = "forward" | "back" | "tab";

const EnterContext = createContext<{ next: () => number } | null>(null);

export function ScreenTransition({
  children,
  triggerKey,
  direction,
}: {
  children: ReactNode;
  triggerKey: string;
  direction: TransitionDirection;
}) {
  const counter = useRef(0);
  if (counter.current) counter.current = 0;
  const ctx = { next: () => counter.current++ };
  const anim =
    direction === "back"
      ? "fb-screen-back"
      : direction === "tab"
        ? "fb-screen-tab"
        : "fb-screen-forward";

  return (
    <EnterContext.Provider value={ctx}>
      <div key={triggerKey} className={`fb-screen-enter fb-screen-enter-${anim}`} style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        {children}
      </div>
    </EnterContext.Provider>
  );
}

export function Enter({
  children,
  kind = "rise",
  className,
  style,
}: {
  children: ReactNode;
  kind?: "rise" | "drop" | "pop" | "fromLeft" | "fromRight";
  className?: string;
  style?: CSSProperties;
}) {
  const ctx = useContext(EnterContext);
  const order = useRef<number | null>(null);
  if (ctx && order.current === null) order.current = ctx.next();
  const delay = (order.current ?? 0) * 55;
  return (
    <div
      className={`fb-enter fb-enter-${kind} ${className ?? ""}`}
      style={{ ...style, animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function ScreenFrame({ children }: { children: ReactNode }) {
  return <div className="fb-frame">{children}</div>;
}

export function Tap({
  children,
  onPress,
  className,
  style,
  disabled,
  accessibilityLabel,
  type = "button",
}: {
  children?: ReactNode;
  onPress?: () => void;
  className?: string;
  style?: CSSProperties;
  disabled?: boolean;
  accessibilityLabel?: string;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onPress}
      disabled={disabled}
      aria-label={accessibilityLabel}
      className={`fb-tap ${className ?? ""}`}
      style={style}
    >
      {children}
    </button>
  );
}

export function CircleButton({
  onPress,
  children,
  size = 44,
  dot,
  accessibilityLabel,
}: {
  onPress?: () => void;
  children: ReactNode;
  size?: number;
  dot?: boolean;
  accessibilityLabel?: string;
}) {
  return (
    <Enter kind="pop">
      <Tap
        onPress={onPress}
        accessibilityLabel={accessibilityLabel}
        className="fb-circle-btn"
        style={{ width: size, height: size, borderRadius: size / 2 }}
      >
        {children}
        {dot ? <span className="fb-dot" /> : null}
      </Tap>
    </Enter>
  );
}

export function TopBar({
  title,
  left = "back",
  onLeft,
  rightIcon,
  onRight,
  rightLabel,
}: {
  title: string;
  left?: "back" | "close";
  onLeft?: () => void;
  rightIcon?: "more" | "download" | "search" | "close";
  onRight?: () => void;
  rightLabel?: string;
}) {
  const RightIcon =
    rightIcon === "download"
      ? Download
      : rightIcon === "search"
        ? Search
        : rightIcon === "close"
          ? X
          : MoreHorizontal;
  return (
    <Enter kind="drop">
      <div className="fb-topbar">
        <Tap onPress={onLeft} className="fb-topbar-slot" accessibilityLabel={left === "close" ? "Close" : "Back"}>
          {left === "close" ? <X size={26} color={COLORS.ink} /> : <ArrowLeft size={26} color={COLORS.ink} />}
        </Tap>
        <div className="fb-topbar-title">{title}</div>
        <div className="fb-topbar-slot">
          {rightIcon ? (
            <Tap onPress={onRight} className="fb-topbar-slot" accessibilityLabel={rightLabel ?? "More options"}>
              <RightIcon size={24} color={COLORS.ink} />
            </Tap>
          ) : null}
        </div>
      </div>
    </Enter>
  );
}

export function ScreenTitle({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <Enter kind="drop">
      <div className="fb-screen-title">
        <h1>{title}</h1>
        {right}
      </div>
    </Enter>
  );
}

const NAV_ITEMS: Array<{
  id: TabId;
  label: string;
  icon: typeof Home;
  iconActive: typeof Home;
}> = [
  { id: "Home", label: "Home", icon: Home, iconActive: Home },
  { id: "Record", label: "Record", icon: Mic, iconActive: Mic },
  { id: "ReadAloud", label: "Read Aloud", icon: Volume2, iconActive: Volume2 },
  { id: "Library", label: "Library", icon: Folder, iconActive: Folder },
  { id: "Profile", label: "Profile", icon: User, iconActive: User },
];

export function NavBar({
  active,
  onSelect,
}: {
  active: TabId;
  onSelect: (tab: TabId) => void;
}) {
  return (
    <div className="fb-nav-wrap">
      <div className="fb-nav-inner">
        <div className="fb-nav-pill" />
        <div className="fb-nav-row">
          {NAV_ITEMS.map((item) => {
            const isActive = item.id === active;
            const Icon = isActive ? item.iconActive : item.icon;
            return (
              <Tap
                key={item.id}
                className="fb-nav-tab"
                accessibilityLabel={item.label}
                onPress={() => onSelect(item.id)}
              >
                {isActive ? (
                  <span className="fb-nav-active-ring" key={item.id}>
                    <span className="fb-nav-active-circle">
                      <Icon size={26} color={COLORS.ink} fill={COLORS.ink} />
                    </span>
                  </span>
                ) : (
                  <Icon size={23} color={COLORS.ink} strokeWidth={1.75} />
                )}
                <span className={`fb-nav-label ${isActive ? "is-active" : ""}`}>{item.label}</span>
              </Tap>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function ChatBubble({
  variant,
  text,
  meta,
  children,
  wide,
}: {
  variant: "ai" | "user";
  text?: string;
  meta?: string;
  children?: ReactNode;
  wide?: boolean;
}) {
  const isUser = variant === "user";
  return (
    <Enter kind={isUser ? "fromRight" : "fromLeft"}>
      <div className={`fb-bubble-row ${isUser ? "is-user" : "is-ai"}`}>
        <div className={`fb-bubble ${isUser ? "is-user" : "is-ai"} ${wide ? "is-wide" : ""}`}>
          {text ? <p>{text}</p> : null}
          {children}
          {meta ? <span className="fb-bubble-meta">{meta}</span> : null}
        </div>
      </div>
    </Enter>
  );
}

export function DayPill({ label }: { label: string }) {
  return (
    <Enter kind="pop">
      <div className="fb-daypill-wrap">
        <span className="fb-daypill">{label}</span>
      </div>
    </Enter>
  );
}

export function RowLeading({
  tone = "teal",
  children,
  size = 46,
}: {
  tone?: "teal" | "accent";
  children: ReactNode;
  size?: number;
}) {
  return (
    <div
      className="fb-row-leading"
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        background: tone === "accent" ? COLORS.accent : COLORS.bg,
      }}
    >
      {children}
    </div>
  );
}

export function ListRow({
  leading,
  title,
  subtitle,
  trailing,
  onPress,
  dimmed,
  selected,
  accessibilityLabel,
}: {
  leading: ReactNode;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  onPress?: () => void;
  dimmed?: boolean;
  selected?: boolean;
  accessibilityLabel?: string;
}) {
  return (
    <Enter>
      <Tap
        onPress={onPress}
        accessibilityLabel={accessibilityLabel ?? title}
        className={`fb-row ${dimmed ? "is-dimmed" : ""} ${selected ? "is-selected" : ""}`}
      >
        <div className={dimmed ? "fb-dim" : undefined}>{leading}</div>
        <div className={`fb-row-text ${dimmed ? "fb-dim" : ""}`}>
          <div className="fb-row-title">{title}</div>
          {subtitle ? <div className="fb-row-sub">{subtitle}</div> : null}
        </div>
        {trailing}
      </Tap>
    </Enter>
  );
}

export function MenuRow({
  icon,
  label,
  onPress,
  right,
}: {
  icon: ReactNode;
  label: string;
  onPress: () => void;
  right?: string;
}) {
  return (
    <Enter>
      <Tap onPress={onPress} className="fb-menu-row" accessibilityLabel={label}>
        <span className="fb-menu-icon">{icon}</span>
        <span className="fb-menu-label">{label}</span>
        {right ? <span className="fb-menu-right">{right}</span> : null}
        <ChevronRight size={20} color={COLORS.ink} />
      </Tap>
    </Enter>
  );
}

export function FilterChip({
  label,
  active,
  onPress,
  small,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  small?: boolean;
}) {
  return (
    <Tap
      onPress={onPress}
      accessibilityLabel={label}
      className={`fb-chip ${small ? "is-small" : ""} ${active ? "is-active" : "is-idle"}`}
    >
      {label}
    </Tap>
  );
}

export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ id: T; label: string }>;
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <Enter>
      <div className="fb-segment">
        {options.map((opt) => {
          const active = opt.id === value;
          return (
            <Tap
              key={opt.id}
              onPress={() => onChange(opt.id)}
              accessibilityLabel={opt.label}
              className={`fb-segment-item ${active ? "is-active" : ""}`}
            >
              {opt.label}
            </Tap>
          );
        })}
      </div>
    </Enter>
  );
}

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled,
  loading,
  small,
  className,
}: {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "dark" | "secondary";
  disabled?: boolean;
  loading?: boolean;
  small?: boolean;
  className?: string;
}) {
  return (
    <Enter className={className} style={{ width: "100%" }}>
      <Tap
        onPress={onPress}
        disabled={disabled || loading}
        accessibilityLabel={label}
        className={`fb-btn fb-btn-${variant} ${small ? "is-small" : ""}`}
        style={{ opacity: disabled ? 0.45 : 1 }}
      >
        {loading ? "Please wait…" : label}
      </Tap>
    </Enter>
  );
}

export function Card({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <Enter className={className} style={{ display: "flex", flexDirection: "column", minHeight: 0, ...style }}>
      <div className="fb-card" style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        {children}
      </div>
    </Enter>
  );
}

export function ActionTile({
  label,
  children,
  tinted,
  onPress,
}: {
  label: string;
  children: ReactNode;
  tinted?: boolean;
  onPress: () => void;
}) {
  return (
    <Enter kind="pop" style={{ flex: 1 }}>
      <Tap
        onPress={onPress}
        accessibilityLabel={label}
        className={`fb-tile ${tinted ? "is-tinted" : ""}`}
      >
        {children}
        <span className="fb-tile-label">{label}</span>
      </Tap>
    </Enter>
  );
}

export function ProgressBar({
  progress,
  height = 12,
  className,
}: {
  progress: number;
  height?: number;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(1, progress));
  return (
    <div
      className={`fb-progress ${className ?? ""}`}
      style={{ height, borderRadius: height / 2 }}
    >
      <div style={{ width: `${clamped * 100}%`, height: "100%", borderRadius: height / 2, background: COLORS.accent }} />
    </div>
  );
}

export function SearchBar({
  value,
  onChangeText,
  placeholder,
  right,
  autoFocus,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  right?: ReactNode;
  autoFocus?: boolean;
}) {
  return (
    <Enter>
      <div className="fb-search">
        <Search size={21} color={COLORS.inkSoft} />
        <input
          value={value}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
        />
        {right}
      </div>
    </Enter>
  );
}

export function Composer({
  value,
  onChangeText,
  placeholder,
  onSubmit,
  trailing,
  editable = true,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  onSubmit?: () => void;
  trailing: ReactNode;
  editable?: boolean;
}) {
  return (
    <Enter kind="rise">
      <div className="fb-composer">
        <input
          value={value}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder={placeholder}
          disabled={!editable}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSubmit?.();
            }
          }}
        />
        {trailing}
      </div>
    </Enter>
  );
}

export function AccentCircle({
  onPress,
  children,
  size = 44,
  dark,
  accessibilityLabel,
  disabled,
}: {
  onPress?: () => void;
  children: ReactNode;
  size?: number;
  dark?: boolean;
  accessibilityLabel?: string;
  disabled?: boolean;
}) {
  return (
    <Tap
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      className="fb-accent-circle"
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        background: dark ? COLORS.ink : COLORS.accent,
      }}
    >
      {children}
    </Tap>
  );
}

export function Avatar({
  name,
  uri,
  size = 96,
}: {
  name?: string;
  uri?: string;
  size?: number;
}) {
  const initials = name ? initialsOf(name) : "";
  return (
    <div
      className="fb-avatar"
      style={{ width: size, height: size, borderRadius: size / 2, fontSize: size * 0.38 }}
    >
      {uri ? (
        <img src={uri} alt="" style={{ width: size, height: size, objectFit: "cover" }} />
      ) : initials ? (
        initials
      ) : (
        <User size={size * 0.6} color={COLORS.ink} />
      )}
    </div>
  );
}

export function Sheet({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(visible);
  const [open, setOpen] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      const t = requestAnimationFrame(() => setOpen(true));
      return () => cancelAnimationFrame(t);
    }
    setOpen(false);
    const t = setTimeout(() => setMounted(false), 180);
    return () => clearTimeout(t);
  }, [visible]);

  if (!mounted) return null;

  return (
    <div className={`fb-sheet-root ${open ? "is-open" : ""}`}>
      <button type="button" className="fb-sheet-scrim" aria-label="Dismiss" onClick={onClose} />
      <div className="fb-sheet">{children}</div>
    </div>
  );
}

export interface SheetOption {
  label: string;
  icon: ReactNode;
  onPress: () => void;
  selected?: boolean;
}

export function ActionSheet({
  visible,
  title,
  options,
  onClose,
}: {
  visible: boolean;
  title?: string;
  options: SheetOption[];
  onClose: () => void;
}) {
  return (
    <Sheet visible={visible} onClose={onClose}>
      {title ? <div className="fb-sheet-title">{title}</div> : null}
      {options.map((opt) => (
        <Tap
          key={opt.label}
          onPress={() => {
            onClose();
            opt.onPress();
          }}
          accessibilityLabel={opt.label}
          className={`fb-sheet-option ${opt.selected ? "is-selected" : ""}`}
        >
          <span className="fb-sheet-option-icon">{opt.icon}</span>
          <span className={opt.selected ? "fb-sheet-option-label is-selected" : "fb-sheet-option-label"}>
            {opt.label}
          </span>
          {opt.selected ? <Check size={20} color={COLORS.ink} /> : null}
        </Tap>
      ))}
    </Sheet>
  );
}

export function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, 4200);
    return () => clearTimeout(t);
  }, [message, onClose]);
  if (!message) return null;
  return (
    <div className="fb-toast-wrap" role="alert">
      <div className="fb-toast">
        <span>{message}</span>
        <Tap onPress={onClose} accessibilityLabel="Dismiss" className="fb-toast-btn">
          OK
        </Tap>
      </div>
    </div>
  );
}

export function Waveform({ levels, slots = 38 }: { levels: number[]; slots?: number }) {
  const ghost = useRef(
    Array.from({ length: slots }, (_, i) => 0.18 + 0.32 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6))),
  ).current;
  const visible = levels.slice(-slots);
  return (
    <div className="fb-wave">
      {Array.from({ length: slots }, (_, i) => {
        const filled = i < visible.length;
        const v = filled ? visible[i] : ghost[i];
        return (
          <span
            key={i}
            style={{
              width: 4,
              height: Math.max(5, v * 56),
              borderRadius: 2,
              background: filled ? COLORS.ink : COLORS.inkTrack,
            }}
          />
        );
      })}
    </div>
  );
}

export const Icons = {
  Help: HelpCircle,
  Bell,
  Mic,
  Volume: Volume2,
  Folder,
  User,
  Home,
  ArrowLeft,
  ArrowUp,
  X,
  MoreH: MoreHorizontal,
  MoreV: MoreVertical,
  Search,
  Download,
  FileText,
  Play,
  Pause,
  Square,
  Check,
  ChevronRight,
  ChevronDown,
  Crown,
};

export { COLORS, SHADOW };
