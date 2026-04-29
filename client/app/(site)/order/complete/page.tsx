import Link from "next/link";
import OrderCompleteClient from "./OrderCompleteClient";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OrderCompletePage(props: Props) {
  const sp = props.searchParams ? await props.searchParams : {};
  const rawAmount =
    typeof sp.amount === "string" ? Number.parseInt(sp.amount, 10) : Number.NaN;
  const paidAmount = Number.isFinite(rawAmount) && rawAmount >= 1 ? rawAmount : 50_000;
  const codesParam =
    typeof sp.codes === "string"
      ? sp.codes
      : Array.isArray(sp.codes)
        ? sp.codes.filter((x): x is string => typeof x === "string").join(",")
        : "";

  return (
    <main className="page">
      <div className="container narrow-page">
        <nav className="breadcrumb">
          <Link href="/">홈</Link>
          <span className="sep">/</span>
          <strong>주문 완료</strong>
        </nav>
        <OrderCompleteClient paidAmount={paidAmount} codesParam={codesParam} />
      </div>
    </main>
  );
}
