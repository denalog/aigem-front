import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { signUpWithEmailPassword, signInWithGoogle, getAuthErrorMessage } from "../../lib/auth";

// ### Backend ###
// 간호사 회원가입 페이지 컴포넌트
export default function NurseSignUp() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [nurseLicense, setNurseLicense] = useState("");
  const [phone, setPhone] = useState("");
  const [hospital, setHospital] = useState("");
  const [unit, setUnit] = useState("");
  const [staffId, setStaffId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isGoogleAuth, setIsGoogleAuth] = useState(false);

  // Google 로그인 후 /signup/nurse?email=... 로 넘겨받으면 표시
  useEffect(() => {
    const q = router.query.email;
    if (typeof q === "string") {
      setEmail(q);
      setIsGoogleAuth(true);
    }
  }, [router.query.email]);

  // ### Backend ###
  // Google 로그인 처리 함수
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      const user = await signInWithGoogle();
      if (user.email) {
        setEmail(user.email);
        setIsGoogleAuth(true);
      }
    } catch (error: any) {
      setError(getAuthErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  // ### Backend ###
  // 회원가입 제출 처리 함수
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // 필수 필드 검증
    if (!email || !name || !password || !nurseLicense || !phone || !hospital || !unit) {
      setError("모든 필수 항목을 입력해주세요.");
      return;
    }

    // 비밀번호 길이 검증
    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }

    setLoading(true);

    try {
      // 간호사 추가 정보
      const additionalData = {
        nurseLicense,
        phone,
        hospital,
        unit,
        staffId: staffId || null,
        isVerified: false, // 간호사 인증 상태
        isGoogleAuth
      };

      // Firebase Authentication과 Realtime Database에 사용자 등록
      await signUpWithEmailPassword(email, password, name, 'nurse', additionalData);
      
      // 회원가입 성공 시 대시보드로 이동
      alert("회원가입이 완료되었습니다!");
      router.push('/dashboard/nurse');
    } catch (error: any) {
      console.error('회원가입 에러:', error);
      const errorCode = error?.code || 'auth/unknown-error';
      const errorMessage = getAuthErrorMessage(errorCode);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>AIGEM | 간호사 회원가입</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="auth-page">
        <section className="auth-card" aria-labelledby="title">
          {/* 로고 */}
          <div style={{ display: "grid", placeItems: "center", marginBottom: 16 }}>
            <Image src="/logo_org.png" alt="AIGEM" width={160} height={40} priority />
          </div>

          <h1 id="title" className="auth-title" style={{ textAlign: "center" }}>
            간호사 회원가입
          </h1>
          <p className="subtitle" style={{ textAlign: "center" }}>
            간호사 인증과 병원 등록 정보를 입력해 주세요.
          </p>

          {/* ### Backend ### */}
          {/* Google 로그인 버튼 (이메일이 없을 때만 표시) */}
          {!email && (
            <button
              type="button"
              className="btn-google"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <Image src="/google_logo.png" alt="Google" width={20} height={20} />
              <span>Google로 계속하기</span>
            </button>
          )}

          {/* 에러 메시지 표시 */}
          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <form
            className="form"
            onSubmit={handleSubmit}
          >
            {/* ── Google 인증 이메일 (수정 불가) ────────────────────────── */}
            <div className="field">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <label className="label" htmlFor="email">이메일 (Google 인증)</label>
                <span className="pill success">인증됨</span>
              </div>
              <input
                id="email"
                className="input"
                type="email"
                value={email}
                onChange={(e) => !isGoogleAuth && setEmail(e.target.value)}
                placeholder="google@example.com"
                disabled={isGoogleAuth}
                readOnly={isGoogleAuth}
                aria-readonly={isGoogleAuth ? "true" : "false"}
                aria-describedby="emailHelp"
                required
              />
              <small id="emailHelp" className="helper">
                Google 로그인으로 인증된 이메일입니다. 수정할 수 없습니다.
              </small>
            </div>

            {/* ── 기본 정보 ────────────────────────────────────────────── */}
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

            {/* ── 간호사 인증 ──────────────────────────────────────────── */}
            <h2 className="section">간호사 인증</h2>

            <div className="inline-group">
              <div className="field" style={{ margin: 0 }}>
                <label className="label" htmlFor="nurseLicense">간호사 면허번호</label>
                <input 
                  id="nurseLicense" 
                  className="input" 
                  placeholder="예) 12-가-345678" 
                  value={nurseLicense}
                  onChange={(e) => setNurseLicense(e.target.value)}
                  required
                />
              </div>
              <button type="button" className="btn-soft" aria-label="간호사 면허번호 인증">인증</button>
            </div>

            <div className="inline-group">
              <div className="field" style={{ margin: 0 }}>
                <label className="label" htmlFor="phone">전화번호</label>
                <input 
                  id="phone" 
                  className="input" 
                  placeholder="010-1234-5678" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <button type="button" className="btn-soft" aria-label="전화번호 인증">인증</button>
            </div>

            {/* ── 병원 등록 정보 ───────────────────────────────────────── */}
            <h2 className="section">병원 등록 정보</h2>

            <div className="inline-group">
              <div className="field" style={{ margin: 0 }}>
                <label className="label" htmlFor="hospital">소속 병원</label>
                <input 
                  id="hospital" 
                  className="input" 
                  placeholder="예) AIGEM 병원" 
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  required
                />
              </div>
              <button type="button" className="btn-soft" aria-label="병원 찾기">찾기</button>
            </div>

            <div className="field">
              <label className="label" htmlFor="unit">담당 부서/병동</label>
              <input 
                id="unit" 
                className="input" 
                placeholder="예) 내과병동, 중환자실" 
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label className="label" htmlFor="staffId">직원번호/병원 코드 (선택)</label>
              <input 
                id="staffId" 
                className="input" 
                placeholder="예) HSP-00987" 
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary w100" disabled={loading}>
              {loading ? '처리 중...' : '가입하기'}
            </button>

            <p className="foot">
              이미 계정이 있으신가요? <Link href="/login" className="auth-link">로그인</Link>
            </p>
          </form>
        </section>
      </div>

      {/* 페이지 전용 스타일 (로그인/의사와 동일 톤 + 반응형) */}
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
        .pill{ display:inline-flex; align-items:center; gap:6px; padding:4px 10px;
          font-size:11px; border-radius:999px; background:#eef8f1; color:#16a34a; }
        .w100{ width:100%; }
        .foot{ margin-top:6px; font-size:14px; color:#334155; text-align:center; }
        .auth-link{ color:#2563eb; font-weight:600; text-decoration:none; }
        .auth-link:hover{ text-decoration:underline; }
        
        .btn-google{
          display:flex; align-items:center; justify-content:center; gap:12px;
          width:100%; height:48px; margin-bottom:16px;
          background:#fff; border:1px solid #e1e9ff;
          border-radius:12px; cursor:pointer;
          transition:.18s ease; font-weight:600;
        }
        .btn-google:hover{ background:#f8faff; border-color:#d1dcff; }
        .btn-google:disabled{ opacity:0.6; cursor:not-allowed; }
        
        .error-message{
          background:#fee; color:#dc2626; padding:12px;
          border-radius:8px; margin-bottom:16px;
          font-size:14px; text-align:center;
        }
      `}</style>
    </>
  );
}