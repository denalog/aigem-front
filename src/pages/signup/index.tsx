import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";

type Role = "doctor" | "nurse" | "caregiver" | "patient" | "guardian";

export default function SignupSelect() {
  const router = useRouter();
  const go = (role: Role) => router.push(`/signup/${role}`);

  return (
    <>
      <Head>
        <title>AIGEM | 회원가입</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="auth-page">
        <section className="auth-card" aria-labelledby="title">
          {/* 로고 */}
          <div className="brand">
            <Image src="/logo_org.png" alt="AIGEM" width={160} height={40} priority />
          </div>

          <h1 id="title" className="title">회원가입</h1>
          <p className="subtitle">가입 유형을 선택해주세요.</p>

          <div className="grid">
            <button className="role-btn" onClick={() => go("doctor")} aria-label="의사로 가입">
              <span className="avatar">1</span>
              <div className="txt">
                <strong>의사</strong><span>Doctor</span>
              </div>
              <span className="chev" aria-hidden>›</span>
            </button>

            <button className="role-btn" onClick={() => go("nurse")} aria-label="간호사로 가입">
              <span className="avatar">2</span>
              <div className="txt">
                <strong>간호사</strong><span>Nurse</span>
              </div>
              <span className="chev" aria-hidden>›</span>
            </button>

            <button className="role-btn" onClick={() => go("caregiver")} aria-label="요양사로 가입">
              <span className="avatar">3</span>
              <div className="txt">
                <strong>요양사</strong><span>Caregiver</span>
              </div>
              <span className="chev" aria-hidden>›</span>
            </button>

            <button className="role-btn" onClick={() => go("patient")} aria-label="환자로 가입">
              <span className="avatar">4</span>
              <div className="txt">
                <strong>환자</strong><span>Patient</span>
              </div>
              <span className="chev" aria-hidden>›</span>
            </button>

            <button className="role-btn" onClick={() => go("guardian")} aria-label="보호자로 가입">
              <span className="avatar">5</span>
              <div className="txt">
                <strong>보호자</strong><span>Guardian</span>
              </div>
              <span className="chev" aria-hidden>›</span>
            </button>
          </div>

          <p className="foot">
            이미 계정이 있으신가요? <a className="link" href="/login">로그인</a>
          </p>
        </section>
      </div>

      {/* scoped styles: 모바일 1열 → 넓으면 2열 */}
      <style jsx>{`
        .auth-page{
          min-height:100dvh; display:flex; align-items:center; justify-content:center;
          background:#f0f6ff; padding:16px; padding-bottom:calc(16px + env(safe-area-inset-bottom));
        }
        .auth-card{
          width:100%; max-width:420px; text-align:center;
          background:#fff; border-radius:16px; padding:24px;
          box-shadow:0 10px 30px rgba(21,44,84,.08);
        }
        .brand{ margin-bottom:14px; }
        .title{ margin:0 0 6px; font-size:22px; font-weight:800; color:#0b1b33; }
        .subtitle{ margin:0 0 14px; color:#475569; font-size:14px; }

        .grid{ display:grid; grid-template-columns:1fr; gap:12px; }
        @media (min-width:480px){ .grid{ grid-template-columns:1fr 1fr; gap:16px; } }

        .role-btn{
          display:flex; align-items:center; gap:12px; justify-content:flex-start;
          width:100%; height:72px; padding:12px 14px;
          border-radius:16px; border:1px solid #e1e9ff;
          background: linear-gradient(180deg,#f7faff 0%, #ffffff 100%);
          box-shadow:0 4px 14px rgba(21,44,84,.06);
          text-align:left; cursor:pointer; transition:.18s ease;
        }
        @media (min-width:480px){ .role-btn{ height:84px; padding:14px; } }
        .role-btn:hover{ transform:translateY(-1px); box-shadow:0 10px 24px rgba(21,44,84,.10); border-color:#d1dcff; }
        .role-btn:focus-visible{ outline:3px solid rgba(74,134,255,.25); outline-offset:2px; }

        .avatar{
          flex:0 0 40px; height:40px; display:grid; place-items:center;
          border-radius:999px; font-weight:800; color:#2a54b6;
          background: radial-gradient(100% 100% at 30% 20%, #e7efff 0%, #dce8ff 100%);
          border:1px solid #cfe0ff;
        }
        .txt{ display:flex; flex-direction:column; line-height:1.12; }
        .txt strong{ font-weight:800; color:#0b1b33; }
        .txt span{ font-size:12px; color:#64748b; }
        .chev{ margin-left:auto; font-size:22px; color:#6b7fb0; transform:translateX(2px); }

        .foot{ margin-top:16px; font-size:14px; color:#334155; }
        .link{ color:#2563eb; font-weight:600; text-decoration:none; }
        .link:hover{ text-decoration:underline; }
      `}</style>
    </>
  );
}
