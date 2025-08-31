// src/components/alerthistory/patient.tsx
import { useMemo } from "react";
import { useRouter } from "next/router";

type Level = "정상" | "주의" | "위험";

interface AlertItem {
  id: number;
  name: string;     // 고정: 김복순
  pid: string;      // p001
  age: number;      // 만 나이
  level: Level;     // 칩 색상
  type: "meal" | "message" | "turn" | "surgery"; // 알림 종류
  title: string;    // 한 줄 제목
  body?: string;    // 상세(있으면 표시)
  time: string;     // 'N분 전' / 'N시간 후'
}

/** 환자 본인(김복순) 시나리오 알림 */
const alerts: AlertItem[] = [
  {
    id: 101,
    name: "김복순",
    pid: "p001",
    age: 87,
    type: "meal",
    level: "정상",
    title: "2시간 후 점심시간입니다.",
    body: "식사 전 복약이 있으면 간호사에게 문의하세요.",
    time: "2시간 후",
  },
  {
    id: 102,
    name: "김복순",
    pid: "p001",
    age: 87,
    type: "message",
    level: "정상",
    title: "보호자로부터 메시지가 도착했습니다.",
    body: "“오늘 오후 3시에 잠깐 들를게요!”",
    time: "방금",
  },
  {
    id: 103,
    name: "김복순",
    pid: "p001",
    age: 87,
    type: "turn",
    level: "주의",
    title: "지금 자세를 바꿔주세요.",
    body: "오래 같은 자세로 계시면 욕창 위험이 있어요.",
    time: "10분 전",
  },
  {
    id: 104,
    name: "김복순",
    pid: "p001",
    age: 87,
    type: "surgery",
    level: "주의",
    title: "오늘 오후 수술/검사 일정이 있습니다.",
    body: "오후 2시 수술실 입실 예정입니다.",
    time: "오늘",
  },
];

const clsDot = (lv: Level) => ({ 정상: "ok", 주의: "warn", 위험: "danger" } as const)[lv];
const clsLvl = (lv: Level) => ({ 정상: "ok", 주의: "warn", 위험: "danger" } as const)[lv];
const typeLabel = (t: AlertItem["type"]) =>
  t === "meal" ? "식사" : t === "message" ? "메시지" : t === "turn" ? "체위" : "수술";

export default function PatientAlertHistory() {
  const router = useRouter();
  const data = useMemo(() => alerts, []);

  const gotoDetail = () => {
    // 환자 상세는 항상 p001로 이동 (공통 합의사항)
    router.push("/dashboard/patient/p001");
  };

  return (
    <div className="wrap">
      <div className="hint">
        <strong className="mr-1">환자</strong>
        <span>식사/체위/일정/메시지 알림을 한눈에 확인하세요.</span>
        <span className="demo"> (데모)</span>
      </div>

      {/* 모바일 카드 리스트 */}
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

            <div className="titleRow">
              <span className={`tchip ${a.type}`}>{typeLabel(a.type)}</span>
              <span className="title">{a.title}</span>
            </div>

            {a.body && <div className="body">{a.body}</div>}
            <div className="time">{a.time}</div>

            <div className="actions">
              <button className="btn" onClick={gotoDetail}>상세보기</button>
            </div>
          </div>
        ))}
      </div>

      {/* 데스크톱 테이블 */}
      <div className="desk">
        <table className="tbl">
          <thead>
            <tr>
              <th>종류</th>
              <th>제목</th>
              <th>상세</th>
              <th>상태</th>
              <th>시간</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {data.map((a) => (
              <tr key={a.id}>
                <td className="nowrap">
                  <span className={`tchip ${a.type}`}>{typeLabel(a.type)}</span>
                </td>
                <td className="strong">{a.title}</td>
                <td className="muted">{a.body || "-"}</td>
                <td className="nowrap"><span className={`dot ${clsDot(a.level)}`} /> {a.level}</td>
                <td className="muted">{a.time}</td>
                <td className="actions-td">
                  <button className="btn xs" onClick={gotoDetail}>상세</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .wrap { padding: 8px 6px 12px; }
        .hint{ margin:0 2px 8px; font-size:12px; color:#475569; }
        .hint .demo{ color:#94a3b8; }
        .list{ display:flex; flex-direction:column; gap:10px; list-style:none; padding:0; margin:0; }
        .item{
          border:none; border-radius:16px;
          background: linear-gradient(180deg,#f7faff 0%, #ffffff 100%);
          box-shadow:0 4px 12px rgba(21,44,84,.06);
          padding:12px;
        }
        .top{ display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
        .dot{ width:8px; height:8px; border-radius:999px; display:inline-block; box-shadow:0 0 0 2px #fff, 0 0 8px rgba(0,0,0,.06); }
        .dot.ok{ background:#22c55e; box-shadow:0 0 0 2px #fff, 0 0 8px rgba(34,197,94,.28); }
        .dot.warn{ background:#f59e0b; box-shadow:0 0 0 2px #fff, 0 0 8px rgba(245,158,11,.28); }
        .dot.danger{ background:#ef4444; box-shadow:0 0 0 2px #fff, 0 0 10px rgba(239,68,68,.4); }

        .name{ font-weight:800; color:#0b1b33; }
        .ageChip{
          font-size:12px; font-weight:800; color:#3757a8;
          background:#eef4ff; border:1px solid #dbe7ff; border-radius:999px;
          padding:4px 8px; line-height:1;
        }
        .code{ font-size:12px; color:#6b7fb0; font-weight:800; border:1px solid #e1e9ff; background:#fff; padding:4px 8px; border-radius:999px; }
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

        .titleRow{ display:flex; align-items:center; gap:8px; margin-top:8px; flex-wrap:wrap; }
        .tchip{
          display:inline-flex; align-items:center;
          height:22px; padding:0 10px; border-radius:999px;
          border:1px solid #e1e9ff; background:#fff; font-weight:800; font-size:12px; color:#27477d;
        }
        .tchip.meal    { background:#eef2ff; border-color:#c7d2fe; }
        .tchip.message { background:#f0f9ff; border-color:#bae6fd; }
        .tchip.turn    { background:#ecfdf5; border-color:#bbf7d0; }
        .tchip.surgery { background:#fff7ed; border-color:#fed7aa; }

        .title{ font-weight:900; color:#0b1b33; }
        .body{ margin-top:4px; color:#475569; font-size:13px; }
        .time{ margin-top:4px; color:#64748b; font-size:12px; }
        .actions{ margin-top:10px; display:flex; gap:6px; flex-wrap:wrap; }
        .btn{ height:32px; padding:0 12px; border-radius:10px; border:1px solid #e1e9ff; background:#fff; font-weight:800; color:#0b1b33; box-shadow:0 2px 8px rgba(21,44,84,.06); }
        .btn.xs{ height:28px; font-size:12px; padding:0 8px; border-radius:8px; }

        /* 데스크톱 테이블 */
        .desk{ display:none; }
        @media (min-width: 860px){
          .list{ display:none; }
          .desk{ display:block; }
        }
        .tbl{ width:100%; border-collapse:separate; border-spacing:0; font-size:13px; }
        .tbl thead th{ text-align:left; padding:8px 10px; color:#475569; border-bottom:1px solid #eef3fb; background:#fff; }
        .tbl tbody td{ padding:9px 10px; border-bottom:1px solid #eef3fb; }
        .tbl .strong{ font-weight:800; color:#0b1b33; }
        .tbl .muted{ color:#64748b; }
        .tbl .nowrap{ white-space:nowrap; }
        .actions-td{ display:flex; gap:6px; flex-wrap:wrap; align-items:center; }
      `}</style>
    </div>
  );
}
