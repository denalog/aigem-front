// src/components/alerthistory/caregiver.tsx
import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { createPortal } from "react-dom";

type Level = "정상" | "주의" | "위험";
type TaskType = "bed" | "call" | "turn";

interface AlertItem {
  id: number;
  type: "task" | "patient";
  name: string;
  pid: string;
  age: number;
  room: string;
  level: Level;
  message: string;
  time: string;
  taskType?: TaskType;
}

interface Contact { label: string; name?: string; phone: string; }

/** 대시보드(요양사) ASSIGNED 스냅샷과 동기화 */
const dataSource: AlertItem[] = [
  // 👉 내가 할 일
  {
    id: 1, type: "task", name: "김복순", pid: "p001", age: 87, room: "A-305호",
    level: "정상", message: "배드를 갈아줄 시간입니다.", time: "지금", taskType: "bed",
  },
  {
    id: 2, type: "task", name: "오순자", pid: "p003", age: 85, room: "A-204호",
    level: "주의", message: "환자의 호출 메시지가 있습니다.", time: "30분 전", taskType: "call",
  },
  {
    id: 3, type: "task", name: "남상길", pid: "p005", age: 79, room: "B-102호",
    level: "정상", message: "체위 변경 권장 시간입니다.", time: "2시간 전", taskType: "turn",
  },
  // 👉 환자 상태 알림
  {
    id: 4, type: "patient", name: "김복순", pid: "p001", age: 87, room: "A-305호",
    level: "정상", message: "3시간 전 압력 이상 감지 (해결됨)", time: "3시간 전",
  },
];

const clsDot = (lv: Level) => ({ 정상: "ok", 주의: "warn", 위험: "danger" } as const)[lv];
const clsLvl = (lv: Level) => ({ 정상: "ok", 주의: "warn", 위험: "danger" } as const)[lv];

const CONTACTS: Contact[] = [
  { label: "병원", phone: "02-123-4567" },
  { label: "의사", name: "김민준", phone: "010-5555-1234" },
  { label: "간호사", name: "박소연", phone: "010-3333-4444" },
  { label: "보호자", name: "이상훈", phone: "010-1234-5678" },
];

export default function CaregiverAlertHistory() {
  const router = useRouter();
  const items = useMemo(() => dataSource, []);

  const gotoDetail = (pid: string) => router.push(`/dashboard/caregiver/patient/${pid}`);

  // 📞 전화 모달 (포털)
  const [openCall, setOpenCall] = useState<null | { who: string }>(null);
  const telHref = (num: string) => `tel:${num.replace(/[^0-9+]/g, "")}`;

  const taskLabel = (t?: TaskType) =>
    t === "bed" ? "배드교체" : t === "call" ? "호출" : t === "turn" ? "체위변경" : "";

  return (
    <div className="wrap">
      {/* 안내 */}
      <div className="hint">
        <strong className="mr-1">요양사</strong>
        <span>환자 알림과 오늘 할 일을 한눈에 확인하세요.</span>
        <span className="demo"> (데모)</span>
      </div>

      {/* 모바일 카드 리스트 */}
      <div className="list" role="list">
        {items.map((a) => (
          <div key={a.id} className="item" role="listitem">
            <div className="top">
              <span className={`dot ${clsDot(a.level)}`} aria-hidden />
              <span className="name">{a.name}</span>
              <span className="ageChip">만 {a.age}세</span>
              <span className="room">{a.room}</span>

              {/* 오른쪽 끝: 상태/유형 칩 */}
              {a.type === "task" ? (
                <span className={`tchip ${a.taskType}`}>{taskLabel(a.taskType)}</span>
              ) : (
                <span className={`lvl ${clsLvl(a.level)}`}>{a.level}</span>
              )}
            </div>

            <div className="msg">{a.message}</div>
            <div className="time">{a.time}</div>

            <div className="actions">
              <button className="btn" onClick={() => gotoDetail(a.pid)}>상세보기</button>
              <button className="btn primary" onClick={() => setOpenCall({ who: a.name })}>전화</button>
            </div>
          </div>
        ))}
      </div>

      {/* 데스크톱 테이블 */}
      <div className="desk">
        <table className="tbl">
          <thead>
            <tr>
              <th>환자</th><th>나이</th><th>병실</th><th>종류</th><th>상태</th><th>메시지</th><th>시간</th><th>액션</th>
            </tr>
          </thead>
        <tbody>
          {items.map((a) => (
            <tr key={a.id}>
              <td className="strong">{a.name}</td>
              <td className="nowrap">만 {a.age}세</td>
              <td>{a.room}</td>
              <td className="nowrap">{a.type === "task" ? taskLabel(a.taskType) : "환자알림"}</td>
              <td className="nowrap"><span className={`dot ${clsDot(a.level)}`} /> {a.level}</td>
              <td>{a.message}</td>
              <td className="muted">{a.time}</td>
              <td className="actions-td">
                <button className="btn xs" onClick={() => gotoDetail(a.pid)}>상세</button>
                <button className="btn xs primary" onClick={() => setOpenCall({ who: a.name })}>전화</button>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>

      {/* 📞 콜 모달: 포털로 body에 렌더 → 팝오버/오버플로우에 안 잘림 + 완전 중앙 */}
      {openCall &&
        typeof window !== "undefined" &&
        createPortal(
          <div className="agemModal" role="dialog" aria-modal="true" onClick={() => setOpenCall(null)}>
            <div className="panel" onClick={(e) => e.stopPropagation()}>
              <div className="mhead">
                <strong>전화하기</strong>
                <button className="x" aria-label="닫기" onClick={() => setOpenCall(null)}>✕</button>
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
          </div>,
          document.body
        )
      }

      <style jsx>{`
        .wrap { padding:8px 6px 12px; }
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
        .room{ font-size:12px; font-weight:800; color:#3757a8; background:#eef4ff; border-radius:999px; padding:4px 8px; }
        .lvl{
          margin-left:auto; display:inline-flex; align-items:center; gap:6px;
          font-weight:800; font-size:12px; padding:4px 10px; border-radius:999px; background:#fff; border:1px solid #e1e9ff; color:#0b1b33;
        }
        .lvl.ok{ background:#ecfdf5; border-color:#bbf7d0; color:#047857; }
        .lvl.warn{ background:#fff7ed; border-color:#fed7aa; color:#b45309; }
        .lvl.danger{ background:#fef2f2; border-color:#fecaca; color:#b91c1c; }

        /* 작업 유형 칩 */
        .tchip{
          margin-left:auto; display:inline-flex; align-items:center;
          height:22px; padding:0 10px; border-radius:999px;
          border:1px solid #e1e9ff; background:#fff; font-weight:800; font-size:12px; color:#27477d;
        }
        .tchip.bed  { background:#eef2ff; border-color:#c7d2fe; }
        .tchip.call { background:#fff1f2; border-color:#fecdd3; }
        .tchip.turn { background:#ecfdf5; border-color:#bbf7d0; }

        .msg{ margin-top:6px; color:#475569; font-size:13px; }
        .time{ margin-top:4px; color:#64748b; font-size:12px; }
        .actions{ margin-top:10px; display:flex; gap:6px; flex-wrap:wrap; }
        .btn{ height:32px; padding:0 12px; border-radius:10px; border:1px solid #e1e9ff; background:#fff; font-weight:800; color:#0b1b33; box-shadow:0 2px 8px rgba(21,44,84,.06); }
        .btn.primary{ background:#2f6fe4; color:#fff; border-color:#2f6fe4; }

        /* 데스크톱 테이블 */
        .desk{ display:none; }
        @media (min-width: 860px){ .list{ display:none; } .desk{ display:block; } }
        .tbl{ width:100%; border-collapse:separate; border-spacing:0; font-size:13px; }
        .tbl thead th{ text-align:left; padding:8px 10px; color:#475569; border-bottom:1px solid #eef3fb; background:#fff; }
        .tbl tbody td{ padding:9px 10px; border-bottom:1px solid #eef3fb; }
        .tbl .strong{ font-weight:800; color:#0b1b33; }
        .tbl .muted{ color:#64748b; }
        .tbl .nowrap{ white-space:nowrap; }
        .actions-td{ display:flex; gap:6px; flex-wrap:wrap; align-items:center; }
        .btn.xs{ height:28px; font-size:12px; padding:0 8px; border-radius:8px; }

        /* 📞 콜 모달(포털): 완전 중앙 + safe-area 대응 + 스크롤가능 */
        .agemModal{
          position: fixed; inset: 0; z-index: 1000;
          display: grid; place-items: center;
          background: rgba(10,20,40,.34);
          backdrop-filter: blur(2px);
          padding:
            max(16px, env(safe-area-inset-top))
            max(16px, env(safe-area-inset-right))
            max(16px, env(safe-area-inset-bottom))
            max(16px, env(safe-area-inset-left));
          overscroll-behavior: contain;
        }
        .panel{
          width: min(92vw, 420px);
          max-height: calc(100vh - 48px - env(safe-area-inset-top) - env(safe-area-inset-bottom));
          overflow: auto;
          border-radius:16px; border:1px solid #e1e9ff; background:#fff;
          box-shadow:0 20px 40px rgba(21,44,84,.18);
        }
        .mhead{ display:flex; align-items:center; justify-content:space-between; padding:10px 12px; border-bottom:1px solid #eef3fb; position: sticky; top:0; background:#fff; z-index:1; }
        .mbody{ padding:14px; }
        .x{ width:32px; height:32px; border-radius:10px; border:1px solid #e1e9ff; background:#fff; }

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
