import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

// ✅ 데모 환자 고정값 (김복순)
const demoPatient = {
  email: "boksun.kim@aigem-care.local",
  password: "aigem123",
  name: "김복순",
  birth: "1938-03-14",          // 만 87세 예시
  patientId: "p001",            // 고정 pid
  phone: "010-5555-5555",
  hospital: "AIGEM 요양병원",
};

export default function PatientSignUp() {
  const router = useRouter();

  // ✅ 초기값을 데모 환자값으로 채움
  const [email, setEmail] = useState(demoPatient.email);
  const [password, setPassword] = useState(demoPatient.password);
  const [name, setName] = useState(demoPatient.name);
  const [birth, setBirth] = useState(demoPatient.birth);
  const [patientId, setPatientId] = useState(demoPatient.patientId);
  const [phone, setPhone] = useState(demoPatient.phone);
  const [hospital, setHospital] = useState(demoPatient.hospital);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // (옵션) URL로 이메일이 넘어오면 우선 적용 — 데모에선 거의 안 씀
  useEffect(() => {
    const q = router.query.email;
    if (typeof q === "string" && q) setEmail(q);
  }, [router.query.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 필수값만 체크
    if (!email || !name || !password || !birth || !patientId) {
      setError("모든 필수 항목을 입력해주세요.");
      return;
    }
    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }

    setLoading(true);
    try {
      // ✅ 베타: 실제 가입 대신 모킹 로그인 플래그만 남기고 진행
      sessionStorage.setItem(
        "aigem-dev-mock",
        JSON.stringify({
          role: "patient",
          email,
          name,
          patientId,
        })
      );

      alert("회원가입이 완료되었습니다.");
      router.push("/dashboard/patient");
    } catch (err) {
      setError("알 수 없는 에러가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ 데모값 다시 채우기
  const refillDemo = () => {
    setEmail(demoPatient.email);
    setPassword(demoPatient.password);
    setName(demoPatient.name);
    setBirth(demoPatient.birth);
    setPatientId(demoPatient.patientId);
    setPhone(demoPatient.phone);
    setHospital(demoPatient.hospital);
    setError("");
  };

  return (
    <>
      <Head>
        <title>AIGEM | 환자 회원가입</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="auth-page">
        <section className="auth-card" aria-labelledby="title">
          <div style={{ display: "grid", placeItems: "center", marginBottom: 16 }}>
            <Image src="/logo_org.png" alt="AIGEM" width={160} height={40} priority />
          </div>

          <h1 id="title" className="auth-title" style={{ textAlign: "center" }}>
            환자 회원가입
          </h1>
          <p className="subtitle" style={{ textAlign: "center" }}>
            기본 정보와 환자번호 인증을 입력해 주세요. (데모용 자동기입)
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
                placeholder="example@email.com"
                required
              />
            </div>

            {/* 기본 정보 */}
            <div className="field">
              <label className="label" htmlFor="name">이름</label>
              <input
                id="name"
                className="input"
                placeholder="김복순"
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

            <div className="field">
              <label className="label" htmlFor="birth">생년월일</label>
              <input
                id="birth"
                type="date"
                className="input"
                value={birth}
                onChange={(e) => setBirth(e.target.value)}
                required
              />
            </div>

            {/* 환자 인증 */}
            <h2 className="section">환자 인증</h2>
            <div className="inline-group">
              <div className="field" style={{ margin: 0 }}>
                <label className="label" htmlFor="patientId">환자번호</label>
                <input
                  id="patientId"
                  className="input"
                  placeholder="예) p001"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  required
                />
              </div>
              <button type="button" className="btn-soft" aria-label="환자번호 인증">인증</button>
            </div>

            {/* 선택 정보 */}
            <div className="inline-group">
              <div className="field" style={{ margin: 0 }}>
                <label className="label" htmlFor="phone">전화번호 (선택)</label>
                <input
                  id="phone"
                  className="input"
                  placeholder="010-5555-5555"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <button type="button" className="btn-soft" aria-label="전화번호 인증">인증</button>
            </div>

            <div className="inline-group">
              <div className="field" style={{ margin: 0 }}>
                <label className="label" htmlFor="hospital">주 진료 병원 (선택)</label>
                <input
                  id="hospital"
                  className="input"
                  placeholder="AIGEM 요양병원"
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                />
              </div>
              <button type="button" className="btn-soft" aria-label="병원 찾기">찾기</button>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" className="btn btn-primary w100" disabled={loading}>
                {loading ? "처리 중..." : "가입하기"}
              </button>
            </div>

            <p className="foot">
              이미 계정이 있으신가요? <Link href="/login" className="auth-link">로그인</Link>
            </p>
          </form>
        </section>
      </div>

      {/* 페이지 전용 스타일 (로그인/역할선택과 동일 톤 + 반응형) */}
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
        :global(input[disabled]){
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
