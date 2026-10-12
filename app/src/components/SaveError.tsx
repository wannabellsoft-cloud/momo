"use client";

import { useState } from "react";
import { useMomo } from "@/lib/store";
import { useUI } from "@/lib/ui";
import { Icon } from "./momo/Icon";
import { MomoBunny } from "./momo/MomoBunny";
import { PrimaryButton, cx } from "./ui";

/** Screen 12 — save error. Previous data stays intact; retry rewrites the current state. */
export function SaveError() {
  const open = useUI((u) => u.saveError);
  const setSaveError = useUI((u) => u.setSaveError);
  const showToast = useUI((u) => u.showToast);
  const [retrying, setRetrying] = useState(false);

  const retry = () => {
    if (retrying) return;
    setRetrying(true);
    setTimeout(() => {
      useMomo.setState({}); // triggers persist → safeStorage.setItem
      setRetrying(false);
      if (!useUI.getState().saveError) showToast("เรียบร้อยแล้ว ข้อมูลครบนะ", "taken");
    }, 1600);
  };

  return (
    <div className={cx("fixed inset-0 z-[100] flex items-center justify-center bg-(--overlay) p-5 transition-opacity duration-[240ms]", open ? "opacity-100" : "pointer-events-none opacity-0")} aria-hidden={!open}>
      <div role="alertdialog" aria-modal="true" aria-labelledby="save-error-title" className="flex w-full max-w-[440px] flex-col items-center gap-[10px] rounded-[28px] bg-(--surface-card) px-5 py-7 text-center shadow-(--shadow-float)">
        <div className="flex h-[180px] w-[180px] items-center justify-center rounded-full bg-(--surface-secondary)">
          <MomoBunny state={retrying ? "loading" : "error"} still={!open} size={150} />
        </div>
        <div className="flex h-7 items-center gap-[6px] rounded-full bg-(--info-bg) px-3 text-[12px] font-extrabold text-(--info-fg)">
          <Icon name="info" size={14} stroke={2.6} />
          บันทึกไม่สำเร็จ
        </div>
        <h2 id="save-error-title" className="m-0 text-[20px] leading-[30px] font-extrabold">โมโม่บันทึกไม่ทัน</h2>
        <p className="m-0 max-w-[290px] text-[15px] leading-[24px] text-pretty text-(--text-secondary)">การบันทึกครั้งล่าสุดยังไม่ถูกเก็บ ข้อมูลเดิมยังอยู่ครบ ลองอีกครั้งได้เลย</p>
        <PrimaryButton size="md" className="mt-2 px-6" onClick={retry} aria-busy={retrying}>
          <Icon name="refresh" size={18} />
          {retrying ? "กำลังลองใหม่…" : "ลองอีกครั้ง"}
        </PrimaryButton>
        <button type="button" onClick={() => setSaveError(false)} className="h-11 cursor-pointer border-0 bg-transparent px-4 text-[14px] font-extrabold text-(--action-soft-text)">
          กลับหน้าหลัก
        </button>
      </div>
    </div>
  );
}
