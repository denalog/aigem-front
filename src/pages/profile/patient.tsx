// src/pages/profile/patient.tsx
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";

type Role = "patient";
const roleLabel = () => "환자";

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

export default function PatientProfilePage() {
  const router = useRouter();
  const mounted = useMounted();
  const role: Role = "patient";

  // ✅ 기본(데모) 값
  const DEFAULT_PATIENT = {
    pid: "p001",
    name: "김복순",
    email: "boksun.kim@aigem-care.local",
    birth: "1938-03-14",
    phone: "010-5555-5555",
    hospital: "AIGEM 요양병원",
  };
  const DEFAULT_GUARDIAN = {
    name: "이상훈",
    relation: "자녀",
    phone: "010-1234-5678",
  };
  const DEFAULT_CARETEAM = {
    doctor: { name: "김민준", dept: "내과", phone: "010-5555-1234" },
    caregiver: { name: "최은정", team: "본관 3병동 · 요양팀", phone: "010-3333-4444" },
  };

  // 읽기 전용/표시 값 (환자)
  const [name, setName] = useState(DEFAULT_PATIENT.name);
  const [email, setEmail] = useState(DEFAULT_PATIENT.email);
  const [pid, setPid] = useState(DEFAULT_PATIENT.pid);
  const [birth, setBirth] = useState(DEFAULT_PATIENT.birth);
  const [hospital, setHospital] = useState(DEFAULT_PATIENT.hospital);

  // 수정 가능(환자 본인)
  const [phone, setPhone] = useState(DEFAULT_PATIENT.phone);
  const [note, setNote] = useState("");

  // 보호자 표시
  const [gName, setGName] = useState(DEFAULT_GUARDIAN.name);
  const [gRel, setGRel] = useState(DEFAULT_GUARDIAN.relation);
  const [gPhone, setGPhone] = useState(DEFAULT_GUARDIAN.phone);

  // 케어팀 간단 표시
  const [docName, setDocName] = useState(DEFAULT_CARETEAM.doctor.name);
  const [docDept, setDocDept] = useState(DEFAULT_CARETEAM.doctor.dept);
  const [docPhone, setDocPhone] = useState(DEFAULT_CARETEAM.doctor.phone);
  const [cgName, setCgName] = useState(DEFAULT_CARETEAM.caregiver.name);
  const [cgTeam, setCgTeam] = useState(DEFAULT_CARETEAM.caregiver.team);
  const [cgPhone, setCgPhone] = useState(DEFAULT_CARETEAM.caregiver.phone);

  // 메타
  const [joinDate, setJoinDate] = useState<string>("");
  const [consentDate, setConsentDate] = useState<string>("");

  // 보호자 수정요청 모달
  const [openGuardianReq, setOpenGuardianReq] = useState(false);
  const [reqName, setReqName] = useState(gName);
  const [reqRel, setReqRel] = useState(gRel);
  const [reqPhone, setReqPhone] = useState(gPhone);
  const [reqSubmitted, setReqSubmitted] = useState(false);

  useEffect(() => {
    if (!mounted) return;

    // 회원가입 직후 session mock → 로컬에 반영
    try {
      const mock = sessionStorage.getItem("aigem-dev-mock");
      if (mock) {
        const parsed = JSON.parse(mock);
        if (parsed?.role === "patient") {
          if (parsed.email) localStorage.setItem("userEmail", parsed.email);
          if (parsed.name) localStorage.setItem("userName", parsed.name);
          if (parsed.patientId) localStorage.setItem("patientId", parsed.patientId);
          localStorage.setItem("userRole", "patient");
        }
      }
    } catch {}

    // 로컬 값 로드 (없으면 기본)
    const n  = localStorage.getItem("userName") || DEFAULT_PATIENT.name;
    const e  = localStorage.getItem("userEmail") || localStorage.getItem("email") || DEFAULT_PATIENT.email;
    const id = localStorage.getItem("patientId") || DEFAULT_PATIENT.pid;
    const b  = localStorage.getItem("patientBirth") || DEFAULT_PATIENT.birth;
    const h  = localStorage.getItem("hospitalName") || DEFAULT_PATIENT.hospital;
    const p  = localStorage.getItem("userPhone") || DEFAULT_PATIENT.phone;

    const gn = localStorage.getItem("guardianName") || DEFAULT_GUARDIAN.name;
    const gr = localStorage.getItem("guardianRelation") || DEFAULT_GUARDIAN.relation;
    const gp = localStorage.getItem("guardianPhone") || DEFAULT_GUARDIAN.phone;

    const dn = localStorage.getItem("doctorName") || DEFAULT_CARETEAM.doctor.name;
    const dd = localStorage.getItem("doctorDept") || DEFAULT_CARETEAM.doctor.dept;
    const dp = localStorage.getItem("doctorPhone") || DEFAULT_CARETEAM.doctor.phone;

    const cn = localStorage.getItem("caregiverName") || DEFAULT_CARETEAM.caregiver.name;
    const ct = localStorage.getItem("caregiverTeam") || DEFAULT_CARETEAM.caregiver.team;
    const cp = localStorage.getItem("caregiverPhone") || DEFAULT_CARETEAM.caregiver.phone;

    setName(n); setEmail(e); setPid(id); setBirth(b); setHospital(h); setPhone(p);
    setGName(gn); setGRel(gr); setGPhone(gp);
    setDocName(dn); setDocDept(dd); setDocPhone(dp);
    setCgName(cn); setCgTeam(ct); setCgPhone(cp);

    const memo = localStorage.getItem("profileNote") || "";
    setNote(memo);

    // 가입/동의 일시
    let jd = localStorage.getItem("joinDate");
    if (!jd) { jd = new Date().toISOString(); localStorage.setItem("joinDate", jd); }
    setJoinDate(jd);

    let cd = localStorage.getItem("consentDate");
    if (!cd) { cd = jd; localStorage.setItem("consentDate", cd); }
    setConsentDate(cd);

    // 역할 고정
    localStorage.setItem("userRole", "patient");
  }, [mounted]);

  // 아바타 이니셜
  const initial = useMemo(() => (name?.trim() ? name.trim().charAt(0) : "환").toUpperCase(), [name]);

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

  // 보호자 수정요청
  const openReq = () => {
    setReqName(gName); setReqRel(gRel); setReqPhone(gPhone);
    setReqSubmitted(false);
    setOpenGuardianReq(true);
  };
  const submitReq = () => {
    if (!reqName.trim() || !reqRel.trim() || !reqPhone.trim()) {
      alert("모든 항목을 입력해주세요.");
      return;
    }
    // 실제 서비스라면 서버로 전송
    setReqSubmitted(true);
  };

  return (
    <main className="wrap">
      {/* 헤더 */}
      <section className="head">
        <h1>내 프로필</h1>
        <p className="muted">환자 정보와 보호자, 케어팀 정보를 확인합니다.</p>
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
              <span className="id">환자번호&nbsp;{pid}</span>
              <span className="sep">·</span>
              <span className="email">{email}</span>
            </div>

            <div className="line3">
              <span>생년월일&nbsp;<b>{birth}</b></span>
              <span className="sep">·</span>
              <span>주 진료 병원&nbsp;<b>{hospital}</b></span>
            </div>

            <div className="line3">
              <span>가입일시&nbsp;<b>{fmt(joinDate)}</b></span>
              <span className="sep">·</span>
              <span>
                개인정보 수집동의&nbsp;<b>{fmt(consentDate)}</b>
                &nbsp;—&nbsp;<a href="/legal/privacy" className="plink">개인정보처리방침 보기</a>
              </span>
            </div>
          </div>

          <div className="actions">
            <button className="pill" onClick={saveEditable}>저장</button>
          </div>
        </article>
      </section>

      {/* 그리드: 환자/보호자/케어팀 */}
      <section className="grid">
        {/* 환자 연락, 메모 */}
        <article className="card form">
          <h3>연락 및 메모</h3>

          <div className="row">
            <label>전화번호</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000" />
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
            <button className="pill ghost" onClick={() => window.history.back()}>취소</button>
            <button className="pill" onClick={saveEditable}>저장하기</button>
          </div>
        </article>

        {/* 보호자 정보 (수정요청) */}
        <article className="card ro">
          <h3>보호자 정보</h3>
          <div className="row two">
            <div>
              <label>이름</label>
              <input value={gName} disabled />
            </div>
            <div>
              <label>관계</label>
              <input value={gRel} disabled />
            </div>
          </div>
          <div className="row">
            <label>연락처</label>
            <input value={gPhone} disabled />
          </div>

          <div className="form-actions">
            <button className="pill primary" onClick={openReq}>보호자 수정 요청</button>
          </div>
        </article>

        {/* 케어팀 정보(간단) */}
        <article className="card ro">
          <h3>케어팀</h3>
          <div className="kt">
            <div className="krow">
              <div className="krole">주치의</div>
              <div className="kval">
                <b>{docName}</b><span className="sep">·</span><span>{docDept}</span>
                <div className="kphone">{docPhone}</div>
              </div>
            </div>
            <div className="krow">
              <div className="krole">요양사</div>
              <div className="kval">
                <b>{cgName}</b><span className="sep">·</span><span>{cgTeam}</span>
                <div className="kphone">{cgPhone}</div>
              </div>
            </div>
          </div>
        </article>
      </section>

      {/* 로그아웃/탈퇴 */}
      <section className="bottom">
        <div className="sepbar" />
        <div className="bottom-actions">
          <button className="pill ghost" onClick={doLogout}>로그아웃</button>
          <button className="pill danger" onClick={doDelete} title="되돌릴 수 없습니다">회원탈퇴</button>
        </div>
      </section>

      {/* 🟦 AGem 스타일 중앙 팝업: 보호자 수정요청 */}
      {openGuardianReq && (
        <div className="modal" role="dialog" aria-modal="true" onClick={() => setOpenGuardianReq(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <header className="mhead">
              <strong>{reqSubmitted ? "요청 완료" : "보호자 정보 수정 요청"}</strong>
              <button className="x" onClick={() => setOpenGuardianReq(false)} aria-label="닫기">✕</button>
            </header>

            <div className="mbody">
              {!reqSubmitted ? (
                <>
                  <div className="row two">
                    <div>
                      <label>보호자 이름</label>
                      <input value={reqName} onChange={(e) => setReqName(e.target.value)} />
                    </div>
                    <div>
                      <label>관계</label>
                      <input value={reqRel} onChange={(e) => setReqRel(e.target.value)} />
                    </div>
                  </div>
                  <div className="row">
                    <label>보호자 연락처</label>
                    <input value={reqPhone} onChange={(e) => setReqPhone(e.target.value)} placeholder="010-0000-0000" />
                  </div>
                  <div className="hint">제출 시 관리자가 확인 후 반영합니다.</div>
                </>
              ) : (
                <div className="okbox">
                  <div className="ok-emoji" aria-hidden>✅</div>
                  <div className="ok-title">관리자에게 접수되었습니다</div>
                  <div className="ok-desc">확인 후 반영되며, 필요시 연락을 드립니다.</div>
                </div>
              )}
            </div>

            <footer className="mfoot">
              {!reqSubmitted ? (
                <>
                  <button className="pill ghost" onClick={() => setOpenGuardianReq(false)}>취소</button>
                  <button className="pill primary" onClick={submitReq}>요청 제출</button>
                </>
              ) : (
                <button className="pill primary" onClick={() => setOpenGuardianReq(false)}>확인</button>
              )}
            </footer>
          </div>
        </div>
      )}

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
        .badge.patient{ color:#0f7a4c; }
        .line2,.line3{
          display:flex; gap:8px; color:#5e719c; margin-top:4px; font-size:13px; flex-wrap:wrap;
        }
        .line3 a.plink{ color:#2e63e7; font-weight:800; text-decoration:underline; }
        .sep{ opacity:.5; }

        .actions{ display:flex; gap:8px; }
        .pill{
          height:34px; padding:0 14px; border-radius:999px; border:1px solid #dbe7ff;
          background:linear-gradient(180deg,#f8fbff 0%, #ffffff 100%); font-weight:800; color:#15336b;
        }
        .pill.ghost{ background:#fff; color:#41568a; }
        .pill.danger{ background:#ef4444; border-color:#dc2626; color:#fff; }
        .pill.primary{ background:#2f6fe4; border-color:#2f6fe4; color:#fff; }

        .grid{ margin-top:14px; display:grid; grid-template-columns:1.2fr .8fr; gap:16px; }
        .ro h3,.form h3{ margin:2px 0 10px; font-size:16px; color:#10224d; }
        .row{ display:flex; flex-direction:column; gap:6px; margin-bottom:12px; }
        .row.two{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        label{ font-size:12px; color:#5e719c; font-weight:700; }
        input,textarea{
          width:100%; border:1px solid #dbe7ff; border-radius:12px; padding:10px 12px;
          background:#fff; color:#10224d; font-size:14px; box-sizing:border-box;
        }

        .form-actions{ display:flex; justify-content:flex-end; gap:8px; margin-top:8px; }

        .kt{ display:grid; gap:10px; }
        .krow{ display:grid; grid-template-columns:72px 1fr; gap:10px; align-items:start; }
        .krole{ font-size:12px; color:#6b7fb0; font-weight:800; }
        .kval{ color:#0b1b33; font-weight:800; display:flex; flex-direction:column; gap:4px; }
        .kphone{ color:#2a4d8f; font-weight:900; letter-spacing:.2px; }

        .bottom{ margin-top:18px; }
        .sepbar{ height:1px; background:#e6eeff; margin:8px 0 12px; }
        .bottom-actions{ display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap; }

        @media (max-width:860px){
          .grid{ grid-template-columns:1fr; }
          .hero{ grid-template-columns:auto 1fr; }
          .actions{ grid-column:1 / -1; justify-content:flex-end; }
        }

        /* 중앙 모달 */
        .modal{
          position:fixed; inset:0; background:rgba(10,20,40,.28); backdrop-filter:blur(2px);
          display:flex; align-items:center; justify-content:center; z-index:50; padding:12px;
        }
        .sheet{
          width:min(92vw,520px); background:#fff; border-radius:16px; border:1px solid #e1e9ff;
          box-shadow:0 20px 40px rgba(21,44,84,.18); overflow:hidden; display:grid; grid-template-rows:auto 1fr auto;
        }
        .mhead{ display:flex; align-items:center; justify-content:space-between; padding:10px 12px; border-bottom:1px solid #eef3fb; }
        .x{ width:32px; height:32px; border-radius:10px; border:1px solid #e1e9ff; background:#fff; }
        .mbody{ padding:12px; display:grid; gap:10px; }
        .mfoot{ padding:10px 12px; border-top:1px solid #eef3fb; display:flex; justify-content:flex-end; gap:8px; }
        .hint{ color:#6b7aa8; font-size:12px; }

        .okbox{ display:grid; place-items:center; gap:6px; padding:16px 6px; text-align:center; }
        .ok-emoji{ font-size:40px; line-height:1; }
        .ok-title{ font-weight:900; color:#10224d; }
        .ok-desc{ color:#475569; }
      `}</style>
    </main>
  );
}
