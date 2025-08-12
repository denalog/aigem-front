// src/components/AlertHistory.tsx
import { useEffect, useMemo, useState } from "react";

type Role = "doctor" | "nurse" | "patient" | "guardian";
type Level = "정상" | "주의" | "위험";

interface AlertItem {
  id: number;
  patient: string;
  room?: string;
  message: string;
  level: Level;
  time: string;
  guardianName?: string;
  guardianPhone?: string;
  doctorPhone?: string;
  hospitalPhone?: string;
}

const demoAlerts: AlertItem[] = [
  {
    id: 1,
    patient: "김수현",
    room: "301호",
    message: "심박수 이상",
    level: "위험",
    time: "2분 전",
    guardianName: "김보호",
    guardianPhone: "010-1234-5678",
    doctorPhone: "010-9000-1111",
    hospitalPhone: "02-123-4567",
  },
  {
    id: 2,
    patient: "박철수",
    room: "302호",
    message: "혈압 상승",
    level: "주의",
    time: "10분 전",
    guardianName: "박보호",
    guardianPhone: "010-2222-3333",
    doctorPhone: "010-9000-2222",
    hospitalPhone: "02-987-6543",
  },
  {
    id: 3,
    patient: "이영희",
    room: "303호",
    message: "정상 범위 유지",
    level: "정상",
    time: "20분 전",
    guardianName: "이보호",
    guardianPhone: "010-5555-7777",
    doctorPhone: "010-9000-3333",
    hospitalPhone: "02-555-7777",
  },
];

/** 상태 점/칩 색상 클래스 */
const clsDot = (lv: Level) => ({ 정상: "ok", 주의: "warn", 위험: "danger" } as const)[lv];
const clsLvl = (lv: Level) => ({ 정상: "ok", 주의: "warn", 위험: "danger" } as const)[lv];

export default function AlertHistory() {
  const [role, setRole] = useState<Role>("doctor");

  useEffect(() => {
    try {
      const fromLS =
        (localStorage.getItem("role") as Role | null) ||
        (localStorage.getItem("userRole") as Role | null);
      if (fromLS && ["doctor", "nurse", "patient", "guardian"].includes(fromLS)) {
        setRole(fromLS as Role);
      }
    } catch {}
  }, []);

  const roleHelp: Record<Role, string> = {
    doctor: "환자 상태 변화 실시간 알림 • 보호자에게 바로 전화 가능합니다.",
    nurse: "환자(병실) 상태 변화 실시간 알림 • 상세보기로 확인하세요.",
    patient: "위험/주의 상태 즉시 알림 • 본인 상태만 표시됩니다.",
    guardian: "보호 대상 환자 위험 시 즉시 알림 • 문자 발송 및 연락처 제공.",
  };

  // 환자 화면: 본인 1건만, 이름 숨김
  const patientName =
    (typeof window !== "undefined" &&
      (localStorage.getItem("patientName") || localStorage.getItem("userName"))) ||
    "";

  const data = useMemo(() => {
    if (role === "patient") {
      const mine = demoAlerts.filter((a) => a.patient === patientName);
      return (mine.length ? mine : [demoAlerts[0]]).slice(0, 1);
    }
    if (role === "guardian") return demoAlerts;
    return demoAlerts; // doctor, nurse
  }, [role, patientName]);

  // 가짜 액션
  const call = (title: string, tel?: string) => alert(`(가짜) ${title}${tel ? `\n${tel}` : ""}`);
  const sms = (to?: string) => alert(`(가짜) 문자 발송\n${to || ""}`);
  const detail = (name: string) => alert(`(가짜) ${name} 상태 상세`);

  return (
    <div className="wrap">
      {/* 역할 토글 */}
      <div className="rolebar" aria-label="역할 선택">
        {(
          [
            ["doctor", "의사"],
            ["nurse", "간호사"],
            ["patient", "환자"],
            ["guardian", "보호자"],
          ] as [Role, string][]
        ).map(([k, t]) => (
          <button key={k} onClick={() => setRole(k)} className={`chip ${role === k ? "on" : ""}`}>
            {t}
          </button>
        ))}
      </div>

      {/* 안내 */}
      <div className="hint">
        <strong className="mr-1">
          {{ doctor: "의사", nurse: "간호사", patient: "환자", guardian: "보호자" }[role]}
        </strong>
        <span>{roleHelp[role]}</span>
        <span className="demo"> (데모)</span>
      </div>

      {/* 리스트(모바일 우선) */}
      <div className="list" role="list">
        {data.map((a) => (
          <div key={a.id} className="item" role="listitem">
            <div className="top">
              <span className={`dot ${clsDot(a.level)}`} aria-hidden />
              {role !== "patient" && <span className="name">{a.patient}</span>}
              {role === "nurse" && a.room && <span className="room">{a.room}</span>}
              <span className={`lvl ${clsLvl(a.level)}`}>{a.level}</span>
            </div>

            <div className="msg">{a.message}</div>
            <div className="time">{a.time}</div>

            <div className="actions">
              {role === "doctor" && (
                <>
                  <button className="btn primary" onClick={() => call("보호자 전화 연결", a.guardianPhone)}>
                    보호자 전화
                  </button>
                  <button className="btn" onClick={() => detail(a.patient)}>
                    상태 상세
                  </button>
                </>
              )}
              {role === "nurse" && (
                <button className="btn" onClick={() => detail(a.patient)}>
                  상태 상세
                </button>
              )}
              {role === "patient" && (
                <button className="btn" onClick={() => detail("내 상태")}>
                  상태 상세
                </button>
              )}
              {role === "guardian" && (
                <>
                  <button className="btn primary" onClick={() => sms(a.guardianPhone)}>
                    문자 발송
                  </button>
                  <button className="btn" onClick={() => call("의사에게 전화", a.doctorPhone)}>
                    의사 전화
                  </button>
                  <button className="btn" onClick={() => call("병원으로 전화", a.hospitalPhone)}>
                    병원 전화
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 데스크톱 테이블 */}
      <div className="desk">
        <table className="tbl">
          <thead>
            <tr>
              {role !== "patient" && <th>환자</th>}
              {role === "nurse" && <th>병실</th>}
              <th>상태</th>
              <th>메시지</th>
              <th>시간</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {data.map((a) => (
              <tr key={a.id}>
                {role !== "patient" && <td className="strong">{a.patient}</td>}
                {role === "nurse" && <td>{a.room}</td>}
                <td className="nowrap">
                  <span className={`dot ${clsDot(a.level)}`} /> {a.level}
                </td>
                <td>{a.message}</td>
                <td className="muted">{a.time}</td>
                <td className="actions-td">
                  {role === "doctor" && (
                    <>
                      <button className="btn xs primary" onClick={() => call("보호자 전화 연결", a.guardianPhone)}>
                        보호자 전화
                      </button>
                      <button className="btn xs" onClick={() => detail(a.patient)}>
                        상태 상세
                      </button>
                    </>
                  )}
                  {role === "nurse" && (
                    <button className="btn xs" onClick={() => detail(a.patient)}>
                      상태 상세
                    </button>
                  )}
                  {role === "patient" && (
                    <button className="btn xs" onClick={() => detail("내 상태")}>
                      상태 상세
                    </button>
                  )}
                  {role === "guardian" && (
                    <>
                      <button className="btn xs primary" onClick={() => sms(a.guardianPhone)}>
                        문자 발송
                      </button>
                      <button className="btn xs" onClick={() => call("의사에게 전화", a.doctorPhone)}>
                        의사 전화
                      </button>
                      <button className="btn xs" onClick={() => call("병원으로 전화", a.hospitalPhone)}>
                        병원 전화
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .wrap { padding: 8px 6px 12px; }

        /* 역할 토글 */
        .rolebar { display:flex; gap:6px; padding:2px 2px 8px; overflow:auto; }
        .chip{
          height:28px; padding:0 10px; border-radius:999px;
          border:1px solid #dbe7ff; background:#f4f8ff; color:#3457b1;
          font-weight:800; font-size:12px;
        }
        .chip.on{
          background:linear-gradient(180deg,#e9f2ff 0%, #ffffff 100%);
          border-color:#4a86ff; color:#193a8a;
          box-shadow:0 6px 14px rgba(21,44,84,.12);
        }

        .hint{ margin:0 2px 8px; font-size:12px; color:#475569; }
        .hint .demo{ color:#94a3b8; }

        /* 카드 리스트 (불릿/테두리 없음, 말랑배경만) */
        .list{ display:flex; flex-direction:column; gap:10px; list-style:none; padding:0; margin:0; }
        .item{
          border:none; border-radius:16px;
          background: linear-gradient(180deg,#f7faff 0%, #ffffff 100%);
          box-shadow:0 4px 12px rgba(21,44,84,.06);
          padding:12px;
        }
        .top{ display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
        .dot{
          width:8px; height:8px; border-radius:999px; display:inline-block;
          box-shadow:0 0 0 2px #ffffff, 0 0 8px rgba(0,0,0,.06);
        }
        .dot.ok{ background:#22c55e; box-shadow:0 0 0 2px #fff, 0 0 8px rgba(34,197,94,.28); }
        .dot.warn{ background:#f59e0b; box-shadow:0 0 0 2px #fff, 0 0 8px rgba(245,158,11,.28); }
        .dot.danger{
          background:#ef4444;
          box-shadow:0 0 0 2px #fff, 0 0 10px rgba(239,68,68,.4);
          animation:pulse 1.2s ease-in-out infinite;
        }
        @keyframes pulse{
          0%   { transform:scale(1);   box-shadow:0 0 0 2px #fff, 0 0 10px rgba(239,68,68,.40); }
          50%  { transform:scale(1.06); box-shadow:0 0 0 2px #fff, 0 0 16px rgba(239,68,68,.60); }
          100% { transform:scale(1);   box-shadow:0 0 0 2px #fff, 0 0 10px rgba(239,68,68,.40); }
        }

        .name{ font-weight:800; color:#0b1b33; }
        .room{
          margin-left:4px; font-size:12px; font-weight:800; color:#3757a8;
          background:#eef4ff; border-radius:999px; padding:4px 8px;
        }
        .lvl{
          margin-left:auto;
          display:inline-flex; align-items:center; gap:6px;
          font-weight:800; font-size:12px;
          padding:4px 10px; border-radius:999px; background:#fff;
          border:1px solid #e1e9ff; color:#0b1b33;
        }
        .lvl.ok    { background:#ecfdf5; border-color:#bbf7d0; color:#047857; }
        .lvl.warn  { background:#fff7ed; border-color:#fed7aa; color:#b45309; }
        .lvl.danger{ background:#fef2f2; border-color:#fecaca; color:#b91c1c; }

        .msg{ margin-top:6px; color:#475569; font-size:13px; }
        .time{ margin-top:4px; color:#64748b; font-size:12px; }
        .actions{ margin-top:10px; display:flex; gap:6px; flex-wrap:wrap; }

        .btn{
          height:32px; padding:0 12px; border-radius:10px; border:1px solid #e1e9ff;
          background:#fff; font-weight:800; color:#0b1b33;
          box-shadow:0 2px 8px rgba(21,44,84,.06);
        }
        .btn.primary{ background:#2f6fe4; color:#fff; border-color:#2f6fe4; }

        /* 데스크톱 테이블 */
        .desk{ display:none; }
        @media (min-width: 860px){
          .list{ display:none; }
          .desk{ display:block; }
        }
        .tbl{ width:100%; border-collapse:separate; border-spacing:0; font-size:13px; }
        .tbl thead th{
          text-align:left; padding:8px 10px; color:#475569; border-bottom:1px solid #eef3fb;
          background:#fff;
        }
        .tbl tbody td{ padding:9px 10px; border-bottom:1px solid #eef3fb; }
        .tbl .strong{ font-weight:800; color:#0b1b33; }
        .tbl .muted{ color:#64748b; }
        .tbl .nowrap{ white-space:nowrap; }
        .actions-td{ display:flex; gap:6px; flex-wrap:wrap; align-items:center; }
        .btn.xs{ height:28px; font-size:12px; padding:0 8px; border-radius:8px; }
      `}</style>
    </div>
  );
}
