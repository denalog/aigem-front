// src/pages/profile/guardian.tsx
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";

const roleLabel = "보호자";

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

export default function GuardianProfilePage() {
  const router = useRouter();
  const mounted = useMounted();

  // ✅ 기본(데모) 값
  const DEFAULT_GUARDIAN = {
    name: "이상훈",
    email: "sanghoon.lee@aigem.dev",
    relation: "자녀",
    phone: "010-1234-5678",
  };
  const DEFAULT_PATIENT = {
    pid: "p001",
    name: "김복순",
    hospital: "AIGEM 요양병원",
  };
  const DEFAULT_CARETEAM = {
    doctor: { name: "김민준", dept: "내과", phone: "010-5555-1234" },
    nurse: { name: "박소연", phone: "010-2222-3333" },
    caregiver: {
      name: "최은정",
      team: "본관 3병동 · 요양팀",
      phone: "010-4444-7777",
    },
  };

  // 본인(보호자) 표시값
  const [name, setName] = useState(DEFAULT_GUARDIAN.name);
  const [email, setEmail] = useState(DEFAULT_GUARDIAN.email);
  const [relation, setRelation] = useState(DEFAULT_GUARDIAN.relation);
  const [phone, setPhone] = useState(DEFAULT_GUARDIAN.phone);
  const [note, setNote] = useState("");

  // 연결 환자/병원/케어팀
  const [pid, setPid] = useState(DEFAULT_PATIENT.pid);
  const [pname, setPname] = useState(DEFAULT_PATIENT.name);
  const [hospital, setHospital] = useState(DEFAULT_PATIENT.hospital);

  const [docName, setDocName] = useState(DEFAULT_CARETEAM.doctor.name);
  const [docDept, setDocDept] = useState(DEFAULT_CARETEAM.doctor.dept);
  const [docPhone, setDocPhone] = useState(DEFAULT_CARETEAM.doctor.phone);
  const [nurseName, setNurseName] = useState(DEFAULT_CARETEAM.nurse.name);
  const [nursePhone, setNursePhone] = useState(DEFAULT_CARETEAM.nurse.phone);
  const [cgName, setCgName] = useState(DEFAULT_CARETEAM.caregiver.name);
  const [cgTeam, setCgTeam] = useState(DEFAULT_CARETEAM.caregiver.team);
  const [cgPhone, setCgPhone] = useState(DEFAULT_CARETEAM.caregiver.phone);

  // 메타
  const [joinDate, setJoinDate] = useState<string>("");
  const [consentDate, setConsentDate] = useState<string>("");

  // 변경 요청 모달
  const [openChangeReq, setOpenChangeReq] = useState(false);
  const [reqPid, setReqPid] = useState(pid);
  const [reqPname, setReqPname] = useState(pname);
  const [reqRelation, setReqRelation] = useState(relation);
  const [reqSubmitted, setReqSubmitted] = useState(false);

  // ⬇ useEffect 전체 교체
  useEffect(() => {
    if (!mounted) return;

    // 0) 세션 목(mock) 반영(있으면)
    let baseName = DEFAULT_GUARDIAN.name;
    let baseEmail = DEFAULT_GUARDIAN.email;
    try {
      const mock = sessionStorage.getItem("aigem-dev-mock");
      if (mock) {
        const m = JSON.parse(mock);
        if (m?.role === "guardian") {
          if (m.name) baseName = m.name;
          if (m.email) baseEmail = m.email;
        }
      }
    } catch {}

    // 1) 로컬에 환자/의사 등 다른 역할의 값이 있어도 무시하고
    //    보호자 진입 시 기본값으로 강제 세팅
    const storedRole = localStorage.getItem("userRole");
    if (storedRole !== "guardian") {
      localStorage.setItem("userRole", "guardian");
      localStorage.setItem("userName", baseName);
      localStorage.setItem("userEmail", baseEmail);
    }

    // 2) 이제 'guardian'인 경우에만 저장값을 채택
    const nameLS =
      localStorage.getItem("userRole") === "guardian"
        ? localStorage.getItem("userName")
        : null;
    const emailLS =
      localStorage.getItem("userRole") === "guardian"
        ? localStorage.getItem("userEmail") || localStorage.getItem("email")
        : null;
    const phoneLS =
      localStorage.getItem("userRole") === "guardian"
        ? localStorage.getItem("userPhone")
        : null;
    const relLS =
      localStorage.getItem("userRole") === "guardian"
        ? localStorage.getItem("guardianRelation")
        : null;

    setName(nameLS || baseName);
    setEmail(emailLS || baseEmail);
    setRelation(relLS || DEFAULT_GUARDIAN.relation);
    setPhone(phoneLS || DEFAULT_GUARDIAN.phone);

    // 3) 연결 환자/병원/케어팀(별도 키라 충돌 없음)
    const lp = localStorage.getItem("linkedPatientId") || DEFAULT_PATIENT.pid;
    const lpn =
      localStorage.getItem("linkedPatientName") || DEFAULT_PATIENT.name;
    const h = localStorage.getItem("hospitalName") || DEFAULT_PATIENT.hospital;

    const dn =
      localStorage.getItem("doctorName") || DEFAULT_CARETEAM.doctor.name;
    const dd =
      localStorage.getItem("doctorDept") || DEFAULT_CARETEAM.doctor.dept;
    const dp =
      localStorage.getItem("doctorPhone") || DEFAULT_CARETEAM.doctor.phone;

    const nn = localStorage.getItem("nurseName") || DEFAULT_CARETEAM.nurse.name;
    const np =
      localStorage.getItem("nursePhone") || DEFAULT_CARETEAM.nurse.phone;

    const cn =
      localStorage.getItem("caregiverName") || DEFAULT_CARETEAM.caregiver.name;
    const ct =
      localStorage.getItem("caregiverTeam") || DEFAULT_CARETEAM.caregiver.team;
    const cp =
      localStorage.getItem("caregiverPhone") ||
      DEFAULT_CARETEAM.caregiver.phone;

    setPid(lp);
    setPname(lpn);
    setHospital(h);
    setDocName(dn);
    setDocDept(dd);
    setDocPhone(dp);
    setNurseName(nn);
    setNursePhone(np);
    setCgName(cn);
    setCgTeam(ct);
    setCgPhone(cp);

    // 4) 가입/동의 일시
    let jd = localStorage.getItem("joinDate");
    if (!jd) {
      jd = new Date().toISOString();
      localStorage.setItem("joinDate", jd);
    }
    setJoinDate(jd);
    let cd = localStorage.getItem("consentDate");
    if (!cd) {
      cd = jd;
      localStorage.setItem("consentDate", cd);
    }
    setConsentDate(cd);
  }, [mounted]);

  const initial = useMemo(
    () => (name?.trim() ? name.trim().charAt(0) : "보").toUpperCase(),
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
    if (!confirm("정말로 회원 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다."))
      return;
    localStorage.clear();
    alert("회원 탈퇴가 완료되었습니다.");
    router.push("/signup");
  }

  // 연결 환자 변경 요청
  const openReq = () => {
    setReqPid(pid);
    setReqPname(pname);
    setReqRelation(relation);
    setReqSubmitted(false);
    setOpenChangeReq(true);
  };
  const submitReq = () => {
    if (!reqPid.trim() || !reqPname.trim() || !reqRelation.trim()) {
      alert("모든 항목을 입력해주세요.");
      return;
    }
    setReqSubmitted(true);
  };

  return (
    <main className="wrap">
      {/* 헤더 */}
      <section className="head">
        <h1>내 프로필</h1>
        <p className="muted">
          보호자 정보와 연결 환자, 케어팀 정보를 확인합니다.
        </p>
      </section>

      {/* 상단 요약(보호자 본인만 강조) */}
      <section className="top">
        <article className="card hero">
          <div className="avatar" aria-hidden>
            {initial}
          </div>

          <div className="info">
            <div className="line1">
              <strong className="uname">{name}</strong>
              <span className="badge guardian">{roleLabel}</span>
            </div>

            <div className="line2">
              <span className="id">
                관계&nbsp;<b>{relation}</b>
              </span>
              <span className="sep">·</span>
              <span className="email">{email}</span>
              {phone && (
                <>
                  <span className="sep">·</span>
                  <span className="email">{phone}</span>
                </>
              )}
            </div>

            <div className="line3">
              <span>
                가입일시&nbsp;<b>{fmt(joinDate)}</b>
              </span>
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
            <button className="pill" onClick={saveEditable}>
              저장
            </button>
          </div>
        </article>
      </section>

      {/* 본문: 좌 우 그리드 */}
      <section className="grid">
        {/* 좌측: 연결 환자(보호자와 분리 강조) */}
        <article className="card ro">
          <h3>연결 환자</h3>
          <div className="row two">
            <div>
              <label>환자 이름</label>
              <input value={pname} disabled />
            </div>
            <div>
              <label>환자 번호</label>
              <input value={pid} disabled />
            </div>
          </div>
          <div className="row">
            <label>연계 병원</label>
            <input value={hospital} disabled />
          </div>
          <div className="form-actions">
            <button
              className="pill ghost"
              onClick={() => router.push(`/dashboard/guardian/patient/${pid}`)}>
              환자 상태 상세
            </button>
            <button className="pill primary" onClick={openReq}>
              연결 환자 변경 요청
            </button>
          </div>
        </article>

        {/* 우측: 연락/메모 */}
        <article className="card form">
          <h3>연락 및 메모</h3>
          <div className="row">
            <label>전화번호</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010-0000-0000"
            />
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
            <button
              className="pill ghost"
              onClick={() => window.history.back()}>
              취소
            </button>
            <button className="pill" onClick={saveEditable}>
              저장하기
            </button>
          </div>
        </article>

        {/* 전체 폭: 케어팀 */}
        <article className="card ro full">
          <h3>케어팀</h3>
          <div className="kt">
            <div className="krow">
              <div className="krole">주치의</div>
              <div className="kval">
                <b>{docName}</b>
                <span className="sep">·</span>
                <span>{docDept}</span>
                <div className="kphone">{docPhone}</div>
              </div>
            </div>
            <div className="krow">
              <div className="krole">간호사</div>
              <div className="kval">
                <b>{nurseName}</b>
                <div className="kphone">{nursePhone}</div>
              </div>
            </div>
            <div className="krow">
              <div className="krole">요양사</div>
              <div className="kval">
                <b>{cgName}</b>
                <span className="sep">·</span>
                <span>{cgTeam}</span>
                <div className="kphone">{cgPhone}</div>
              </div>
            </div>
          </div>
        </article>
      </section>

      {/* 바닥: 로그아웃/탈퇴 */}
      <section className="bottom">
        <div className="sepbar" />
        <div className="bottom-actions">
          <button className="pill ghost" onClick={doLogout}>
            로그아웃
          </button>
          <button
            className="pill danger"
            onClick={doDelete}
            title="되돌릴 수 없습니다">
            회원탈퇴
          </button>
        </div>
      </section>

      {/* 중앙 팝업: 연결 환자 변경 요청 */}
      {openChangeReq && (
        <div
          className="modal"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpenChangeReq(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <header className="mhead">
              <strong>
                {reqSubmitted ? "요청 완료" : "연결 환자 변경 요청"}
              </strong>
              <button
                className="x"
                onClick={() => setOpenChangeReq(false)}
                aria-label="닫기">
                ✕
              </button>
            </header>

            <div className="mbody">
              {!reqSubmitted ? (
                <>
                  <div className="row two">
                    <div>
                      <label>환자 이름</label>
                      <input
                        value={reqPname}
                        onChange={(e) => setReqPname(e.target.value)}
                        placeholder="예) 홍길동"
                      />
                    </div>
                    <div>
                      <label>환자 번호</label>
                      <input
                        value={reqPid}
                        onChange={(e) => setReqPid(e.target.value)}
                        placeholder="예) p001"
                      />
                    </div>
                  </div>
                  <div className="row">
                    <label>관계</label>
                    <input
                      value={reqRelation}
                      onChange={(e) => setReqRelation(e.target.value)}
                      placeholder="예) 자녀"
                    />
                  </div>
                  <div className="hint">
                    제출 시 관리자가 확인 후 반영합니다.
                  </div>
                </>
              ) : (
                <div className="okbox">
                  <div className="ok-emoji" aria-hidden>
                    ✅
                  </div>
                  <div className="ok-title">관리자에게 접수되었습니다</div>
                  <div className="ok-desc">
                    확인 후 반영되며, 필요시 연락을 드립니다.
                  </div>
                </div>
              )}
            </div>

            <footer className="mfoot">
              {!reqSubmitted ? (
                <>
                  <button
                    className="pill ghost"
                    onClick={() => setOpenChangeReq(false)}>
                    취소
                  </button>
                  <button className="pill primary" onClick={submitReq}>
                    요청 제출
                  </button>
                </>
              ) : (
                <button
                  className="pill primary"
                  onClick={() => setOpenChangeReq(false)}>
                  확인
                </button>
              )}
            </footer>
          </div>
        </div>
      )}

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
          background: radial-gradient(
            100% 100% at 30% 20%,
            #e7efff 0%,
            #dce8ff 100%
          );
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
        .pill.primary {
          background: #2f6fe4;
          border-color: #2f6fe4;
          color: #fff;
        }

        .grid {
          margin-top: 14px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .full {
          grid-column: 1 / -1;
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
        .form-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .kt {
          display: grid;
          gap: 10px;
        }
        .krow {
          display: grid;
          grid-template-columns: 72px 1fr;
          gap: 10px;
          align-items: start;
        }
        .krole {
          font-size: 12px;
          color: #6b7fb0;
          font-weight: 800;
        }
        .kval {
          color: #0b1b33;
          font-weight: 800;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .kphone {
          color: #2a4d8f;
          font-weight: 900;
          letter-spacing: 0.2px;
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

        /* 중앙 모달 */
        .modal {
          position: fixed;
          inset: 0;
          background: rgba(10, 20, 40, 0.28);
          backdrop-filter: blur(2px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          padding: 12px;
        }
        .sheet {
          width: min(92vw, 520px);
          background: #fff;
          border-radius: 16px;
          border: 1px solid #e1e9ff;
          box-shadow: 0 20px 40px rgba(21, 44, 84, 0.18);
          overflow: hidden;
          display: grid;
          grid-template-rows: auto 1fr auto;
          max-height: 80vh;
        }
        .mhead {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          border-bottom: 1px solid #eef3fb;
        }
        .x {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          border: 1px solid #e1e9ff;
          background: #fff;
        }
        .mbody {
          padding: 12px;
          display: grid;
          gap: 10px;
          overflow: auto;
        }
        .mfoot {
          padding: 10px 12px;
          border-top: 1px solid #eef3fb;
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }
        .hint {
          color: #6b7aa8;
          font-size: 12px;
        }

        .okbox {
          display: grid;
          place-items: center;
          gap: 6px;
          padding: 16px 6px;
          text-align: center;
        }
        .ok-emoji {
          font-size: 40px;
          line-height: 1;
        }
        .ok-title {
          font-weight: 900;
          color: #10224d;
        }
        .ok-desc {
          color: #475569;
        }
      `}</style>
    </main>
  );
}
