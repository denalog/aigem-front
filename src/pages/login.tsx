import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { signInWithEmailPassword, signInWithGoogle, getUserRole, getAuthErrorMessage } from "../lib/auth";

// ### Backend ###
// 로그인 페이지 컴포넌트
export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showEmailLogin, setShowEmailLogin] = useState(false);

  // ### Backend ###
  // Google 로그인 처리 함수
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      const user = await signInWithGoogle();
      
      // 사용자 역할 조회
      const role = await getUserRole(user.uid);
      
      if (role) {
        // 역할에 따라 대시보드로 리다이렉트
        router.push(`/dashboard/${role}`);
      } else {
        // 역할이 없으면 회원가입 페이지로 (Google 이메일과 함께)
        router.push(`/signup?email=${encodeURIComponent(user.email || '')}`);
      }
    } catch (error: any) {
      console.error('Google 로그인 에러:', error);
      console.error('에러 상세:', {
        code: error?.code,
        message: error?.message,
        customData: error?.customData
      });
      
      const errorCode = error?.code || 'auth/unknown-error';
      const errorMessage = getAuthErrorMessage(errorCode);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ### Backend ###
  // 이메일/비밀번호 로그인 처리 함수
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // 필수 필드 검증
    if (!email || !password) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    setLoading(true);

    try {
      const user = await signInWithEmailPassword(email, password);
      
      // 사용자 역할 조회
      const role = await getUserRole(user.uid);
      
      if (role) {
        // 역할에 따라 대시보드로 리다이렉트
        router.push(`/dashboard/${role}`);
      } else {
        setError("사용자 정보를 찾을 수 없습니다. 관리자에게 문의해주세요.");
      }
    } catch (error: any) {
      console.error('이메일 로그인 에러:', error);
      console.error('에러 상세:', {
        code: error?.code,
        message: error?.message,
        customData: error?.customData
      });
      
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

          {/* 에러 메시지 표시 */}
          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          {/* Google 로그인 버튼 */}
          <button
            type="button"
            className="btn-google"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <Image src="/google_logo.png" alt="Google" width={20} height={20} />
            <span>Google로 로그인</span>
          </button>

          {/* 구분선 */}
          <div className="divider">
            <span>또는</span>
          </div>

          {/* 이메일 로그인 토글 버튼 */}
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
                {loading ? '로그인 중...' : '로그인'}
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
              <li>Google 계정으로 간편 로그인</li>
              <li>회원가입 시 사용한 이메일/비밀번호로 로그인</li>
            </ul>
          </div>

          {/* 회원가입 링크 */}
          <p className="foot">
            계정이 없으신가요? <Link href="/signup" className="auth-link">회원가입</Link>
          </p>

          {/* 약관 안내 */}
          <p className="terms">
            로그인 시 서비스 이용약관 및 개인정보 처리방침에 동의합니다.
          </p>
        </section>
      </div>

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
      `}</style>
    </>
  );
}