import Link from "next/link";
import HomeCatalog from "../components/HomeCatalog";
import NoticeModal from "../components/NoticeModal";

export default function HomePage() {
  return (
    <main className="page" id="top">
      <NoticeModal />

      <HomeCatalog />

      <aside className="quick-sidebar">
        <a href="https://cinepark.kr/" target="_blank" rel="noreferrer">
          사용하기
        </a>
        <Link href="/coupons/total-1">상품 보기</Link>
        <Link href="/cart">장바구니</Link>
        <Link href="/mypage">내 쿠폰</Link>
        <Link href="/order/complete">주문 완료</Link>
        <a href="#top">TOP</a>
      </aside>
    </main>
  );
}
