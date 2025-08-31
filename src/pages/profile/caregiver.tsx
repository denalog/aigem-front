// src/pages/profile/caregiver.tsx
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";

type Role = "caregiver";
const roleLabel = () => "요양사";

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

export default function CaregiverProfilePage() {
  const router = useRouter();
  const mounted = useMounted();

  // 기본값(회원가입 폼과 동일 톤)
  const DEFAULT = {
    name: "최은정",
    email: "eunjeong.choi@aigem.dev",
    cert: "CG-2021-102938",      // 요양보호사 자격번호
    phone: "010-3333-4444",
    hospital: "AIGEM 요양병원",
    team: "본관 3병동 · 요양팀",
    shift: "rotate",              // day | night | rotate
    staffId: "CGV-0001",
    years: 5,
  };

  const role: Role = "caregiver";

  // 읽기 전용/표시 값
  const [name, setName] = useState(DEFAULT.name);
  const [email, setEmail] = useState(DEFAULT.email);
  const [cert, setCert] = useState(DEFAULT.cert);
  const [hospital, setHospital] = useState(DEFAULT.hospital);
  const [team, setTeam] = useState(DEFAULT.team);
  const [shift, setShift] = useState<"day" | "night" | "rotate">(DEFAULT.shift as any);
  const [staffId, setStaffId] = useState(DEFAULT.staffId);
  const [years, setYears] = useState<number>(DEFAULT.years);

  // 수정 가능
  const [phone, setPhone] = useState(DEFAULT.phone);
  const [note, setNote] = useState("");

  // 메타
  const [joinDate, setJoinDate] = useState<string>("");
  const [consentDate, setConsentDate] = useState<string>("");

  useEffect(() => {
    if (!mounted) return;

    // 세션(회원가입 직후) → 로컬로 보정
    try {
      const mock = sessionStorage.getItem("aigem-dev-mock");
      if (mock) {
        const parsed = JSON.parse(mock);
        if (parsed?.role === "caregiver") {
          localStorage.setItem("userRole", "caregiver");
          if (parsed.email) localStorage.setItem("userEmail", parsed.email);
          if (parsed.name) localStorage.setItem("userName", parsed.name);
        }
      }
    } catch {}

    // 로컬 값 로드 (없으면 기본값으로 초기화)
    const n   = localStorage.getItem("userName") || DEFAULT.name;
    const e   = localStorage.getItem("userEmail") || localStorage.getItem("email") || DEFAULT.email;
    const c   = localStorage.getItem("caregiverCert") || DEFAULT.cert;
    const h   = localStorage.getItem("hospitalName") || DEFAULT.hospital;
    const t   = localStorage.getItem("caregiverTeam") || DEFAULT.team;
    const s   = (localStorage.getItem("caregiverShift") as "day"|"night"|"rotate") || DEFAULT.shift;
    const id  = localStorage.getItem("caregiverStaffId") || DEFAULT.staffId;
    const y   = Number(localStorage.getItem("caregiverYears") ?? DEFAULT.years);
    const p   = localStorage.getItem("userPhone") || DEFAULT.phone;
    const memo= localStorage.getItem("profileNote") || "";

    setName(n); setEmail(e); setCert(c); setHospital(h); setTeam(t);
    setShift(s); setStaffId(id); setYears(isNaN(y) ? DEFAULT.years : y);
    setPhone(p); setNote(memo);

    // 가입/동의 일시
    let jd = localStorage.getItem("joinDate");
    if (!jd) { jd = new Date().toISOString(); localStorage.setItem("joinDate", jd); }
    setJoinDate(jd);

    let cd = localStorage.getItem("consentDate");
    if (!cd) { cd = jd; localStorage.setItem("consentDate", cd); }
    setConsentDate(cd);

    // 역할 고정
    localStorage.setItem("userRole", "caregiver");
    // 읽기 전용 필드도 저장(초기 한번)
    localStorage.setItem("caregiverCert", c);
    localStorage.setItem("caregiverTeam", t);
    localStorage.setItem("caregiverShift", s);
    localStorage.setItem("caregiverStaffId", id);
    localStorage.setItem("caregiverYears", String(y));
    localStorage.setItem("hospitalName", h);
  }, [mounted]);

  // 아바타 이니셜
  const initial = useMemo(
    () => (name?.trim() ? name.trim().charAt(0) : "요").toUpperCase(),
    [name]
  );

  function saveEditable() {
    localStorage.setItem("userPhone", phone);
    localStorage.setItem("profileNote", note);
    alert("저장되었습니다.");
  }

  function doLogout() {
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

  const shiftLabel = (s: "day" | "night" | "rotate") =>
    s === "day" ? "주간" : s === "night" ? "야간" : "교대";

  return (
    <main className="wrap">
      {/* 헤더 */}
      <section className="head">
        <h1>내 프로필</h1>
        <p className="muted">요양사 계정의 기본 정보와 연락처를 확인합니다.</p>
      </section>

      {/* 상단 요약 */}
      <section className="top">
        <article className="card hero">
          <div className="avatar" aria-hidden>{initial}</div>

          <div className="info">
            <div className="line1">
              <strong className="uname">{name}</strong>
              <span className={`badge ${role}`}>{roleLabel()}</span>
            </div>

            <div className="line2">
              <span className="id">자격번호&nbsp;{cert}</span>
              <span className="sep">·</span>
              <span className="email">{email}</span>
            </div>

            <div className="line3">
              <span>가입일시&nbsp;<b>{fmt(joinDate)}</b></span>
              <span className="sep">·</span>
              <span>
                개인정보 수집동의&nbsp;<b>{fmt(consentDate)}</b>
                &nbsp;—&nbsp;
                <a href="/legal/privacy" className="plink">개인정보처리방침 보기</a>
              </span>
            </div>
          </div>

          <div className="actions">
            <button className="pill ghost" onClick={() => alert("사진 변경(데모)")}>사진 변경</button>
            <button className="pill" onClick={saveEditable}>저장</button>
          </div>
        </article>
      </section>

      {/* 상세 */}
      <section className="grid">
        <article className="card ro">
          <h3>기본 정보</h3>

          <div className="row">
            <label>역할</label>
            <input value={roleLabel()} disabled />
          </div>

          <div className="row">
            <label>이름</label>
            <input value={name} disabled />
          </div>

          <div className="row two">
            <div>
              <label>자격번호</label>
              <input value={cert} disabled />
            </div>
            <div>
              <label>직원번호</label>
              <input value={staffId} disabled />
            </div>
          </div>

          <div className="row">
            <label>소속 병원</label>
            <input value={hospital} disabled />
          </div>

          <div className="row two">
            <div>
              <label>팀/병동</label>
              <input value={team} disabled />
            </div>
            <div>
              <label>근무 형태</label>
              <input value={shiftLabel(shift)} disabled />
            </div>
          </div>

          <div className="row">
            <label>경력(년)</label>
            <input value={String(years)} disabled />
          </div>
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
              <button className="pill ghost" onClick={() => alert("SMS 인증(데모)")}>인증</button>
            </div>
          </div>

          <div className="row">
            <label>메모</label>
            <textarea
              rows={5}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="근무/환자 케어 참고 메모를 남겨주세요"
            />
          </div>

          <div className="form-actions">
            <button className="pill ghost" onClick={() => window.history.back()}>취소</button>
            <button className="pill" onClick={saveEditable}>저장하기</button>
          </div>
        </article>
      </section>

      {/* 바닥 */}
      <section className="bottom">
        <div className="sepbar" />
        <div className="bottom-actions">
          <button className="pill ghost" onClick={doLogout}>로그아웃</button>
          <button className="pill danger" onClick={doDelete} title="되돌릴 수 없습니다">회원탈퇴</button>
        </div>
      </section>

      <style jsx>{`
        :global(html, body){ background:#f6f9ff; }
        .wrap{ max-width:1040px; margin:0 auto; padding:16px 14px 80px; }

        .head h1{ margin:4px 0; font-size:28px; letter-spacing:-.2px; color:#152447; }
        .muted{ color:#6b7aa8; margin:0 0 6px; }

        .top{ margin-top:10px; }
        .card{
          background:#fff; border:1px solid #e3edff; border-radius:18px;
          box-shadow:0 10px 22px rgba(21,44,84,.06); padding:14px; box-sizing:border-box;
        }
        .hero{ display:grid; grid-template-columns:auto 1fr auto; gap:14px; align-items:center; }
        .avatar{
          width:64px; height:64px; border-radius:999px; border:1px solid #cfe0ff;
          background:radial-gradient(100% 100% at 30% 20%, #e7efff 0%, #dce8ff 100%);
          color:#2a54b6; display:grid; place-items:center; font-weight:900; font-size:22px;
        }
        .info .line1{ display:flex; align-items:center; gap:8px; }
        .uname{ font-size:18px; color:#10224d; }
        .badge{
          height:24px; padding:0 10px; border-radius:999px; border:1px solid #dbe7ff;
          background:linear-gradient(180deg,#f8fbff 0%, #ffffff 100%);
          font-weight:800; font-size:12px; color:#15336b;
        }
        .badge.caregiver{ color:#7a2e8f; }
        .line2,.line3{ display:flex; gap:8px; color:#5e719c; margin-top:4px; font-size:13px; flex-wrap:wrap; }
        .line3 a.plink{ color:#2e63e7; font-weight:800; text-decoration:underline; }
        .sep{ opacity:.5; }

        .actions{ display:flex; gap:8px; }
        .pill{
          height:34px; padding:0 14px; border-radius:999px; border:1px solid #dbe7ff;
          background:linear-gradient(180deg,#f8fbff 0%, #ffffff 100%); font-weight:800; color:#15336b;
        }
        .pill.ghost{ background:#fff; color:#41568a; }
        .pill.danger{ background:#ef4444; border-color:#dc2626; color:#fff; }

        .grid{ margin-top:14px; display:grid; grid-template-columns:1.2fr .8fr; gap:16px; }
        .ro h3,.form h3{ margin:2px 0 10px; font-size:16px; color:#10224d; }
        .row{ display:flex; flex-direction:column; gap:6px; margin-bottom:12px; }
        .row.two{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        label{ font-size:12px; color:#5e719c; font-weight:700; }
        input,select,textarea{
          width:100%; border:1px solid #dbe7ff; border-radius:12px; padding:10px 12px;
          background:#fff; color:#10224d; font-size:14px; box-sizing:border-box;
        }
        input:disabled{ background:#f3f6ff; color:#6b7aa8; cursor:not-allowed; }
        .input-with{ display:flex; gap:8px; }

        .form-actions{ display:flex; justify-content:flex-end; gap:8px; margin-top:8px; }

        .bottom{ margin-top:18px; }
        .sepbar{ height:1px; background:#e6eeff; margin:8px 0 12px; }
        .bottom-actions{ display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap; }

        @media (max-width:860px){
          .grid{ grid-template-columns:1fr; }
          .hero{ grid-template-columns:auto 1fr; }
          .actions{ grid-column:1 / -1; justify-content:flex-end; }
        }
      `}</style>
    </main>
  );
}
