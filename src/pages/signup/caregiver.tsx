// src/pages/signup/caregiver.tsx
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

export default function CaregiverSignUp() {
  const router = useRouter();

  // ✅ 데모용 기본값(자동 기입)
  const [email, setEmail] = useState("eunjeong.choi@aigem.dev");
  const [password, setPassword] = useState("aigem123");
  const [name, setName] = useState("최은정");               // 고정 요양사
  const [careCert, setCareCert] = useState("CG-2021-102938"); // 요양보호사 자격번호
  const [phone, setPhone] = useState("010-3333-4444");
  const [hospital, setHospital] = useState("AIGEM 요양병원");
  const [team, setTeam] = useState("본관 3병동 · 요양팀");
  const [shift, setShift] = useState<"day" | "night" | "rotate">("rotate");
  const [staffId, setStaffId] = useState("CGV-0001");       // 선택
  const [years, setYears] = useState<number | "">(5);       // 선택

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // ✅ 필수값만 검증 (베타: 서버 호출 없음)
    if (!email || !name || !password || !careCert || !phone || !hospital || !team) {
      setError("모든 필수 항목을 입력해주세요.");
      return;
    }
    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }

    setLoading(true);
    try {
      // ✅ 데모: 세션에 간단히 저장(선택)
      sessionStorage.setItem(
        "aigem-dev-mock",
        JSON.stringify({ role: "caregiver", email, name })
      );

      alert("회원가입이 완료되었습니다!");
      router.push("/dashboard/caregiver");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>AIGEM | 요양사 회원가입</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="auth-page">
        <section className="auth-card" aria-labelledby="title">
          <div style={{ display: "grid", placeItems: "center", marginBottom: 16 }}>
            <Image src="/logo_org.png" alt="AIGEM" width={160} height={40} priority />
          </div>

          <h1 id="title" className="auth-title" style={{ textAlign: "center" }}>
            요양사 회원가입
          </h1>
          <p className="subtitle" style={{ textAlign: "center" }}>
            기본 정보와 근무 정보를 입력해 주세요.
            <br />
            <small style={{ color: "#64748b" }}>(데모용: 기본 값이 자동으로 채워져 있습니다)</small>
          </p>

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <form className="form" onSubmit={handleSubmit}>
            {/* 이메일 */}
            <div className="field">
              <label className="label" htmlFor="email">이메일</label>
              <input
                id="email"
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="caregiver@example.com"
                required
              />
            </div>

            {/* 기본 정보 */}
            <div className="field">
              <label className="label" htmlFor="name">이름</label>
              <input
                id="name"
                className="input"
                placeholder="최은정"
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

            {/* 자격/연락 */}
            <h2 className="section">자격/연락</h2>
            <div className="inline-group">
              <div className="field" style={{ margin: 0 }}>
                <label className="label" htmlFor="careCert">요양보호사 자격번호</label>
                <input
                  id="careCert"
                  className="input"
                  placeholder="예) CG-2021-102938"
                  value={careCert}
                  onChange={(e) => setCareCert(e.target.value)}
                  required
                />
              </div>
              <button type="button" className="btn-soft" aria-label="자격번호 확인">확인</button>
            </div>

            <div className="inline-group">
              <div className="field" style={{ margin: 0 }}>
                <label className="label" htmlFor="phone">전화번호</label>
                <input
                  id="phone"
                  className="input"
                  placeholder="010-3333-4444"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <button type="button" className="btn-soft" aria-label="전화번호 인증">인증</button>
            </div>

            {/* 근무 정보 */}
            <h2 className="section">근무 정보</h2>
            <div className="inline-group">
              <div className="field" style={{ margin: 0 }}>
                <label className="label" htmlFor="hospital">소속 병원</label>
                <input
                  id="hospital"
                  className="input"
                  placeholder="AIGEM 요양병원"
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  required
                />
              </div>
              <button type="button" className="btn-soft" aria-label="병원 찾기">찾기</button>
            </div>

            <div className="field">
              <label className="label" htmlFor="team">담당 팀/병동</label>
              <input
                id="team"
                className="input"
                placeholder="본관 3병동 · 요양팀"
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                required
              />
            </div>

            <div className="inline-group">
              <div className="field" style={{ margin: 0 }}>
                <label className="label" htmlFor="shift">근무 형태</label>
                <select
                  id="shift"
                  className="input"
                  value={shift}
                  onChange={(e) => setShift(e.target.value as any)}
                >
                  <option value="day">주간</option>
                  <option value="night">야간</option>
                  <option value="rotate">교대</option>
                </select>
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label className="label" htmlFor="years">경력(년)</label>
                <input
                  id="years"
                  className="input"
                  type="number"
                  min={0}
                  placeholder="예) 5"
                  value={years}
                  onChange={(e) => setYears(e.target.value === "" ? "" : Number(e.target.value))}
                />
              </div>
            </div>

            <div className="field">
              <label className="label" htmlFor="staffId">직원번호/병원 코드 (선택)</label>
              <input
                id="staffId"
                className="input"
                placeholder="예) CGV-0001"
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
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
          display:grid; grid-template-columns: 1fr 1fr; gap:10px; align-items:end;
        }
        @media (min-width:480px){
          .inline-group{ grid-template-columns: 1fr 1fr; }
        }

        .btn-soft{
          height:44px; border-radius:12px; border:1px solid #e1e9ff;
          background:linear-gradient(180deg,#f7faff 0%,#ffffff 100%);
          color:#1f3b7a; font-weight:800; box-shadow:0 4px 12px rgba(21,44,84,.06);
          cursor:pointer; transition:.18s ease; padding:0 12px;
        }
        .btn-soft:hover{ transform:translateY(-1px); box-shadow:0 10px 20px rgba(21,44,84,.10); border-color:#d1dcff; }

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
