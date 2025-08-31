import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
// import { signUpWithEmailPassword, signInWithGoogle, getAuthErrorMessage } from "../../lib/auth";
import { signUpWithEmailPassword, getAuthErrorMessage } from "../../lib/auth";
import { demoDoctor } from "../../data/roles/doctor"; // ✅ 데모 데이터
import { auth } from "../../lib/firebase";
import {
  fetchSignInMethodsForEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";

export default function DoctorSignUp() {
  const router = useRouter();

  // ✅ 초기값을 demoDoctor로 채움 (비밀번호는 수동 입력)
  const [email, setEmail] = useState(demoDoctor.email);
  const [password, setPassword] = useState("aigem123"); // 데모 비밀번호
  const [name, setName] = useState(demoDoctor.name);
  const [specialty, setSpecialty] = useState(demoDoctor.specialty);
  const [licenseNumber, setLicenseNumber] = useState(demoDoctor.licenseNumber);
  const [phone, setPhone] = useState(demoDoctor.phone);
  const [hospital, setHospital] = useState(demoDoctor.hospital);
  const [department, setDepartment] = useState(demoDoctor.department);
  const [ward, setWard] = useState(demoDoctor.ward ?? "");
  const [hospitalCode, setHospitalCode] = useState(
    demoDoctor.hospitalCode ?? ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isGoogleAuth] = useState(false); // ✅ 데모에선 false 고정

  // (옵션) URL로 이메일이 넘어오면 우선 적용 — 하지만 데모에선 필요 없음
  useEffect(() => {
    const q = router.query.email;
    if (typeof q === "string" && q) {
      setEmail(q);
      // setIsGoogleAuth(true); // 데모에선 사용 안 함
    }
  }, [router.query.email]);

  // (임시 비활성) 구글 로그인은 숨김 처리
  // const handleGoogleSignIn = async () => { ... }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (
      !email ||
      !name ||
      !password ||
      !specialty ||
      !licenseNumber ||
      !phone ||
      !hospital ||
      !department
    ) {
      setError("모든 필수 항목을 입력해주세요.");
      return;
    }
    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }

    setLoading(true);
    try {
      const additionalData = {
        specialty,
        licenseNumber,
        phone,
        hospital,
        department,
        ward: ward || null,
        hospitalCode: hospitalCode || null,
        isVerified: false,
        isGoogleAuth,
      };

      // // 1) 먼저 해당 이메일의 가입 여부 확인
      // const methods = await fetchSignInMethodsForEmail(auth, email);

      // if (methods.length === 0) {
      //   // 2-a) 없으면 실제 가입 (메타데이터 저장 포함)
      //   await signUpWithEmailPassword(
      //     email,
      //     password,
      //     name,
      //     "doctor",
      //     additionalData
      //   );
      // } else {
      //   // 2-b) 이미 있으면 로그인 시도
      //   try {
      //     await signInWithEmailAndPassword(auth, email, password);
      //   } catch (err: any) {
      //     // 비번이 과거에 다르게 저장돼 있는 데모 상황을 위한 우회 (원하면 제거 가능)
      //     if (err?.code === "auth/wrong-password") {
      //       // 👉 데모용 모킹 로그인 (세션 플래그만 저장하고 진행)
      //       sessionStorage.setItem(
      //         "aigem-dev-mock",
      //         JSON.stringify({ role: "doctor", email, name })
      //       );
      //     } else {
      //       throw err;
      //     }
      //   }
      // }

      alert("회원가입이 완료되었습니다!");
      router.push("/dashboard/doctor");
    } catch (error: any) {
      const errorCode = error?.code || "auth/unknown-error";
      setError(getAuthErrorMessage(errorCode));
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <Head>
        <title>AIGEM | 의사 회원가입</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="auth-page">
        <section className="auth-card" aria-labelledby="title">
          <div
            style={{ display: "grid", placeItems: "center", marginBottom: 16 }}>
            <Image
              src="/logo_org.png"
              alt="AIGEM"
              width={160}
              height={40}
              priority
            />
          </div>

          <h1 id="title" className="auth-title" style={{ textAlign: "center" }}>
            의사 회원가입
          </h1>
          <p className="subtitle" style={{ textAlign: "center" }}>
            의사 인증과 병원 등록 정보를 입력해 주세요.
          </p>

          {/* (구글 버튼 숨김) — 필요 시 다시 활성화 */}
          {/* <button type="button" className="btn-google" onClick={handleGoogleSignIn} disabled={loading}>
            <Image src="/google_logo.png" alt="Google" width={20} height={20} />
            <span>Google로 계속하기</span>
          </button> */}

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <form className="form" onSubmit={handleSubmit}>
            {/* 이메일 */}
            <div className="field">
              <label className="label" htmlFor="email">
                이메일
              </label>
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
              <label className="label" htmlFor="name">
                이름
              </label>
              <input
                id="name"
                className="input"
                placeholder="김민준"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label className="label" htmlFor="password">
                비밀번호
              </label>
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
              <label className="label" htmlFor="specialty">
                전문분야
              </label>
              <input
                id="specialty"
                className="input"
                placeholder="내과"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                required
              />
            </div>

            {/* 의사 인증 */}
            <h2 className="section">의사 인증</h2>
            <div className="inline-group">
              <div className="field" style={{ margin: 0 }}>
                <label className="label" htmlFor="license">
                  면허번호
                </label>
                <input
                  id="license"
                  className="input"
                  placeholder="MD-2025-000123"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  required
                />
              </div>
              <button
                type="button"
                className="btn-soft"
                aria-label="면허번호 인증">
                인증
              </button>
            </div>

            <div className="inline-group">
              <div className="field" style={{ margin: 0 }}>
                <label className="label" htmlFor="phone">
                  전화번호
                </label>
                <input
                  id="phone"
                  className="input"
                  placeholder="010-1234-5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <button
                type="button"
                className="btn-soft"
                aria-label="전화번호 인증">
                인증
              </button>
            </div>

            {/* 병원 등록 정보 */}
            <h2 className="section">병원 등록 정보</h2>
            <div className="inline-group">
              <div className="field" style={{ margin: 0 }}>
                <label className="label" htmlFor="hospital">
                  소속 병원
                </label>
                <input
                  id="hospital"
                  className="input"
                  placeholder="AIGEM 요양병원"
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  required
                />
              </div>
              <button type="button" className="btn-soft" aria-label="병원 찾기">
                찾기
              </button>
            </div>

            <div className="field">
              <label className="label" htmlFor="department">
                진료과/담당부서
              </label>
              <input
                id="department"
                className="input"
                placeholder="내과"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label className="label" htmlFor="ward">
                담당 병동 (선택)
              </label>
              <input
                id="ward"
                className="input"
                placeholder="본관 3병동"
                value={ward}
                onChange={(e) => setWard(e.target.value)}
              />
            </div>

            <div className="field">
              <label className="label" htmlFor="hospitalCode">
                병원 코드/직원번호 (선택)
              </label>
              <input
                id="hospitalCode"
                className="input"
                placeholder="HSP-00123"
                value={hospitalCode}
                onChange={(e) => setHospitalCode(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="submit"
                className="btn btn-primary w100"
                disabled={loading}>
                {loading ? "처리 중..." : "가입하기"}
              </button>
            </div>

            <p className="foot">
              이미 계정이 있으신가요?{" "}
              <Link href="/login" className="auth-link">
                로그인
              </Link>
            </p>
          </form>
        </section>
      </div>

      {/* 페이지 전용 스타일 (로그인/역할선택과 동일 톤 + 반응형) */}
      <style jsx>{`
        .auth-page {
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0f6ff;
          padding: 16px;
        }
        .auth-card {
          width: 100%;
          max-width: 420px;
          background: #fff;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 10px 30px rgba(21, 44, 84, 0.08);
          text-align: left;
        }
        .auth-title {
          margin: 0 0 6px;
          font-size: 22px;
          font-weight: 800;
          color: #0b1b33;
        }
        .subtitle {
          margin: 0 0 16px;
          color: #475569;
          font-size: 14px;
        }

        .form {
          display: grid;
          gap: 12px;
        }
        .field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .label {
          font-size: 12px;
          color: #6b7280;
        }
        .section {
          font-size: 14px;
          font-weight: 800;
          color: #0b1b33;
          margin: 8px 0 0;
        }

        :global(.input) {
          width: 100%;
          background: #eef3fb;
          border: 1px solid #d7e6ff;
          border-radius: 12px;
          padding: 12px 14px;
          font-size: 14px;
          outline: none;
          transition: 0.15s border-color, 0.15s box-shadow, 0.15s background;
        }
        :global(.input:focus) {
          border-color: #4a86ff;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(74, 134, 255, 0.15);
        }
        :global(input[disabled]) {
          color: #64748b;
          background: #f3f6fd;
          cursor: not-allowed;
        }

        .inline-group {
          display: grid;
          grid-template-columns: 1fr 92px;
          gap: 10px;
          align-items: end;
        }
        @media (min-width: 480px) {
          .inline-group {
            grid-template-columns: 1fr 104px;
          }
        }

        .btn-soft {
          height: 44px;
          border-radius: 12px;
          border: 1px solid #e1e9ff;
          background: linear-gradient(180deg, #f7faff 0%, #ffffff 100%);
          color: #1f3b7a;
          font-weight: 800;
          box-shadow: 0 4px 12px rgba(21, 44, 84, 0.06);
          cursor: pointer;
          transition: 0.18s ease;
          padding: 0 12px;
        }
        .btn-soft:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 20px rgba(21, 44, 84, 0.1);
          border-color: #d1dcff;
        }

        .pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          font-size: 11px;
          border-radius: 999px;
          background: #eef8f1;
          color: #16a34a;
        }
        .w100 {
          width: 100%;
        }

        .foot {
          margin-top: 6px;
          font-size: 14px;
          color: #334155;
          text-align: center;
        }
        .auth-link {
          color: #2563eb;
          font-weight: 600;
          text-decoration: none;
        }
        .auth-link:hover {
          text-decoration: underline;
        }

        .btn-google {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          height: 48px;
          margin-bottom: 16px;
          background: #fff;
          border: 1px solid #e1e9ff;
          border-radius: 12px;
          cursor: pointer;
          transition: 0.18s ease;
          font-weight: 600;
        }
        .btn-google:hover {
          background: #f8faff;
          border-color: #d1dcff;
        }
        .btn-google:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-message {
          background: #fee;
          color: #dc2626;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 14px;
          text-align: center;
        }
      `}</style>
    </>
  );
}
