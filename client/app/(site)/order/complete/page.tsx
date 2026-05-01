import Link from "next/link";
import OrderCompleteClient from "./OrderCompleteClient";

export default function OrderCompletePage() {
  return (
    <main className="page pay-done-page">
      <div className="container pay-done-wrap">
        <nav className="breadcrumb pay-done-breadcrumb">
          <Link href="/">홈</Link>
          <span className="sep">/</span>
          <strong>주문 완료</strong>
        </nav>
        <OrderCompleteClient />
      </div>
    </main>
  );
}
