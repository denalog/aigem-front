// src/pages/profile.tsx
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";

type Role = "doctor" | "nurse" | "patient" | "guardian";

function roleLabel(r: Role) {
  switch (r) {
    case "doctor":
      return "의사";
    case "nurse":
      return "간호사";
    case "patient":
      return "환자";
    case "guardian":
      return "보호자";
  }
}

function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

function fmt(dt: string | number | Date) {
  const d = new Date(dt);
  const y = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${mm}-${dd} ${hh}:${mi}`;
}

export default function ProfilePage() {
  const router = useRouter();
  const mounted = useMounted();




  const [name, setName] = useState("유제나");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("patient");
  const [patientId, setPatientId] = useState("734928"); // 환자 전용
  const [license, setLicense] = useState("MD-1234-5678"); // 의사 전용
  const [hospital, setHospital] = useState("에이젬병원"); // 주 진료/소속 병원
  const [department, setDepartment] = useState("내과"); // 참고 표시용
  const [ward, setWard] = useState("3병동"); // 참고 표시용

  // 수정 가능 항목
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");

  // 메타 정보
  const [joinDate, setJoinDate] = useState<string>("");
  const [consentDate, setConsentDate] = useState<string>("");

  // 초기 로드(SSR 안정)
  useEffect(() => {
    if (!mounted) return;
    // NavBar에서 세팅한 값/로컬 값 반영
    const qn = typeof router.query.name === "string" ? router.query.name : null;
    const qe = typeof router.query.email === "string" ? router.query.email : null;

    const n = qn || localStorage.getItem("userName");
    const e = qe || localStorage.getItem("userEmail") || localStorage.getItem("email");
    const r = (localStorage.getItem("userRole") as Role) || undefined;

    const pid = localStorage.getItem("patientId") || "";
    const lic = localStorage.getItem("doctorLicense") || "";
    const h = localStorage.getItem("hospitalName") || "";
    const d = localStorage.getItem("department") || "";
    const w = localStorage.getItem("ward") || "";
    const p = localStorage.getItem("userPhone") || "";
    const memo = localStorage.getItem("profileNote") || "";

    if (n) setName(n);
    if (e) setEmail(e);
    if (r) setRole(r);
    if (pid) setPatientId(pid);
    if (lic) setLicense(lic);
    if (h) setHospital(h);
    if (d) setDepartment(d);
    if (w) setWard(w);
    if (p) setPhone(p);
    if (memo) setNote(memo);

    // 가입/동의 일시: 없으면 최초 접속 시 저장
    let jd = localStorage.getItem("joinDate");
    if (!jd) {
      jd = new Date().toISOString();
      localStorage.setItem("joinDate", jd);
    }
    setJoinDate(jd);

    let cd = localStorage.getItem("consentDate");
    if (!cd) {
      // 기본적으로 가입일시와 동일로 설정(실서비스에선 실제 동의 시점 기록 사용)
      cd = jd;
      localStorage.setItem("consentDate", cd);
    }
    setConsentDate(cd);
  }, [mounted, router.query.name, router.query.email]);

  // 이니셜(아바타)
  const initial = useMemo(
    () => (name?.trim() ? name.trim().charAt(0) : "유").toUpperCase(),
    [name]
  );

  function saveEditable() {
    localStorage.setItem("userPhone", phone);
    localStorage.setItem("profileNote", note);
    alert("저장되었습니다.");
  }

  function doLogout() {
    // 최소 정보만 지울 수도 있으나, 데모에선 넓게 정리
    localStorage.removeItem("isAuthed");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    router.push("/login");
  }

  function doDelete() {
    if (!confirm("정말로 회원 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;
    localStorage.clear();
    alert("회원 탈퇴가 완료되었습니다.");
    router.push("/signup");
  }

  const readOnlyIdLabel =
    role === "doctor" ? "면허 번호" : role === "patient" ? "환자 번호" : "식별 번호";

  const readOnlyIdValue =
    role === "doctor" ? license : role === "patient" ? patientId : "-";

  const readOnlyHospitalLabel =
    role === "nurse" ? "소속 병원" : role === "guardian" ? "연계 병원" : "주 진료 병원";

  return (
    <main className="wrap">
      {/* 헤더 */}
      <section className="head">
        <h1>내 프로필</h1>
        <p className="muted">개인 정보와 연락처, 가입 정보를 확인합니다.</p>
      </section>

      {/* 상단 요약 카드 */}
      <section className="top">
        <article className="card hero">
          <div className="avatar" aria-hidden>
            {initial}
          </div>
          <div className="info">
            <div className="line1">
              <strong className="uname">{name}</strong>
              <span className={`badge ${role}`}>{roleLabel(role)}</span>
            </div>

            <div className="line2">
              <span className="id">
                {readOnlyIdLabel}&nbsp;{readOnlyIdValue}
              </span>
              <span className="sep">·</span>
              <span className="email">{email || "Google 로그인 이메일"}</span>
            </div>

            <div className="line3">
              <span>가입일시&nbsp;<b>{fmt(joinDate)}</b></span>
              <span className="sep">·</span>
              <span>
                개인정보 수집동의&nbsp;<b>{fmt(consentDate)}</b>
                &nbsp;—&nbsp;
                <a href="/legal/privacy" className="plink">
                  개인정보처리방침 보기
                </a>
              </span>
            </div>
          </div>

          <div className="actions">
            <button className="pill ghost" onClick={() => alert("사진 변경(데모)")}>
              사진 변경
            </button>
            <button className="pill" onClick={saveEditable}>
              저장
            </button>
          </div>
        </article>
      </section>

      {/* 읽기 전용 섹션 + 편집 가능 섹션 */}
      <section className="grid">
        <article className="card ro">
          <h3>기본 정보</h3>

          <div className="row">
            <label>역할</label>
            <input value={roleLabel(role)} disabled />
          </div>

          <div className="row">
            <label>이름</label>
            <input value={name} disabled />
          </div>

          {/* 역할별 읽기 전용 필드 */}
          {role !== "guardian" && (
            <div className="row">
              <label>{readOnlyIdLabel}</label>
              <input value={readOnlyIdValue} disabled />
            </div>
          )}

          <div className="row">
            <label>{readOnlyHospitalLabel}</label>
            <input value={hospital} disabled />
          </div>

          {/* 참고 표시(있을 때만) */}
          {(role === "doctor" || role === "nurse") && (
            <div className="row two">
              <div>
                <label>진료과</label>
                <input value={department} disabled />
              </div>
              <div>
                <label>병동</label>
                <input value={ward} disabled />
              </div>
            </div>
          )}
        </article>

        <article className="card form">
          <h3>연락 및 메모</h3>

          <div className="row">
            <label>전화번호</label>
            <div className="input-with">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010-0000-0000"
              />
              <button className="pill ghost" onClick={() => alert("SMS 인증(데모)")}>
                인증
              </button>
            </div>
          </div>

          <div className="row">
            <label>메모</label>
            <textarea
              rows={5}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="의료진/간호사에게 전달할 참고 메모"
            />
          </div>

          <div className="form-actions">
            <button className="pill ghost" onClick={() => window.history.back()}>
              취소
            </button>
            <button className="pill" onClick={saveEditable}>
              저장하기
            </button>
          </div>
        </article>
      </section>

      {/* 바닥: 로그아웃 / 회원탈퇴 */}
      <section className="bottom">
        <div className="sepbar" />
        <div className="bottom-actions">
          <button className="pill ghost" onClick={doLogout}>
            로그아웃
          </button>
          <button className="pill danger" onClick={doDelete} title="되돌릴 수 없습니다">
            회원탈퇴
          </button>
        </div>
      </section>

      <style jsx>{`
        :global(html, body) {
          background: #f6f9ff;
        }
        .wrap {
          max-width: 1040px;
          margin: 0 auto;
          padding: 16px 14px 80px;
        }

        .head h1 {
          margin: 4px 0;
          font-size: 28px;
          letter-spacing: -0.2px;
          color: #152447;
        }
        .muted {
          color: #6b7aa8;
          margin: 0 0 6px;
        }

        .top {
          margin-top: 10px;
        }
        .card {
          background: #fff;
          border: 1px solid #e3edff;
          border-radius: 18px;
          box-shadow: 0 10px 22px rgba(21, 44, 84, 0.06);
          padding: 14px;
          box-sizing: border-box;
        }
        .hero {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 14px;
          align-items: center;
        }
        .avatar {
          width: 64px;
          height: 64px;
          border-radius: 999px;
          border: 1px solid #cfe0ff;
          background: radial-gradient(100% 100% at 30% 20%, #e7efff 0%, #dce8ff 100%);
          color: #2a54b6;
          display: grid;
          place-items: center;
          font-weight: 900;
          font-size: 22px;
        }
        .info .line1 {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .uname {
          font-size: 18px;
          color: #10224d;
        }
        .badge {
          height: 24px;
          padding: 0 10px;
          border-radius: 999px;
          border: 1px solid #dbe7ff;
          background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
          font-weight: 800;
          font-size: 12px;
          color: #15336b;
        }
        .badge.doctor {
          color: #0b3c84;
        }
        .badge.nurse {
          color: #2a5f9e;
        }
        .badge.patient {
          color: #0f7a4c;
        }
        .badge.guardian {
          color: #8a4a0a;
        }
        .line2,
        .line3 {
          display: flex;
          gap: 8px;
          color: #5e719c;
          margin-top: 4px;
          font-size: 13px;
          flex-wrap: wrap;
        }
        .line3 a.plink {
          color: #2e63e7;
          font-weight: 800;
          text-decoration: underline;
        }
        .sep {
          opacity: 0.5;
        }

        .actions {
          display: flex;
          gap: 8px;
        }
        .pill {
          height: 34px;
          padding: 0 14px;
          border-radius: 999px;
          border: 1px solid #dbe7ff;
          background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
          font-weight: 800;
          color: #15336b;
        }
        .pill.ghost {
          background: #fff;
          color: #41568a;
        }
        .pill.danger {
          background: #ef4444;
          border-color: #dc2626;
          color: #fff;
        }

        .grid {
          margin-top: 14px;
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 16px;
        }
        .ro h3,
        .form h3 {
          margin: 2px 0 10px;
          font-size: 16px;
          color: #10224d;
        }
        .row {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 12px;
        }
        .row.two {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        label {
          font-size: 12px;
          color: #5e719c;
          font-weight: 700;
        }
        input,
        select,
        textarea {
          width: 100%;
          border: 1px solid #dbe7ff;
          border-radius: 12px;
          padding: 10px 12px;
          background: #fff;
          color: #10224d;
          font-size: 14px;
          box-sizing: border-box;
        }
        input:disabled {
          background: #f3f6ff;
          color: #6b7aa8;
          cursor: not-allowed;
        }
        .input-with {
          display: flex;
          gap: 8px;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 8px;
        }

        .bottom {
          margin-top: 18px;
        }
        .sepbar {
          height: 1px;
          background: #e6eeff;
          margin: 8px 0 12px;
        }
        .bottom-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        @media (max-width: 860px) {
          .grid {
            grid-template-columns: 1fr;
          }
          .hero {
            grid-template-columns: auto 1fr;
          }
          .actions {
            grid-column: 1 / -1;
            justify-content: flex-end;
          }
        }
      `}</style>
    </main>
  );
}
