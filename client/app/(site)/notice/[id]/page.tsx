import Link from "next/link";
import { notFound } from "next/navigation";

const bodies: Record<string, { title: string; date: string; body: string }> = {
  "1": {
    title: "[공지] 토탈쿠폰 구매 사이트 OPEN 안내",
    date: "2026.04.28",
    body: "CINEPARK COUPON 토탈쿠폰 구매 서비스가 목업 형태로 오픈되었습니다. 결제 연동 및 실제 발권 전까지는 테스트 데이터로 표시됩니다.",
  },
  "2": {
    title: "[공지] 결제 완료 후 환불 미제공 정책 안내",
    date: "2026.04.28",
    body: "목업 단계에서는 환불 프로세스를 제공하지 않습니다. 운영 정책은 별도 공지 예정입니다.",
  },
  "3": {
    title: "[안내] 마이페이지에서 쿠폰번호 확인 방법",
    date: "2026.04.20",
    body: "마이페이지의 구매한 쿠폰 조회 테이블에서 쿠폰번호를 확인할 수 있습니다.",
  },
  "4": {
    title: "[안내] 시네파크 예매 연동 안내",
    date: "2026.04.15",
    body: "예매는 시네파크 공식 예매 채널에서 진행합니다. 쿠폰번호 입력 방식은 예매 화면 안내를 따릅니다.",
  },
  "5": {
    title: "[안내] 결제 수단 PortOne / Toss 안내",
    date: "2026.04.10",
    body: "결제는 PortOne 및 TossPayments 연동을 전제로 합니다. 목업 결제 버튼은 완료 화면으로만 이동합니다.",
  },
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function NoticeDetailPage(props: Props) {
  const { id } = await props.params;
  const item = bodies[id];
  if (!item) notFound();

  return (
    <main className="page">
      <div className="container narrow-page">
        <nav className="breadcrumb">
          <Link href="/">홈</Link>
          <span className="sep">/</span>
          <Link href="/notice">공지사항</Link>
          <span className="sep">/</span>
          <strong>상세</strong>
        </nav>

        <article className="static-article panel flat">
          <p className="notice-detail-date">{item.date}</p>
          <h1 className="static-title">{item.title}</h1>
          <p className="static-body">{item.body}</p>
          <div className="static-cta-row">
            <Link href="/notice" className="button secondary">
              목록
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}
