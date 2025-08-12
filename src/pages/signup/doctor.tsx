// src/pages/signup/doctor.tsx
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function DoctorSignUp() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  // Google 로그인 후 /signup/doctor?email=... 형태로 넘겨받으면 표시
  useEffect(() => {
    const q = router.query.email;
    if (typeof q === "string") setEmail(q);
  }, [router.query.email]);

  return (
    <>
      <Head>
        <title>AIGEM | 의사 회원가입</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="auth-page">
        <section className="auth-card" aria-labelledby="title">
          <div style={{ display: "grid", placeItems: "center", marginBottom: 16 }}>
            <Image src="/logo_org.png" alt="AIGEM" width={160} height={40} priority />
          </div>

          <h1 id="title" className="auth-title" style={{ textAlign: "center" }}>
            의사 회원가입
          </h1>
          <p className="subtitle" style={{ textAlign: "center" }}>
            의사 인증과 병원 등록 정보를 입력해 주세요.
          </p>

          <form
            className="form"
            onSubmit={(e) => {
              e.preventDefault();
              alert("데모 화면입니다. (제출 이벤트)");
            }}
          >
            {/* ── Google 인증 이메일 (수정 불가) ────────────────────────── */}
            <div className="field">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <label className="label" htmlFor="email">이메일 (Google 인증)</label>
                <span className="pill success" aria-label="인증 완료">인증됨</span>
              </div>
              <input
                id="email"
                className="input"
                type="email"
                value={email}
                placeholder="google@example.com"
                disabled
                readOnly
                aria-readonly="true"
                aria-describedby="emailHelp"
              />
              <small id="emailHelp" className="helper">
                Google 로그인으로 인증된 이메일입니다. 수정할 수 없습니다.
              </small>
            </div>

            {/* ── 기본 정보 ────────────────────────────────────────────── */}
            <div className="field">
              <label className="label" htmlFor="name">이름</label>
              <input id="name" className="input" placeholder="홍길동" />
            </div>

            <div className="field">
              <label className="label" htmlFor="password">비밀번호</label>
              <input id="password" type="password" className="input" placeholder="••••••••" />
            </div>

            <div className="field">
              <label className="label" htmlFor="specialty">전문분야</label>
              <input id="specialty" className="input" placeholder="예) 내과, 정형외과" />
            </div>

            {/* ── 의사 인증 ────────────────────────────────────────────── */}
            <h2 className="section">의사 인증</h2>

            <div className="inline-group">
              <div className="field" style={{ margin: 0 }}>
                <label className="label" htmlFor="license">면허번호</label>
                <input id="license" className="input" placeholder="예) 123456" />
              </div>
              <button type="button" className="btn-soft" aria-label="면허번호 인증">인증</button>
            </div>

            <div className="inline-group">
              <div className="field" style={{ margin: 0 }}>
                <label className="label" htmlFor="phone">전화번호</label>
                <input id="phone" className="input" placeholder="010-1234-5678" />
              </div>
              <button type="button" className="btn-soft" aria-label="전화번호 인증">인증</button>
            </div>

            {/* ── 병원 등록 정보 ───────────────────────────────────────── */}
            <h2 className="section">병원 등록 정보</h2>

            <div className="inline-group">
              <div className="field" style={{ margin: 0 }}>
                <label className="label" htmlFor="hospital">소속 병원</label>
                <input id="hospital" className="input" placeholder="예) AIGEM 병원" />
              </div>
              <button type="button" className="btn-soft" aria-label="병원 찾기">찾기</button>
            </div>

            <div className="field">
              <label className="label" htmlFor="department">진료과/담당부서</label>
              <input id="department" className="input" placeholder="예) 내과, 응급의학과" />
            </div>

            <div className="field">
              <label className="label" htmlFor="ward">담당 병동 (선택)</label>
              <input id="ward" className="input" placeholder="예) 본관 3병동" />
            </div>

            <div className="field">
              <label className="label" htmlFor="hospitalCode">병원 코드/직원번호 (선택)</label>
              <input id="hospitalCode" className="input" placeholder="예) HSP-00123" />
            </div>

            <button type="submit" className="btn btn-primary w100">가입하기</button>

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

        .pill{ display:inline-flex; align-items:center; gap:6px; padding:4px 10px;
          font-size:11px; border-radius:999px; background:#eef8f1; color:#16a34a; }
        .w100{ width:100%; }

        .foot{ margin-top:6px; font-size:14px; color:#334155; text-align:center; }
        .auth-link{ color:#2563eb; font-weight:600; text-decoration:none; }
        .auth-link:hover{ text-decoration:underline; }
      `}</style>
    </>
  );
}
