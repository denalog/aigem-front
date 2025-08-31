// src/pages/dashboard/guardian.tsx
import { useRouter } from "next/router";
import { useMemo, useState } from "react";

type Status = "정상" | "주의" | "위험";

// 고정 환자/케어팀 정보 (여기만 바꾸면 전체 반영)
const PATIENT = {
  pid: "p001",
  name: "김복순",
  age: 87,
  status: "정상" as Status,
  lastAlert: "3시간 전 압력 이상 감지 (해결됨)",
  reassure: "현재 환자 상태는 안정적입니다. 걱정 마세요.",
};

const CARETEAM = {
  hospital: { name: "AIGEM 요양병원", phone: "02-000-0000", site: "https://aigem-hospital.example" },
  doctor:   { role: "의사",   name: "김민준", phone: "010-5555-1234", dept: "내과" },
  nurse:    { role: "간호사", name: "박소연", phone: "010-2222-3333" },
  caregiver:{ role: "요양사", name: "최은정", phone: "010-4444-7777" }, // ← 통일
  guardian: { role: "보호자", name: "이상훈", phone: "010-1234-5678", relation: "자녀" },
};

const tone = (s: Status) => (s === "정상" ? "ok" : s === "주의" ? "warn" : "danger");

export default function GuardianDashboard() {
  const router = useRouter();

  // 문의/전화 모달
  const [openMsg, setOpenMsg] = useState(false);
  const [openCall, setOpenCall] = useState(false);
  type MsgTarget = "doctor" | "nurse" | "caregiver"; // 본인 제거
  type CallTarget = "hospital" | "doctor" | "nurse" | "caregiver"; // 본인 제거

  const [msgTo, setMsgTo] = useState<MsgTarget>("doctor");
  const [msgBody, setMsgBody] = useState("");
  const [callTo, setCallTo] = useState<CallTarget>("doctor");

  const statusClass = useMemo(() => tone(PATIENT.status), []);

  const startCall = () => {
    const map = {
      hospital: CARETEAM.hospital.phone,
      doctor: CARETEAM.doctor.phone,
      nurse: CARETEAM.nurse.phone,
      caregiver: CARETEAM.caregiver.phone,
    } as const;
    const num = map[callTo].replaceAll("-", "");
    window.location.href = `tel:${num}`;
    setOpenCall(false);
  };

  const submitMsg = () => {
    if (!msgBody.trim()) return;
    alert(`[데모] ${labelOf(msgTo)}에게 문의 전송:\n"${msgBody.trim()}"`);
    setMsgBody("");
    setOpenMsg(false);
  };

  const labelOf = (k: MsgTarget | CallTarget | "hospital") =>
    k === "doctor"   ? `의사 ${CARETEAM.doctor.name}` :
    k === "nurse"    ? `간호사 ${CARETEAM.nurse.name}` :
    k === "caregiver"? `요양사 ${CARETEAM.caregiver.name}` :
                       `${CARETEAM.hospital.name} 대표`;

  return (
    <main className="page">
      <div className="wrap">
        <header className="pageHead">
          <div>
            <h1>보호자 대시보드</h1>
            <div className="desc">
              {CARETEAM.guardian.name} ({CARETEAM.guardian.relation})
              <span className="sep">·</span>
              연결 환자 <b>{PATIENT.name}</b>
              <span className="code">#{PATIENT.pid}</span>
            </div>
          </div>
          <div className="live"><span className="dot ok glow" /> 실시간 연결</div>
        </header>

        {/* 환자 카드 */}
        <section className="card">
          <div className="patientTop">
            <div className="who">
              <h2 className="pname">
                {PATIENT.name}
                <span className="age"> · 만 {PATIENT.age}세</span>
              </h2>
              <span className={`badge ${statusClass}`}>
                <i className={`dot ${statusClass}`} /> {PATIENT.status}
              </span>
            </div>
            <div className="subrow">
              <span className="codePill">#{PATIENT.pid}</span>
              <span className="last">{PATIENT.lastAlert}</span>
            </div>
          </div>

          <div className={`reassure ${statusClass}`}>{PATIENT.reassure}</div>

          <div className="btns">
            <button className="ghost" onClick={() => router.push(`/dashboard/guardian/patient/${PATIENT.pid}`)}>
              상태 상세보기
            </button>
            <button className="primary" onClick={() => setOpenMsg(true)}>문의하기</button>
            <button className="soft" onClick={() => setOpenCall(true)}>전화하기</button>
          </div>
        </section>

        {/* 담당의사 카드 */}
        <section className="card doctorCard">
          <div className="title">담당 주치의</div>
          <div className="docRow">
            <div className="docMeta">
              <strong>{CARETEAM.doctor.name}</strong>
              <span className="sep">·</span>
              <span>{CARETEAM.hospital.name} {CARETEAM.doctor.dept}</span>
              <span className="sep">·</span>
              <span className="phone">{CARETEAM.doctor.phone}</span>
            </div>
            <div className="docActions">
              <button className="iconbtn" onClick={() => setOpenCall(true)} aria-label="전화">📞</button>
            </div>
          </div>
          <div className="site">
            병원 사이트&nbsp;
            <a href={CARETEAM.hospital.site} target="_blank" rel="noreferrer">
              {CARETEAM.hospital.site}
            </a>
          </div>
        </section>
      </div>

      {/* 문의 모달 */}
      {openMsg && (
        <div className="modal" role="dialog" aria-modal="true" onClick={() => setOpenMsg(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <header className="mhead">
              <strong>문의 보내기</strong>
              <button className="x" onClick={() => setOpenMsg(false)} aria-label="닫기">✕</button>
            </header>
            <div className="mbody">
              <label className="mlabel">대상 선택</label>
              <div className="targets">
                {(["doctor","nurse","caregiver"] as MsgTarget[]).map((k) => (
                  <label key={k} className={`chip ${msgTo === k ? "on" : ""}`}>
                    <input type="radio" name="msgTo" value={k} checked={msgTo===k} onChange={() => setMsgTo(k)} />
                    {labelOf(k)}
                  </label>
                ))}
              </div>

              <label className="mlabel" htmlFor="msg">내용 (50자 내외)</label>
              <textarea id="msg" rows={4} maxLength={50} placeholder="문의 내용을 입력해 주세요."
                        value={msgBody} onChange={(e)=>setMsgBody(e.target.value.slice(0,50))}/>
            </div>
            <footer className="mfoot">
              <button className="ghost" onClick={() => setOpenMsg(false)}>취소</button>
              <button className="primary" onClick={submitMsg}>전송</button>
            </footer>
          </div>
        </div>
      )}

      {/* 전화 모달 */}
      {openCall && (
        <div className="modal" role="dialog" aria-modal="true" onClick={() => setOpenCall(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <header className="mhead">
              <strong>전화하기</strong>
              <button className="x" onClick={() => setOpenCall(false)} aria-label="닫기">✕</button>
            </header>
            <div className="mbody">
              <label className="mlabel">대상 선택</label>
              <div className="targets">
                {(["hospital","doctor","nurse","caregiver"] as CallTarget[]).map((k) => (
                  <label key={k} className={`chip ${callTo === k ? "on" : ""}`}>
                    <input type="radio" name="callTo" value={k} checked={callTo===k} onChange={()=>setCallTo(k)} />
                    {labelOf(k)}
                  </label>
                ))}
              </div>
              <div className="confirmBox">
                <div className="q">아래 번호로 전화하시겠습니까?</div>
                <div className="num">
                  {{
                    hospital: CARETEAM.hospital.phone,
                    doctor: CARETEAM.doctor.phone,
                    nurse: CARETEAM.nurse.phone,
                    caregiver: CARETEAM.caregiver.phone,
                  }[callTo]}
                </div>
              </div>
            </div>
            <footer className="mfoot">
              <button className="ghost" onClick={() => setOpenCall(false)}>취소</button>
              <button className="primary" onClick={startCall}>전화하기</button>
            </footer>
          </div>
        </div>
      )}

      {/* 스타일 (동일) */}
      <style jsx>{`
        :global(html, body){ background:#f6f9ff; }
        .page{ min-height:100vh; padding:16px; display:flex; justify-content:center; }
        .wrap{ width:100%; max-width:720px; }
        .pageHead{ display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
        h1{ margin:0; font-size:20px; font-weight:900; color:#0b1b33; }
        .desc{ color:#2a4d8f; font-weight:800; font-size:13px; }
        .desc .sep{ color:#9ab0e6; margin:0 6px; }
        .desc .code{ margin-left:6px; font-size:12px; color:#6b7fb0; border:1px solid #e1e9ff; padding:1px 8px; border-radius:999px; background:#fff; }
        .live{ display:inline-flex; align-items:center; gap:6px; color:#2a4d8f; font-weight:800; font-size:12px; }
        .dot{ width:8px; height:8px; border-radius:999px; display:inline-block; }
        .ok{ background:#22c55e; } .warn{ background:#f59e0b; } .danger{ background:#ef4444; animation:pulse 1.2s ease-in-out infinite; }
        .glow{ box-shadow:0 0 8px rgba(34,197,94,.5); }
        @keyframes pulse{ 0%{transform:scale(1); box-shadow:0 0 10px rgba(239,68,68,.35);} 50%{transform:scale(1.07); box-shadow:0 0 16px rgba(239,68,68,.55);} 100%{transform:scale(1); box-shadow:0 0 10px rgba(239,68,68,.35);} }

        .card{ background:linear-gradient(180deg,#f7faff 0%,#ffffff 100%); border:1px solid #e1e9ff; border-radius:18px; box-shadow:0 16px 40px rgba(21,44,84,.12); padding:14px; margin-bottom:12px; }
        .patientTop{ border:1px solid #e1e9ff; border-radius:14px; background:#fff; box-shadow:0 6px 14px rgba(21,44,84,.06); padding:12px; }
        .who{ display:flex; align-items:center; gap:10px; justify-content:space-between; flex-wrap:wrap; }
        .pname{ margin:0; font-size:20px; font-weight:900; color:#0b1b33; }
        .age{ font-size:14px; color:#6b7fb0; font-weight:800; }
        .badge{ height:26px; padding:0 10px; border-radius:999px; border:1px solid #e1e9ff; display:inline-flex; align-items:center; gap:6px; font-weight:800; font-size:12px; background:#fff; }
        .badge.ok{ color:#047857; border-color:#bbf7d0; background:#ecfdf5; }
        .badge.warn{ color:#b45309; border-color:#fed7aa; background:#fff7ed; }
        .badge.danger{ color:#b91c1c; border-color:#fecaca; background:#fef2f2; }
        .subrow{ display:flex; align-items:center; gap:8px; margin-top:6px; flex-wrap:wrap; }
        .codePill{ border:1px solid #cfe0ff; background:#fff; padding:4px 10px; border-radius:999px; font-weight:900; color:#2a4d8f; font-size:12px; }
        .last{ font-size:13px; color:#334155; font-weight:700; }
        .reassure{ margin-top:10px; border-radius:14px; padding:12px; border:1px solid #e1e9ff; font-weight:800; font-size:14px; }
        .reassure.ok{ background:#ecfdf5; border-color:#bbf7d0; color:#065f46; }
        .reassure.warn{ background:#fff7ed; border-color:#fed7aa; color:#9a3412; }
        .reassure.danger{ background:#fef2f2; border-color:#fecaca; color:#7f1d1d; }
        .btns{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-top:10px; }
        .ghost,.primary,.soft{ height:36px; border-radius:10px; font-weight:900; box-shadow:0 2px 8px rgba(21,44,84,.06); }
        .ghost{ border:1px solid #e1e9ff; background:#fff; color:#0b1b33; }
        .primary{ border:1px solid #2f6fe4; background:#2f6fe4; color:#fff; }
        .soft{ border:1px solid #e1e9ff; background:#fff; color:#1e3a8a; }

        .doctorCard .title{ font-size:12px; color:#6b7fb0; font-weight:800; margin-bottom:6px; }
        .docRow{ display:grid; grid-template-columns:1fr auto; gap:8px; align-items:center; }
        .docMeta{ display:flex; align-items:center; gap:6px; flex-wrap:wrap; color:#0b1b33; font-weight:800; }
        .docMeta .phone{ color:#2a4d8f; }
        .docActions{ display:flex; gap:6px; }
        .iconbtn{ width:34px; height:34px; border-radius:10px; border:1px solid #e1e9ff; background:#fff; box-shadow:0 2px 8px rgba(21,44,84,.06); font-size:16px; }
        .site{ margin-top:10px; padding:10px 12px; border-radius:12px; border:1px solid #eef3fb; background:#f9fbff; color:#5b6c94; font-size:12px; display:flex; align-items:center; gap:6px; }
        .site a{ color:#2f6fe4; font-weight:800; text-decoration:none; }
        
        .modal{ position:fixed; inset:0; background:rgba(10,20,40,.28); backdrop-filter:blur(2px); display:flex; align-items:center; justify-content:center; z-index:50; padding:12px; }
        .sheet{ width:min(92vw,520px); background:#fff; border-radius:16px; border:1px solid #e1e9ff; box-shadow:0 20px 40px rgba(21,44,84,.18); overflow:hidden; display:grid; grid-template-rows:auto 1fr auto; }
        .mhead{ display:flex; align-items:center; justify-content:space-between; padding:10px 12px; border-bottom:1px solid #eef3fb; }
        .x{ width:32px; height:32px; border-radius:10px; border:1px solid #e1e9ff; background:#fff; }
        .mbody{ padding:12px; display:grid; gap:10px; }
        .mlabel{ font-size:12px; color:#2a4d8f; font-weight:900; }
        .targets{ display:flex; gap:8px; flex-wrap:wrap; }
        .chip{ display:inline-flex; align-items:center; gap:6px; padding:6px 10px; border-radius:999px; border:1px solid #e1e9ff; background:#fff; color:#0b1b33; font-weight:800; font-size:12px; cursor:pointer; user-select:none; }
        .chip input{ display:none; }
        .chip.on{ border-color:#2f6fe4; box-shadow:0 6px 14px rgba(21,44,84,.12); }
        textarea{ width:100%; resize:none; border-radius:12px; border:1px solid #e1e9ff; padding:10px; font-size:14px; background:#fff; box-shadow:0 2px 10px rgba(21,44,84,.06); }
        .confirmBox{ border:1px solid #eef3fb; background:#f9fbff; border-radius:12px; padding:12px; display:grid; gap:6px; }
        .confirmBox .q{ color:#0f1e3e; font-weight:800; }
        .confirmBox .num{ color:#2a4d8f; font-weight:900; letter-spacing:.2px; }
        .mfoot{ padding:10px 12px; border-top:1px solid #eef3fb; display:flex; justify-content:flex-end; gap:8px; }
      `}</style>
    </main>
  );
}
