import Image from "next/image";
import Link from "next/link";

export default function Login() {
  return (
    <div
      style={{
        backgroundColor: "#f0f6ff",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "16px",
          padding: "40px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          textAlign: "center",
          width: "360px",
        }}
      >
        {/* 로고 */}
        <div style={{ marginBottom: "24px" }}>
          <Image
            src="/logo_org.png"
            alt="AIGEM Logo"
            width={140}
            height={40}
            priority
          />
        </div>

        {/* 타이틀 */}
        <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "20px" }}>
          로그인
        </h2>

        {/* Google 로그인 버튼 */}
        <button
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            backgroundColor: "#4285F4",
            color: "#fff",
            fontWeight: "bold",
            padding: "10px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontSize: "1rem",
            marginBottom: "16px",
          }}
        >
          <Image
            src="/google_logo.png"
            alt="Google Logo"
            width={20}
            height={20}
            style={{ marginRight: "8px" }}
          />
          Google로 로그인
        </button>

        {/* 회원가입 링크 */}
        <p style={{ fontSize: "0.9rem" }}>
          계정이 없으신가요?{" "}
          <Link href="/signup" style={{ color: "#2563eb", fontWeight: "500" }}>
            회원가입
          </Link>
        </p>

        {/* 약관 안내 */}
        <p style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "12px" }}>
          로그인 시 서비스 이용약관 및 개인정보 처리방침에 동의합니다.
        </p>
      </div>
    </div>
  );
}
