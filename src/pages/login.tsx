// src/pages/login.tsx
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
// ✅ 구글 로그인은 잠시 비활성화하므로 import에서 제거
import {
  signInWithEmailPassword,
  getUserRole,
  getAuthErrorMessage,
  // signInWithGoogle,  // ← (임시 비활성)
} from "../lib/auth";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [comingSoonOpen, setComingSoonOpen] = useState(false); // ✅ 팝업 오픈 상태

  /** =========================
   *  Google 로그인 (임시 비활성)
   *  =========================
   *  기존 구현은 아래와 같이 동작했음:
   *
   *  const handleGoogleSignIn = async () => {
   *    setLoading(true);
   *    setError("");
   *    try {
   *      const cred = await signInWithGoogle(); // UserCredential
   *      const user = cred?.user;
   *      const role = await getUserRole(user.uid);
   *      router.push(role ? `/dashboard/${role}` : `/signup?email=${encodeURIComponent(user.email || '')}`);
   *    } catch (e: any) {
   *      const errorCode = e?.code || 'auth/unknown-error';
   *      setError(getAuthErrorMessage(errorCode));
   *    } finally {
   *      setLoading(false);
   *    }
   *  };
   */

  // ✅ 지금은 버튼을 누르면 "추후 개발 예정" 팝업만 띄움
  const handleGoogleSignIn = () => {
    setError("");
    setComingSoonOpen(true);
  };

  // 이메일/비밀번호 로그인
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }
    setLoading(true);
    try {
      const credOrUser = await signInWithEmailPassword(email, password);
      const user = (credOrUser && "user" in credOrUser) ? credOrUser.user : credOrUser;
      if (!user?.uid) throw { code: "auth/unknown-user" };
      const role = await getUserRole(user.uid);
      router.push(typeof role === "string" && role ? `/dashboard/${role}` : "/dashboard");
    } catch (e: any) {
      const errorCode = e?.code || "auth/unknown-error";
      setError(getAuthErrorMessage(errorCode));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>AIGEM | 로그인</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="auth-page">
        <section className="auth-card" aria-labelledby="title">
          {/* 로고 */}
          <div style={{ display: "grid", placeItems: "center", marginBottom: 24 }}>
            <Image src="/logo_org.png" alt="AIGEM" width={160} height={40} priority />
          </div>

          <h1 id="title" className="auth-title">로그인</h1>
          <p className="subtitle">AIGEM에 오신 것을 환영합니다.</p>

          {/* 에러 메시지 */}
          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          {/* Google 로그인 (지금은 팝업만) */}
          <button
            type="button"
            className="btn-google"
            onClick={handleGoogleSignIn}
            disabled={loading}
            aria-haspopup="dialog"
            aria-controls="coming-soon-dialog"
          >
            <Image src="/google_logo.png" alt="Google" width={20} height={20} />
            <span>Google로 로그인</span>
          </button>

          {/* 구분선 */}
          <div className="divider">
            <span>또는</span>
          </div>

          {/* 이메일 로그인 */}
          {!showEmailLogin ? (
            <button
              type="button"
              className="btn-email-toggle"
              onClick={() => setShowEmailLogin(true)}
            >
              이메일로 로그인
            </button>
          ) : (
            <form className="form" onSubmit={handleEmailSignIn}>
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

              <div className="field">
                <label className="label" htmlFor="password">비밀번호</label>
                <input
                  id="password"
                  className="input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary w100" disabled={loading}>
                {loading ? "로그인 중..." : "로그인"}
              </button>

              <button
                type="button"
                className="btn-back"
                onClick={() => setShowEmailLogin(false)}
              >
                ← 다른 방법으로 로그인
              </button>
            </form>
          )}

          {/* 도움말 */}
          <div className="help-text">
            <p>💡 <strong>로그인 방법:</strong></p>
            <ul>
              <li>회원가입 시 사용한 이메일/비밀번호로 로그인</li>
              <li>Google 간편로그인은 추후 제공 예정입니다.</li>
            </ul>
          </div>

          {/* 회원가입 링크 */}
          <p className="foot">
            계정이 없으신가요? <Link href="/signup" className="auth-link">회원가입</Link>
          </p>

          <p className="terms">
            로그인 시 서비스 이용약관 및 개인정보 처리방침에 동의합니다.
          </p>
        </section>
      </div>

      {/* ✅ "추후 개발 예정" 팝업 */}
      {comingSoonOpen && (
        <div
          id="coming-soon-dialog"
          role="dialog"
          aria-modal="true"
          className="modal-backdrop"
          onClick={(e) => {
            // 배경 클릭으로 닫기 (원하면 막아도 됨)
            if (e.target === e.currentTarget) setComingSoonOpen(false);
          }}
        >
          <div className="modal">
            <div className="modal-header">
              <Image src="/logo_org.png" alt="AIGEM" width={100} height={24} />
            </div>
            <div className="modal-body">
              <h2 className="modal-title">추후 개발 예정입니다</h2>
              <p className="modal-desc">
                현재 베타 버전에서는 Google 간편로그인을 제공하지 않습니다.
                이메일/비밀번호로 로그인해 주세요.
              </p>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setComingSoonOpen(false)}
                autoFocus
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 페이지 전용 스타일 */}
      <style jsx>{`
        .auth-page{
          min-height:100dvh; display:flex; align-items:center; justify-content:center;
          background:#f0f6ff; padding:16px;
        }
        .auth-card{
          width:100%; max-width:420px; background:#fff; border-radius:16px; padding:32px;
          box-shadow:0 10px 30px rgba(21,44,84,.08); text-align:center;
        }
        .auth-title{ margin:0 0 8px; font-size:24px; font-weight:800; color:#0b1b33; }
        .subtitle{ margin:0 0 24px; color:#475569; font-size:14px; }

        .form{ display:grid; gap:16px; text-align:left; margin-top:16px; }
        .field{ display:flex; flex-direction:column; gap:6px; }
        .label{ font-size:12px; color:#6b7280; font-weight:600; }

        :global(.input){
          width:100%; background:#eef3fb; border:1px solid #d7e6ff;
          border-radius:12px; padding:14px 16px; font-size:14px;
          outline:none; transition:.15s border-color,.15s box-shadow,.15s background;
        }
        :global(.input:focus){
          border-color:#4a86ff; background:#fff; box-shadow:0 0 0 3px rgba(74,134,255,.15);
        }

        .btn-google{
          display:flex; align-items:center; justify-content:center; gap:12px;
          width:100%; height:52px; margin-bottom:20px;
          background:#4285f4; color:#fff; border:none;
          border-radius:12px; cursor:pointer; font-weight:600; font-size:15px;
          transition:.18s ease;
        }
        .btn-google:hover{ background:#3367d6; transform:translateY(-1px); }
        .btn-google:disabled{ opacity:0.6; cursor:not-allowed; transform:none; }

        .btn-email-toggle{
          width:100%; height:48px; background:#fff; border:2px solid #e1e9ff;
          border-radius:12px; color:#1f3b7a; font-weight:600; cursor:pointer;
          transition:.18s ease; margin-bottom:20px;
        }
        .btn-email-toggle:hover{ background:#f8faff; border-color:#d1dcff; }

        .btn-back{
          width:100%; height:40px; background:transparent; border:none;
          color:#6b7fb0; font-size:14px; cursor:pointer; margin-top:8px;
          transition:.18s ease;
        }
        .btn-back:hover{ color:#4a86ff; }

        .divider{
          position:relative; margin:20px 0; color:#9ca3af; font-size:14px;
        }
        .divider::before{
          content:''; position:absolute; top:50%; left:0; right:0; height:1px;
          background:#e5e7eb; z-index:1;
        }
        .divider span{
          background:#fff; padding:0 16px; position:relative; z-index:2;
        }

        .w100{ width:100%; }
        .foot{ margin-top:24px; font-size:14px; color:#334155; }
        .auth-link{ color:#2563eb; font-weight:600; text-decoration:none; }
        .auth-link:hover{ text-decoration:underline; }
        
        .terms{ margin-top:16px; font-size:12px; color:#9ca3af; line-height:1.4; }
        
        .error-message{
          background:#fee; color:#dc2626; padding:12px;
          border-radius:8px; margin-bottom:16px;
          font-size:14px; text-align:center;
        }

        .btn{
          height:48px; border-radius:12px; border:none;
          font-weight:600; cursor:pointer; transition:.18s ease;
          display:flex; align-items:center; justify-content:center;
          padding:0 18px;
        }
        .btn-primary{
          background:linear-gradient(135deg, #4a86ff 0%, #2563eb 100%);
          color:#fff; box-shadow:0 4px 14px rgba(74,134,255,.25);
        }
        .btn-primary:hover{ transform:translateY(-1px); box-shadow:0 8px 20px rgba(74,134,255,.35); }
        .btn-primary:disabled{ opacity:0.6; cursor:not-allowed; transform:none; }

        .help-text{
          background:#f8faff; border:1px solid #e1e9ff; border-radius:8px;
          padding:16px; margin:20px 0; text-align:left; font-size:13px;
        }
        .help-text p{ margin:0 0 8px; color:#1f3b7a; }
        .help-text ul{ margin:0; padding-left:16px; color:#475569; }
        .help-text li{ margin-bottom:4px; }

        /* ========= AIGEM 스타일 팝업 ========= */
        .modal-backdrop{
          position:fixed; inset:0; display:grid; place-items:center;
          background:rgba(15, 23, 42, 0.45); /* slate-900/45 */
          z-index:50; padding:16px;
        }
        .modal{
          width:100%; max-width:420px; background:#fff; border-radius:18px;
          box-shadow:0 18px 50px rgba(21,44,84,.25);
          overflow:hidden; animation:pop .18s ease-out;
        }
        .modal-header{
          display:flex; align-items:center; gap:8px;
          padding:16px; background:linear-gradient(135deg, #eef3ff, #f7faff);
          border-bottom:1px solid #e6eeff;
        }
        .modal-body{ padding:22px 20px 0; text-align:center; }
        .modal-title{ margin:0 0 8px; font-size:18px; font-weight:800; color:#0b1b33; }
        .modal-desc{ margin:0; color:#475569; font-size:14px; line-height:1.55; }
        .modal-actions{
          padding:18px 20px 22px; display:flex; justify-content:center;
        }
        @keyframes pop{
          from{ transform:translateY(6px) scale(.98); opacity:0 }
          to{ transform:translateY(0) scale(1); opacity:1 }
        }
      `}</style>
    </>
  );
}
