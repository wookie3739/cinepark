import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "쿠폰 마켓",
  description: "영화관 토탈쿠폰을 한곳에서 검색하고 비교해 보세요.",
};

export default function CouponsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
