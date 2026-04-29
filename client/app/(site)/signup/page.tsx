"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import TermsModal from "../../components/TermsModal";
import { useAuth } from "../../../context/AuthContext";

type TermsType = "terms" | "privacy" | "marketing";

type SignupForm = {
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
  phone: string;
};

type Agreements = {
  terms: boolean;
  privacy: boolean;
  marketing: boolean;
};

const initialForm: SignupForm = {
  email: "",
  password: "",
  passwordConfirm: "",
  name: "",
  phone: "",
};

const initialAgreements: Agreements = {
  terms: false,
  privacy: false,
  marketing: false,
};

export default function SignupPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState<SignupForm>(initialForm);
  const [agreements, setAgreements] = useState<Agreements>(initialAgreements);
  const [openedTerm, setOpenedTerm] = useState<TermsType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const phoneDigits = useMemo(() => form.phone.replace(/\D/g, ""), [form.phone]);

  const handleChange = (key: keyof SignupForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleAgreeChange =
    (key: keyof Agreements) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setAgreements((prev) => ({ ...prev, [key]: e.target.checked }));
    };

  const allChecked = agreements.terms && agreements.privacy && agreements.marketing;
  const handleAgreeAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setAgreements({ terms: checked, privacy: checked, marketing: checked });
  };

  const passwordMismatch =
    form.password.length > 0 &&
    form.passwordConfirm.length > 0 &&
    form.password !== form.passwordConfirm;

  const canSubmit = useMemo(() => {
    return (
      form.email.length > 0 &&
      form.password.length >= 8 &&
      form.password === form.passwordConfirm &&
      form.name.length >= 2 &&
      phoneDigits.length >= 9 &&
      phoneDigits.length <= 11 &&
      agreements.terms &&
      agreements.privacy
    );
  }, [form.email, form.password, form.passwordConfirm, form.name.length, phoneDigits, agreements]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phoneNumber: phoneDigits,
        agreeTerms: true,
        agreePrivacy: true,
        agreeMarketing: agreements.marketing,
      });
      router.push("/mypage");
    } catch (err) {
      setError(err instanceof Error ? err.message : "회원가입에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page">
      <div className="auth-container">
        <section className="auth-card auth-card-wide">
          <header className="auth-header">
            <h1>회원가입</h1>
            <p>토탈쿠폰 구매 및 주문 관리를 위해 정보를 입력해주세요.</p>
          </header>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}
            <label className="auth-field">
              <span className="auth-label">이메일</span>
              <input
                type="email"
                placeholder="example@cinepark.kr"
                value={form.email}
                onChange={handleChange("email")}
                autoComplete="email"
                required
              />
            </label>

            <label className="auth-field">
              <span className="auth-label">비밀번호</span>
              <input
                type="password"
                placeholder="영문/숫자/특수문자 포함 8자 이상"
                value={form.password}
                onChange={handleChange("password")}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>

            <label className="auth-field">
              <span className="auth-label">비밀번호 재입력</span>
              <input
                type="password"
                placeholder="비밀번호 한 번 더 입력"
                value={form.passwordConfirm}
                onChange={handleChange("passwordConfirm")}
                autoComplete="new-password"
                required
              />
              {passwordMismatch && (
                <span className="auth-error">비밀번호가 일치하지 않습니다.</span>
              )}
            </label>

            <label className="auth-field">
              <span className="auth-label">성함</span>
              <input
                type="text"
                placeholder="실명을 입력해주세요"
                value={form.name}
                onChange={handleChange("name")}
                autoComplete="name"
                required
              />
            </label>

            <label className="auth-field">
              <span className="auth-label">전화번호</span>
              <input
                type="tel"
                placeholder="01012345678 (하이픈 없이)"
                value={form.phone}
                onChange={handleChange("phone")}
                autoComplete="tel"
                inputMode="numeric"
                required
              />
            </label>

            <div className="auth-agreements">
              <label className="auth-agree-all">
                <input type="checkbox" checked={allChecked} onChange={handleAgreeAll} />
                <span>전체 동의</span>
              </label>

              <div className="auth-agree-item">
                <label>
                  <input
                    type="checkbox"
                    checked={agreements.terms}
                    onChange={handleAgreeChange("terms")}
                    required
                  />
                  <span>
                    <strong>(필수)</strong> 이용약관 동의
                  </span>
                </label>
                <button
                  type="button"
                  className="auth-text-link small"
                  onClick={() => setOpenedTerm("terms")}
                >
                  보기
                </button>
              </div>

              <div className="auth-agree-item">
                <label>
                  <input
                    type="checkbox"
                    checked={agreements.privacy}
                    onChange={handleAgreeChange("privacy")}
                    required
                  />
                  <span>
                    <strong>(필수)</strong> 개인정보 수집·이용 동의
                  </span>
                </label>
                <button
                  type="button"
                  className="auth-text-link small"
                  onClick={() => setOpenedTerm("privacy")}
                >
                  보기
                </button>
              </div>

              <div className="auth-agree-item">
                <label>
                  <input
                    type="checkbox"
                    checked={agreements.marketing}
                    onChange={handleAgreeChange("marketing")}
                  />
                  <span>
                    <strong className="optional">(선택)</strong> 마케팅 정보 수신 동의
                  </span>
                </label>
                <button
                  type="button"
                  className="auth-text-link small"
                  onClick={() => setOpenedTerm("marketing")}
                >
                  보기
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit" disabled={!canSubmit || submitting}>
              {submitting ? "처리 중..." : "회원가입"}
            </button>
          </form>

          <div className="auth-extra">
            <span>이미 계정이 있으신가요?</span>
            <Link href="/login" className="auth-text-link">
              로그인
            </Link>
          </div>
        </section>
      </div>

      <TermsModal type={openedTerm} onClose={() => setOpenedTerm(null)} />
    </main>
  );
}
