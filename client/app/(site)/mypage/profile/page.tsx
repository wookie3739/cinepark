"use client";

import Link from "next/link";
import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import { fetchMyProfile, patchMyProfile } from "../../../../lib/api/me";

function digitsOnly(s: string): string {
  return s.replace(/\D/g, "");
}

export default function MyPageProfilePage() {
  const router = useRouter();
  const { accessToken, isReady, syncUserFromProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fetchErr, setFetchErr] = useState<string | null>(null);
  const [formErr, setFormErr] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const phoneDigits = useMemo(() => digitsOnly(phone), [phone]);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setFetchErr(null);
    setLoading(true);
    try {
      const p = await fetchMyProfile(accessToken);
      setEmail(p.email);
      setName(p.name);
      const ph = p.phoneNumber?.trim();
      setPhone(ph ? formatPhoneDisplay(ph) : "");
    } catch (e: unknown) {
      setFetchErr(e instanceof Error ? e.message : "내 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!isReady) return;
    if (!accessToken) {
      setLoading(false);
      return;
    }
    void load();
  }, [isReady, accessToken, load]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormErr(null);
    setOkMsg(null);
    if (!accessToken) return;
    if (name.trim().length < 2) {
      setFormErr("이름을 2자 이상 입력해 주세요.");
      return;
    }
    if (phoneDigits.length < 9 || phoneDigits.length > 11) {
      setFormErr("휴대폰 번호는 숫자 9~11자리로 입력해 주세요.");
      return;
    }
    setSaving(true);
    try {
      const updated = await patchMyProfile(accessToken, {
        name: name.trim(),
        phoneNumber: phoneDigits,
      });
      await syncUserFromProfile(updated);
      setOkMsg("내 정보가 저장되었습니다.");
    } catch (err: unknown) {
      setFormErr(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (isReady && !accessToken) {
      router.replace("/login");
    }
  }, [isReady, accessToken, router]);

  if (!isReady) {
    return (
      <section className="panel">
        <h2>내 정보 수정</h2>
        <p className="muted">불러오는 중…</p>
      </section>
    );
  }

  if (!accessToken) {
    return (
      <section className="panel">
        <h2>내 정보 수정</h2>
        <p className="muted">로그인이 필요합니다.</p>
        <div className="button-row">
          <Link href="/login" className="button">
            로그인
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="panel">
        <h2>내 정보 수정</h2>
        <p className="muted">이름과 휴대폰을 변경할 수 있습니다. 이메일은 로그인 ID로 수정할 수 없습니다.</p>

        {fetchErr ? (
          <>
            <p className="card-inline-msg" role="alert">
              {fetchErr}
            </p>
            <div className="button-row">
              <button type="button" className="button secondary" onClick={() => void load()}>
                다시 시도
              </button>
            </div>
          </>
        ) : null}

        {loading ? (
          <p className="muted">내 정보 불러오는 중…</p>
        ) : (
          <form className="profile-form" onSubmit={onSubmit}>
            <div className="auth-field">
              <label className="auth-label" htmlFor="prof-email">
                이메일 (로그인 ID)
              </label>
              <input id="prof-email" type="email" value={email} readOnly disabled aria-readonly />
            </div>
            <div className="auth-field">
              <label className="auth-label" htmlFor="prof-name">
                이름
              </label>
              <input
                id="prof-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                minLength={2}
                maxLength={50}
                required
              />
            </div>
            <div className="auth-field">
              <label className="auth-label" htmlFor="prof-phone">
                휴대폰
              </label>
              <input
                id="prof-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="01012345678"
                value={phone}
                onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
              />
              <span className="muted small-print">숫자만 또는 하이픈 포함 9~11자리 번호입니다.</span>
            </div>
            {formErr ? (
              <p className="card-inline-msg" role="alert">
                {formErr}
              </p>
            ) : null}
            {okMsg ? (
              <p className="card-inline-msg" role="status">
                {okMsg}
              </p>
            ) : null}
            <button type="submit" className="auth-submit" disabled={saving || loading}>
              {saving ? "저장 중…" : "저장하기"}
            </button>
          </form>
        )}
      </section>
    </>
  );
}

/** 표시용: 서버값(숫자만)→사용자 보기 편하게 */
function formatPhoneDisplay(digits: string): string {
  const d = digitsOnly(digits);
  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
  if (d.length <= 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7, 11)}`;
}

/** 입력: 숫자만 유지, 최대 11자리 표시 형식 부착 시도 */
function formatPhoneInput(raw: string): string {
  const d = digitsOnly(raw).slice(0, 11);
  return formatPhoneDisplay(d);
}
