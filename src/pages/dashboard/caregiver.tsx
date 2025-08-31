// src/pages/dashboard/caregiver.tsx
import { useRouter } from "next/router";
import { useMemo, useState } from "react";

type Status = "안정" | "주의" | "위험";
type TaskType = "bed" | "call" | "turn";

interface Contact {
  label: string;
  name?: string;
  phone: string;
}
interface Patient {
  id: number;
  pid: string;
  name: string;
  age: number;
  room: string;
  status: Status;
  lastNote: string;
  task: TaskType;
  taskText: string;
}

const CONTACTS: Contact[] = [
  { label: "병원", phone: "02-123-4567" },
  { label: "의사", name: "김민준", phone: "010-5555-1234" },
  { label: "간호사", name: "박소연", phone: "010-3333-4444" },
  { label: "보호자", name: "이상훈", phone: "010-1234-5678" },
];

const ASSIGNED: Patient[] = [
  { id: 1, pid: "p001", name: "김복순", age: 87, room: "A-305호", status: "안정", lastNote: "3시간 전 압력 이상 감지 (해결됨)", task: "bed",  taskText: "배드를 갈아줄 시간입니다." },
  { id: 2, pid: "p003", name: "오순자", age: 85, room: "A-204호", status: "주의", lastNote: "30분 전 호출 버튼 눌림",         task: "call", taskText: "환자의 호출 메시지가 있습니다." },
  { id: 3, pid: "p005", name: "남상길", age: 79, room: "B-102호", status: "안정", lastNote: "2시간 전 체위 변경 필요 알림",     task: "turn", taskText: "체위 변경 권장 시간입니다." },
];

const tone = (s: Status) => (s === "안정" ? "ok" : s === "주의" ? "warn" : "danger");

export default function CaregiverDashboard() {
  const router = useRouter();

  const [callPid, setCallPid] = useState<string | null>(null);
  const [msgPid, setMsgPid] = useState<string | null>(null);
  const [msgTarget, setMsgTarget] = useState<string>("의사");
  const [msgText, setMsgText] = useState<string>("");

  const patients = useMemo(() => ASSIGNED, []);

  const tel = (num: string) => window.location.replace(`tel:${num.replaceAll("-", "")}`);
  const openDetail = (pid: string) => router.push(`/dashboard/caregiver/patient/${pid}`);

  const submitMessage = () => {
    const v = msgText.trim();
    if (!v) return alert("메시지를 입력해주세요.");
    if (v.length > 50) return alert("메시지는 50자 이내로 입력해주세요.");
    alert(`[전송 완료]\n대상: ${msgTarget}\n내용: ${v}`);
    setMsgText("");
    setMsgPid(null);
  };

  return (
    <main className="page">
      <div className="wrap">
        <div className="pageHead">
          <div>
            <h1>요양사 대시보드</h1>
            <div className="sub">
              최은정 <span className="muted">(요양사)</span>
            </div>
          </div>
          <div className="live"><span className="dot ok glow" /> 실시간 연결</div>
        </div>

        <div className="list">
          {patients.map((p) => (
            <section key={p.id} className="card" aria-label={`${p.name} 카드`}>
              <header className="header">
                <div className="top">
                  <div className="name">
                    <span className="pill">{p.name}</span>
                    <span className="age">만 {p.age}세</span>
                    <span className="room">{p.room}</span>
                  </div>
                  <span className={`badge ${tone(p.status)}`}>
                    <i className={`dot ${tone(p.status)}`} />
                    {p.status}
                  </span>
                </div>
                <div className="note">{p.lastNote}</div>
              </header>

              <div className={`task ${p.task}`}>
                <i className="ico" aria-hidden />
                <span>{p.taskText}</span>
              </div>

              <div className="btns">
                <button className="ghost" onClick={() => openDetail(p.pid)}>상세보기</button>
                <button className="primary" onClick={() => setMsgPid(p.pid)}>응답하기</button>
                <button className="soft" onClick={() => setCallPid(p.pid)}>전화하기</button>
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* 전화하기 모달 */}
      {callPid && (
        <div className="modal" role="dialog" aria-modal="true" onClick={() => setCallPid(null)}>
          <div className="panel" onClick={(e) => e.stopPropagation()}>
            <div className="mhead">
              <strong>전화하기</strong>
              <button className="x" onClick={() => setCallPid(null)} aria-label="닫기">✕</button>
            </div>
            <div className="mbody">
              <ul className="callList">
                {CONTACTS.map((c, i) => (
                  <li key={i} className="callItem">
                    <div className="ci-left">
                      <div className="ci-label">{c.label}</div>
                      <div className="ci-name">{c.name}</div>
                      <div className="ci-phone">{c.phone}</div>
                    </div>
                    <button className="dial" onClick={() => tel(c.phone)} aria-label={`${c.label}에게 전화`}>통화</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 응답하기(문의) 모달 */}
      {msgPid && (
        <div className="modal" role="dialog" aria-modal="true" onClick={() => setMsgPid(null)}>
          <div className="panel" onClick={(e) => e.stopPropagation()}>
            <div className="mhead">
              <strong>응답하기</strong>
              <button className="x" onClick={() => setMsgPid(null)} aria-label="닫기">✕</button>
            </div>
            <div className="mbody">
              <div className="field">
                <label className="label">대상 선택</label>
                <div className="targets">
                  {["의사", "간호사", "보호자"].map((t) => (
                    <button
                      key={t}
                      className={`tbtn ${msgTarget === t ? "on" : ""}`}
                      onClick={() => setMsgTarget(t)}
                    >{t}</button>
                  ))}
                </div>
              </div>
              <div className="field">
                <label className="label">메시지 (최대 50자)</label>
                <textarea
                  rows={4}
                  maxLength={50}
                  placeholder="메시지를 입력해주세요 (예: 호출 확인 후 5분 내 방문 예정)"
                  value={msgText}
                  onChange={(e) => setMsgText(e.target.value)}
                />
              </div>
              <div className="actions">
                <button className="ghost" onClick={() => setMsgPid(null)}>취소</button>
                <button className="primary" onClick={submitMessage}>전송</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        /* ✅ 구역 배경 제거: 전역 배경만 사용 */
        .page{
          min-height:100vh;
          padding:24px 16px;
          display:flex; justify-content:center;
        }
        .wrap{ width:100%; max-width:760px; }
        .pageHead{ display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
        h1{ margin:0; font-size:20px; font-weight:900; color:#0b1b33; }
        .sub{ margin-top:2px; color:#1f2b48; font-weight:800; }
        .muted{ color:#6b7aa8; }
        .live{ display:flex; align-items:center; gap:6px; color:#2a4d8f; font-weight:800; font-size:12px; }
        .dot{ width:8px; height:8px; border-radius:999px; display:inline-block; }
        .ok{ background:#22c55e; } .warn{ background:#f59e0b; } .danger{ background:#ef4444; }
        .glow{ box-shadow:0 0 8px rgba(34,197,94,.5); }

        .list{ display:grid; gap:14px; }

        /* ✅ 카드 그라데이션 제거 */
        .card{
          background:#fff;
          border:1px solid #e1e9ff; border-radius:18px;
          box-shadow:0 16px 40px rgba(21,44,84,.12);
          padding:16px;
        }

        .header{
          border:1px solid #e1e9ff; border-radius:14px; background:#fff;
          box-shadow:0 6px 14px rgba(21,44,84,.06);
          padding:12px; display:grid; gap:8px;
        }
        .top{ display:flex; align-items:center; gap:8px; justify-content:space-between; }
        .name{ display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
        .pill{
          border:1px solid #cfe0ff; background:#fff;
          padding:4px 10px; border-radius:999px; font-weight:900; color:#2a4d8f; font-size:13px;
        }
        .age{ font-size:12px; color:#6b7aa8; font-weight:800; }
        .room{ font-size:12px; color:#4a5d87; font-weight:800; }

        /* 🔻 상태 배지(안정/주의/위험) — 작게 & 촘촘하게 */
        .badge{
          height:20px;                 /* 22px → 20px */
          padding:0 8px;               /* 0 10px → 0 8px */
          border-radius:999px; border:1px solid #e1e9ff;
          display:inline-flex; align-items:center; gap:6px;
          font-weight:800; font-size:11px; /* 12px → 11px */
          line-height:1;                /* 줄간격 축소로 깔끔 */
          background:#fff;
          white-space:nowrap;
        }
        .badge .dot{ width:6px; height:6px; } /* 배지 안 점도 살짝 축소 */

        .badge.ok{ color:#047857; border-color:#bbf7d0; background:#ecfdf5; }
        .badge.warn{ color:#b45309; border-color:#fed7aa; background:#fff7ed; }
        .badge.danger{ color:#b91c1c; border-color:#fecaca; background:#fef2f2; }

        /* 아주 작은 화면에서 한 단계 더 축소 */
        @media (max-width: 380px){
          .badge{ font-size:10px; height:18px; padding:0 7px; gap:5px; }
          .badge .dot{ width:5px; height:5px; }
        }

        .note{ font-size:13px; color:#334155; font-weight:700; padding-top:2px; }

        /* 업무 배너 (가독성 유지) */
        .task{
          margin-top:10px; border-radius:14px; padding:12px; font-weight:900;
          display:flex; align-items:center; gap:10px; border:1px solid #e1e9ff;
        }
        .task .ico{ width:16px; height:16px; border-radius:4px; background:#aab7ff; }
        .task.bed{ background:#eef2ff; border-color:#c7d2fe; }
        .task.bed .ico{ background:#818cf8; }
        .task.call{ background:#fff1f2; border-color:#fecdd3; }
        .task.call .ico{ background:#fb7185; }
        .task.turn{ background:#ecfdf5; border-color:#bbf7d0; }
        .task.turn .ico{ background:#34d399; }

        .btns{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-top:10px; }
        .ghost{
          height:36px; border-radius:10px; border:1px solid #e1e9ff; background:#fff; color:#0b1b33; font-weight:900;
          box-shadow:0 2px 8px rgba(21,44,84,.06);
        }
        .primary{
          height:36px; border-radius:10px; border:1px solid #2f6fe4; background:#2f6fe4; color:#fff; font-weight:900;
          box-shadow:0 2px 8px rgba(21,44,84,.06);
        }
        .soft{
          height:36px; border-radius:10px; border:1px solid #dbe7ff; background:#fff; color:#1f2b48; font-weight:900;
          box-shadow:0 2px 8px rgba(21,44,84,.06);
        }

        .modal{ position:fixed; inset:0; background:rgba(10,20,40,.28); backdrop-filter:blur(2px);
          display:flex; align-items:center; justify-content:center; z-index:40; }
        .panel{ width:min(92vw,720px); max-height:80vh; overflow:auto; background:#fff; border-radius:16px;
          border:1px solid #e1e9ff; box-shadow:0 20px 40px rgba(21,44,84,.18); }
        .mhead{ display:flex; align-items:center; justify-content:space-between; padding:10px 12px; border-bottom:1px solid #eef3fb; }
        .mbody{ padding:12px; }
        .x{ width:32px; height:32px; border-radius:10px; border:1px solid #e1e9ff; background:#fff; }

        .callList{ list-style:none; padding:0; margin:0; display:grid; gap:8px; }
        .callItem{ display:grid; grid-template-columns:1fr auto; gap:8px; align-items:center;
          padding:10px; border:1px solid #eef3fb; border-radius:12px; background:#fff; }
        .ci-label{ font-size:12px; color:#6b7fb0; font-weight:800; }
        .ci-name{ font-weight:900; color:#0b1b33; }
        .ci-phone{ color:#2a4d8f; font-weight:800; }
        .dial{ height:34px; border-radius:10px; border:1px solid #2f6fe4; background:#2f6fe4; color:#fff; font-weight:900; padding:0 12px; }

        .field{ display:flex; flex-direction:column; gap:6px; margin-bottom:10px; }
        .label{ font-size:12px; color:#6b7fb0; font-weight:800; }
        textarea{ width:100%; resize:none; border-radius:12px; border:1px solid #e1e9ff; padding:10px; font-size:14px; background:#fff;
          box-shadow:0 2px 10px rgba(21,44,84,.06); }
        .targets{ display:flex; gap:8px; flex-wrap:wrap; }
        .tbtn{ height:30px; padding:0 12px; border-radius:999px; border:1px solid #e1e9ff; background:#fff; font-weight:800; color:#0b1b33;
          box-shadow:0 2px 8px rgba(21,44,84,.06); }
        .tbtn.on{ background:#2f6fe4; border-color:#2f6fe4; color:#fff; }
        .actions{ display:flex; justify-content:flex-end; gap:8px; }
      `}</style>
    </main>
  );
}
