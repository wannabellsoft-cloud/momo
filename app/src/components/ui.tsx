"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon } from "./momo/Icon";

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

/** White card · radius 24 · card shadow. */
export function Card({ children, className, hero }: { children: ReactNode; className?: string; hero?: boolean }) {
  return <div className={cx("bg-(--surface-card) shadow-(--shadow-card)", hero ? "rounded-[28px]" : "rounded-[24px]", className)}>{children}</div>;
}

/** Eyebrow + XL heading, used at the top of each tab. */
export function ScreenTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="pt-2">
      <div className="text-[12px] font-extrabold tracking-[1.2px] text-(--action-primary)">{eyebrow}</div>
      <h1 className="m-0 text-[28px] leading-[38px] font-extrabold">{title}</h1>
    </div>
  );
}

/** Sub-screen header with a round back button. */
export function BackHeader({ href, eyebrow, title }: { href: string; eyebrow: string; title: string }) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <Link href={href} aria-label="กลับ" className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-(--surface-card) text-(--text-primary) shadow-(--shadow-soft)">
        <Icon name="left" size={20} />
      </Link>
      <div>
        <div className="text-[12px] font-extrabold tracking-[1.2px] text-(--action-primary)">{eyebrow}</div>
        <h1 className="m-0 text-[22px] leading-[30px] font-extrabold">{title}</h1>
      </div>
    </div>
  );
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { size?: "lg" | "md" | "sm" };

/** Primary CTA — deep rose (#C4466F) so white text passes WCAG AA. lg 56 · md 52 · sm 44. */
export function PrimaryButton({ size = "lg", className, children, ...rest }: BtnProps) {
  const h = size === "lg" ? "h-14 rounded-[20px] text-[17px]" : size === "md" ? "h-[52px] rounded-[18px] text-[16px]" : "h-11 rounded-full px-4 text-[14px]";
  return (
    <button
      type="button"
      {...rest}
      className={cx(
        "press flex cursor-pointer items-center justify-center gap-2 border-0 bg-(--action-primary) font-extrabold text-(--text-on-action) shadow-(--shadow-button) hover:bg-(--action-primary-hover) active:bg-(--action-primary-pressed) disabled:cursor-not-allowed disabled:bg-(--action-disabled-bg) disabled:text-(--action-disabled-text) disabled:shadow-none",
        h,
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Outline secondary button (white, 1.5px border). */
export function OutlineButton({ className, children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...rest}
      className={cx("press flex cursor-pointer items-center justify-center gap-2 border-[1.5px] border-solid border-(--border-default) bg-(--surface-card) font-extrabold text-(--text-primary)", className)}
    >
      {children}
    </button>
  );
}

/** Soft pink cancel / tertiary button. */
export function SoftButton({ className, children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" {...rest} className={cx("press flex cursor-pointer items-center justify-center gap-2 border-0 bg-(--bg-subtle) font-extrabold text-(--action-soft-text)", className)}>
      {children}
    </button>
  );
}

/** Pill segmented control (role=radiogroup). */
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  label,
  track = "subtle",
  compact,
}: {
  options: [T, string][];
  value: T;
  onChange: (v: T) => void;
  label: string;
  track?: "subtle" | "card";
  compact?: boolean;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cx("flex rounded-full p-[3px]", track === "subtle" ? "bg-(--bg-subtle)" : "bg-(--surface-card)", track === "card" && !compact && "shadow-(--shadow-soft)")}>
      {options.map(([k, text]) => {
        const on = k === value;
        return (
          <button
            key={String(k)}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(k)}
            className={cx(
              "cursor-pointer rounded-full border-0 font-extrabold transition-all duration-200 ease-(--ease-out)",
              compact ? "h-9 flex-none px-3 text-[13px]" : "h-10 flex-1 text-[14px]",
              on ? "bg-(--surface-card) text-(--action-soft-text) shadow-(--shadow-seg)" : "bg-transparent text-(--text-secondary)",
            )}
          >
            {text}
          </button>
        );
      })}
    </div>
  );
}

/** iOS-style switch, 52×32. */
export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx("relative h-8 w-[52px] flex-none cursor-pointer rounded-full border-0 transition-colors duration-200", checked ? "bg-(--action-primary)" : "bg-(--border-default)")}
    >
      <span
        className="absolute top-[3px] h-[26px] w-[26px] rounded-full bg-white shadow-[0_2px_6px_rgba(103,68,84,.25)] transition-[left] duration-[220ms] ease-(--ease-spring)"
        style={{ left: checked ? 23 : 3 }}
      />
    </button>
  );
}

/** Label + helper on the left, control on the right. */
export function RowLabel({ title, sub }: { title: ReactNode; sub?: ReactNode }) {
  return (
    <span className="flex-1">
      <span className="block text-[15px] font-extrabold">{title}</span>
      {sub && <span className="block text-[12px] text-(--text-secondary)">{sub}</span>}
    </span>
  );
}

export function DemoLabel() {
  return <div className="text-center text-[12px] leading-[18px] text-(--text-secondary)">ข้อมูลตัวอย่าง · Demo data</div>;
}
