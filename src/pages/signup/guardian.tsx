// src/pages/signup/guardian.tsx
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState, type FormEvent } from "react";

export default function GuardianSignUp() {
  const router = useRouter();


  const [email, setEmail] = useState("sanghoon.lee+guardian@aigem.app");
  const [password, setPassword] = useState("aigem123");
  const [name, setName] = useState("이상훈");
  const [guardianPhone, setGuardianPhone] = useState("010-1234-5678");
  const [relation, setRelation] = useState<"parent" | "spouse" | "child" | "sibling" | "etc">("child");
  const [patientId, setPatientId] = useState("p001");
  const [patientName, setPatientName] = useState("김복순");
  const [note, setNote] = useState("환자 아들 / 주간 연락 가능");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // (선택) 만약 /signup/guardian?email=... 로 들어오면 그 이메일을 우선 적용
  useEffect(() => {
    const q = router.query.email;
    if (typeof q === "string" && q) setEmail(q);
  }, [router.query.email]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    // 간단 검증
    if (!email || !name || !password || !guardianPhone || !relation || !patientId) {
      setError("모든 필수 항목을 입력해주세요.");
      return;
    }
    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }

    setLoading(true);
    try {
      // ✅ 베타용: 실제 회원가입 대신 세션만 기록 후 대시보드 이동
      sessionStorage.setItem(
        "aigem-dev-mock",
        JSON.stringify({
          role: "guardian",
          email,
          name,
          guardianPhone,
          relation,
          patientId,
          patientName,
          note,
        })
      );

      alert("회원가입이 완료되었습니다!");
      router.push("/dashboard/guardian");
    } catch {
      setError("알 수 없는 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>AIGEM | 보호자 회원가입</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="auth-page">
        <section className="auth-card" aria-labelledby="title">
          {/* 로고 */}
          <div style={{ display: "grid", placeItems: "center", marginBottom: 16 }}>
            <Image src="/logo_org.png" alt="AIGEM" width={160} height={40} priority />
          </div>

          <h1 id="title" className="auth-title" style={{ textAlign: "center" }}>
            보호자 회원가입
          </h1>
          <p className="subtitle" style={{ textAlign: "center" }}>
            개인 정보와 환자 연결 정보를 입력해 주세요.
          </p>

          {/* 에러 메시지 */}
          {error && <div className="error-message" role="alert">{error}</div>}

          <form className="form" onSubmit={handleSubmit}>
            {/* ── 이메일 ───────────────────────────── */}
            <div className="field">
              <label className="label" htmlFor="email">이메일</label>
              <input
                id="email"
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="guardian@example.com"
                required
              />
            </div>

            {/* ── 보호자 기본 정보 ─────────────────── */}
            <div className="field">
              <label className="label" htmlFor="name">이름</label>
              <input
                id="name"
                className="input"
                placeholder="홍길동"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label className="label" htmlFor="password">비밀번호</label>
              <input
                id="password"
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div className="inline-group">
              <div className="field" style={{ margin: 0 }}>
                <label className="label" htmlFor="guardianPhone">휴대전화 (알림 수신)</label>
                <input
                  id="guardianPhone"
                  className="input"
                  placeholder="010-1234-5678"
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(e.target.value)}
                  required
                />
              </div>
              <button type="button" className="btn-soft" aria-label="휴대전화 인증">인증</button>
            </div>

            {/* ── 환자 연결 정보 ───────────────────── */}
            <h2 className="section">환자 연결</h2>

            <div className="field">
              <label className="label" htmlFor="relation">관계</label>
              <select
                id="relation"
                className="input"
                value={relation}
                onChange={(e) =>
                  setRelation(e.target.value as "parent" | "spouse" | "child" | "sibling" | "etc")
                }
                required
              >
                <option value="" disabled>관계를 선택하세요</option>
                <option value="parent">부모</option>
                <option value="spouse">배우자</option>
                <option value="child">자녀</option>
                <option value="sibling">형제/자매</option>
                <option value="etc">기타</option>
              </select>
            </div>

            <div className="inline-group">
              <div className="field" style={{ margin: 0 }}>
                <label className="label" htmlFor="patientId">환자번호 / 연결코드</label>
                <input
                  id="patientId"
                  className="input"
                  placeholder="예) p001"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  required
                />
              </div>
              <button type="button" className="btn-soft" aria-label="환자 조회">조회</button>
            </div>

            <div className="field">
              <label className="label" htmlFor="patientName">환자 이름</label>
              <input
                id="patientName"
                className="input"
                placeholder="조회 후 자동입력"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                required
              />
            </div>

            {/* (선택) 메모 */}
            <div className="field">
              <label className="label" htmlFor="note">메모 (선택)</label>
              <input
                id="note"
                className="input"
                placeholder="예) 보호자 2 / 야간 연락 가능"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary w100" disabled={loading}>
              {loading ? "처리 중..." : "가입하기"}
            </button>

            <p className="foot">
              이미 계정이 있으신가요? <Link href="/login" className="auth-link">로그인</Link>
            </p>
          </form>
        </section>
      </div>

      {/* 스타일 */}
      <style jsx>{`
        .auth-page{
          min-height:100dvh; display:flex; align-items:center; justify-content:center;
          background:#f0f6ff; padding:16px;
        }
        .auth-card{
          width:100%; max-width:420px; background:#fff; border-radius:16px; padding:24px;
          box-shadow:0 10px 30px rgba(21,44,84,.08); text-align:left;
        }
        .auth-title{ margin:0 0 6px; font-size:22px; font-weight:800; color:#0b1b33; }
        .subtitle{ margin:0 0 16px; color:#475569; font-size:14px; }

        .form{ display:grid; gap:12px; }
        .field{ display:flex; flex-direction:column; gap:6px; }
        .label{ font-size:12px; color:#6b7280; }
        .section{ font-size:14px; font-weight:800; color:#0b1b33; margin:8px 0 0; }

        :global(.input){
          width:100%; background:#eef3fb; border:1px solid #d7e6ff;
          border-radius:12px; padding:12px 14px; font-size:14px;
          outline:none; transition:.15s border-color,.15s box-shadow,.15s background;
        }
        :global(.input:focus){
          border-color:#4a86ff; background:#fff; box-shadow:0 0 0 3px rgba(74,134,255,.15);
        }
        :global(input[disabled]), :global(select:disabled){
          color:#64748b; background:#f3f6fd; cursor:not-allowed;
        }

        .inline-group{
          display:grid; grid-template-columns: 1fr 92px; gap:10px; align-items:end;
        }
        @media (min-width:480px){
          .inline-group{ grid-template-columns: 1fr 104px; }
        }

        .btn-soft{
          height:44px; border-radius:12px; border:1px solid #e1e9ff;
          background:linear-gradient(180deg,#f7faff 0%,#ffffff 100%);
          color:#1f3b7a; font-weight:800; box-shadow:0 4px 12px rgba(21,44,84,.06);
          cursor:pointer; transition:.18s ease; padding:0 12px;
        }
        .btn-soft:hover{ transform:translateY(-1px); box-shadow:0 10px 20px rgba(21,44,84,.10); border-color:#d1dcff; }

        .helper{ color:#6b7280; font-size:12px; }
        .w100{ width:100%; }
        .foot{ margin-top:6px; font-size:14px; color:#334155; text-align:center; }
        .auth-link{ color:#2563eb; font-weight:600; text-decoration:none; }
        .auth-link:hover{ text-decoration:underline; }

        .error-message{
          background:#fee; color:#dc2626; padding:12px;
          border-radius:8px; margin-bottom:16px;
          font-size:14px; text-align:center;
        }
      `}</style>
    </>
  );
}
