// src/components/alerthistory/guardian.tsx
import { useMemo, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/router";
import { createPortal } from "react-dom";

type Level = "정상" | "주의" | "위험";

interface AlertItem {
  id: number;
  name: string;
  pid: string;
  age: number;
  level: Level;
  message: string;
  time: string;
}
interface Contact { label: string; name?: string; phone: string; }

const PATIENT = {
  pid: "p001",
  name: "김복순",
  age: 87,
  lastAlert: "3시간 전 압력 이상 감지 (해결됨)",
  reassure: "현재 환자 상태는 안정적입니다. 걱정 마세요.",
};

const CARETEAM = {
  hospital: { name: "AIGEM 요양병원", phone: "02-000-0000" },
  doctor:   { role: "의사",   name: "김민준", phone: "010-5555-1234" },
  nurse:    { role: "간호사", name: "박소연", phone: "010-2222-3333" },
  caregiver:{ role: "요양사", name: "최은정", phone: "010-4444-7777" },
};

const CONTACTS: Contact[] = [
  { label: "병원", phone: CARETEAM.hospital.phone },
  { label: `의사 ${CARETEAM.doctor.name}`, phone: CARETEAM.doctor.phone },
  { label: `간호사 ${CARETEAM.nurse.name}`, phone: CARETEAM.nurse.phone },
  { label: `요양사 ${CARETEAM.caregiver.name}`, phone: CARETEAM.caregiver.phone },
];

const alerts: AlertItem[] = [
  { id: 1, name: PATIENT.name, pid: PATIENT.pid, age: PATIENT.age, level: "정상", message: PATIENT.reassure, time: "방금" },
  { id: 2, name: PATIENT.name, pid: PATIENT.pid, age: PATIENT.age, level: "정상", message: PATIENT.lastAlert, time: "3시간 전" },
];

const clsDot = (lv: Level) => ({ 정상: "ok", 주의: "warn", 위험: "danger" } as const)[lv];
const clsLvl = (lv: Level) => ({ 정상: "ok", 주의: "warn", 위험: "danger" } as const)[lv];

// 👉 간단 포털 컴포넌트
function Portal({ children }: { children: ReactNode }) {
  if (typeof window === "undefined") return null;
  return createPortal(children, document.body);
}

export default function GuardianAlertHistory() {
  const router = useRouter();
  const data = useMemo(() => alerts, []);
  const [openCall, setOpenCall] = useState(false);

  // 모달 열렸을 때 바디 스크롤 잠금
  useEffect(() => {
    if (!openCall) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [openCall]);

  const gotoDetail = () => router.push(`/dashboard/guardian/patient/${PATIENT.pid}`);
  const telHref = (num: string) => `tel:${num.replace(/[^0-9+]/g, "")}`;

  return (
    <div className="wrap">
      <div className="hint">
        <strong className="mr-1">보호자</strong>
        <span>연결된 환자의 최신 상태 알림과 안심 메시지를 확인하세요.</span>
        <span className="demo"> (데모)</span>
      </div>

      {/* 모바일 카드 */}
      <div className="list" role="list">
        {data.map((a) => (
          <div key={a.id} className="item" role="listitem">
            <div className="top">
              <span className={`dot ${clsDot(a.level)}`} aria-hidden />
              <span className="name">{a.name}</span>
              <span className="ageChip">만 {a.age}세</span>
              <span className="code">#{a.pid}</span>
              <span className={`lvl ${clsLvl(a.level)}`}>{a.level}</span>
            </div>
            <div className="msg">{a.message}</div>
            <div className="time">{a.time}</div>
            <div className="actions">
              <button className="btn" onClick={gotoDetail}>상세보기</button>
              <button className="btn primary" onClick={() => setOpenCall(true)}>전화</button>
            </div>
          </div>
        ))}
      </div>

      {/* 데스크톱 테이블 */}
      <div className="desk">
        <table className="tbl">
          <thead>
            <tr>
              <th>환자</th><th>나이</th><th>코드</th><th>상태</th><th>메시지</th><th>시간</th><th>액션</th>
            </tr>
          </thead>
          <tbody>
            {data.map((a) => (
              <tr key={a.id}>
                <td className="strong">{a.name}</td>
                <td className="nowrap">만 {a.age}세</td>
                <td>#{a.pid}</td>
                <td className="nowrap"><span className={`dot ${clsDot(a.level)}`} /> {a.level}</td>
                <td>{a.message}</td>
                <td className="muted">{a.time}</td>
                <td className="actions-td">
                  <button className="btn xs" onClick={gotoDetail}>상세</button>
                  <button className="btn xs primary" onClick={() => setOpenCall(true)}>전화</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 📞 전화 모달 — 포털로 body에 붙임 (중앙 정렬 보장) */}
      {openCall && (
        <Portal>
          <div className="agemModal" role="dialog" aria-modal="true" onClick={() => setOpenCall(false)}>
            <div className="panel" onClick={(e) => e.stopPropagation()}>
              <div className="mhead">
                <strong>전화하기</strong>
                <button className="x" aria-label="닫기" onClick={() => setOpenCall(false)}>✕</button>
              </div>
              <div className="mbody">
                <ul className="callList">
                  {CONTACTS.map((c, i) => (
                    <li key={i} className="callItem">
                      <div className="ci-left">
                        <div className="ci-label">{c.label}</div>
                        {c.name && <div className="ci-name">{c.name}</div>}
                        <div className="ci-phone">{c.phone}</div>
                      </div>
                      <a className="dial" href={telHref(c.phone)} aria-label={`${c.label}에게 전화`}>통화</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Portal>
      )}

      <style jsx>{`
        .wrap { padding: 8px 6px 12px; }
        .hint{ margin:0 2px 8px; font-size:12px; color:#475569; }
        .hint .demo{ color:#94a3b8; }

        .list{ display:flex; flex-direction:column; gap:10px; list-style:none; padding:0; margin:0; }
        .item{ border:none; border-radius:16px; background:linear-gradient(180deg,#f7faff 0%, #ffffff 100%); box-shadow:0 4px 12px rgba(21,44,84,.06); padding:12px; }
        .top{ display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
        .dot{ width:8px; height:8px; border-radius:999px; display:inline-block; box-shadow:0 0 0 2px #fff, 0 0 8px rgba(0,0,0,.06); }
        .dot.ok{ background:#22c55e; box-shadow:0 0 0 2px #fff, 0 0 8px rgba(34,197,94,.28); }
        .dot.warn{ background:#f59e0b; box-shadow:0 0 0 2px #fff, 0 0 8px rgba(245,158,11,.28); }
        .dot.danger{ background:#ef4444; box-shadow:0 0 0 2px #fff, 0 0 10px rgba(239,68,68,.4); }

        .name{ font-weight:800; color:#0b1b33; }
        .ageChip{ font-size:12px; font-weight:800; color:#3757a8; background:#eef4ff; border:1px solid #dbe7ff; border-radius:999px; padding:4px 8px; line-height:1; }
        .code{ font-size:12px; color:#6b7fb0; font-weight:800; border:1px solid #e1e9ff; background:#fff; padding:4px 8px; border-radius:999px; }
        .lvl{ margin-left:auto; display:inline-flex; align-items:center; gap:6px; font-weight:800; font-size:12px; padding:4px 10px; border-radius:999px; background:#fff; border:1px solid #e1e9ff; color:#0b1b33; }
        .lvl.ok{ background:#ecfdf5; border-color:#bbf7d0; color:#047857; }
        .lvl.warn{ background:#fff7ed; border-color:#fed7aa; color:#b45309; }
        .lvl.danger{ background:#fef2f2; border-color:#fecaca; color:#b91c1c; }
        .msg{ margin-top:6px; color:#475569; font-size:13px; }
        .time{ margin-top:4px; color:#64748b; font-size:12px; }
        .actions{ margin-top:10px; display:flex; gap:6px; flex-wrap:wrap; }
        .btn{ height:32px; padding:0 12px; border-radius:10px; border:1px solid #e1e9ff; background:#fff; font-weight:800; color:#0b1b33; box-shadow:0 2px 8px rgba(21,44,84,.06); }
        .btn.primary{ background:#2f6fe4; color:#fff; border-color:#2f6fe4; }
        .btn.xs{ height:28px; font-size:12px; padding:0 8px; border-radius:8px; }

        .desk{ display:none; }
        @media (min-width: 860px){ .list{ display:none; } .desk{ display:block; } }
        .tbl{ width:100%; border-collapse:separate; border-spacing:0; font-size:13px; }
        .tbl thead th{ text-align:left; padding:8px 10px; color:#475569; border-bottom:1px solid #eef3fb; background:#fff; }
        .tbl tbody td{ padding:9px 10px; border-bottom:1px solid #eef3fb; }
        .tbl .strong{ font-weight:800; color:#0b1b33; }
        .tbl .muted{ color:#64748b; }
        .tbl .nowrap{ white-space:nowrap; }
        .actions-td{ display:flex; gap:6px; flex-wrap:wrap; align-items:center; }

        /* 📞 콜 모달 — 포털 + 정중앙 */
        .agemModal{
          position:fixed; inset:0; z-index:9999;
          background:rgba(10,20,40,.34); backdrop-filter:blur(2px);
          display:flex; align-items:center; justify-content:center;
          padding:12px;
        }
        .agemModal .panel{
          width:min(92vw, 420px);
          border-radius:16px; border:1px solid #e1e9ff; background:#fff;
          box-shadow:0 20px 40px rgba(21,44,84,.18);
          max-height:80vh; overflow:auto;
        }
        .agemModal .mhead{
          display:flex; align-items:center; justify-content:space-between;
          padding:10px 12px; border-bottom:1px solid #eef3fb;
          position:sticky; top:0; background:#fff;
        }
        .agemModal .x{ width:32px; height:32px; border-radius:10px; border:1px solid #e1e9ff; background:#fff; }
        .agemModal .mbody{ padding:14px; }
        .callList{ list-style:none; padding:0; margin:0; display:grid; gap:8px; }
        .callItem{ display:grid; grid-template-columns:1fr auto; gap:8px; align-items:center; padding:10px; border:1px solid #eef3fb; border-radius:12px; background:#fff; }
        .ci-label{ font-size:12px; color:#6b7fb0; font-weight:800; }
        .ci-name{ font-weight:900; color:#0b1b33; }
        .ci-phone{ color:#2a4d8f; font-weight:800; }
        .dial{ height:34px; border-radius:10px; border:1px solid #2f6fe4; background:#2f6fe4; color:#fff; font-weight:900; padding:0 12px; display:inline-flex; align-items:center; }
      `}</style>
    </div>
  );
}
