"use client";

import { useEffect } from "react";

type TermsType = "terms" | "privacy" | "marketing";

type TermsModalProps = {
  type: TermsType | null;
  onClose: () => void;
};

const TERMS_CONTENT: Record<TermsType, { title: string; body: string[] }> = {
  terms: {
    title: "이용약관",
    body: [
      "제1조 (목적) 본 약관은 토탈쿠폰 사이트(이하 '회사')가 제공하는 서비스 이용과 관련하여 회사와 회원의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.",
      "제2조 (서비스의 제공) 회사는 회원에게 토탈쿠폰 상품의 구매, 결제, 주문 조회 기능을 제공합니다.",
      "제3조 (회원의 의무) 회원은 회사가 제공하는 서비스를 본 약관 및 관련 법령에 따라 적법하게 이용해야 합니다.",
      "제4조 (환불 정책) 결제 완료 후 환불은 제공되지 않으며, 쿠폰 사용 여부와 관계없이 본 사이트에서는 환불 처리를 하지 않습니다.",
      "제5조 (책임 제한) 결제 이후 쿠폰 사용 및 예매와 관련된 책임은 시네파크 정책에 따릅니다.",
    ],
  },
  privacy: {
    title: "개인정보 수집·이용 동의",
    body: [
      "1. 수집 항목: 이메일, 비밀번호(암호화 저장), 성함, 전화번호",
      "2. 수집 목적: 회원 식별, 주문/결제 처리, 쿠폰 배정 및 마이페이지 조회",
      "3. 보유 및 이용 기간: 회원 탈퇴 시까지 (관련 법령에 따라 일정 기간 별도 보관 가능)",
      "4. 동의 거부 권리: 동의 거부 시 회원가입 및 서비스 이용이 제한될 수 있습니다.",
      "5. 제3자 제공: 결제 처리에 필요한 범위에 한해 PG사(PortOne, TossPayments)에 제공됩니다.",
    ],
  },
  marketing: {
    title: "마케팅 정보 수신 동의",
    body: [
      "1. 발송 채널: 이메일",
      "2. 발송 내용: 신규 상품 안내, 할인 이벤트, 프로모션 알림",
      "3. 수신 동의 거부 시에도 회원가입 및 서비스 이용은 가능합니다.",
      "4. 수신 동의는 마이페이지에서 언제든지 변경할 수 있습니다.",
    ],
  },
};

export default function TermsModal({ type, onClose }: TermsModalProps) {
  useEffect(() => {
    if (!type) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [type, onClose]);

  if (!type) return null;

  const content = TERMS_CONTENT[type];

  return (
    <div
      className="terms-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={content.title}
      onClick={onClose}
    >
      <div className="terms-modal" onClick={(e) => e.stopPropagation()}>
        <header className="terms-modal-header">
          <h3>{content.title}</h3>
          <button type="button" className="terms-modal-close" onClick={onClose} aria-label="닫기">
            ×
          </button>
        </header>
        <div className="terms-modal-body">
          {content.body.map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
        </div>
        <footer className="terms-modal-footer">
          <button type="button" className="auth-submit" onClick={onClose}>
            확인
          </button>
        </footer>
      </div>
    </div>
  );
}
