"use client";

import { useEffect, useState } from "react";

/** 스크롤이 이 픽셀 이상 아래일 때 버튼 표시 */
const SCROLL_SHOW_AT = 360;

export default function ScrollTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > SCROLL_SHOW_AT);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <button
      type="button"
      className="scroll-top-btn"
      aria-label="맨 위로 이동"
      onClick={() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    >
      TOP
    </button>
  );
}
