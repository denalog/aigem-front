// src/components/alerthistory/docter.tsx
import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { createPortal } from "react-dom";

type Level = "정상" | "주의" | "위험";

interface AlertItem {
  id: number;
  patient: string;
  room?: string;
  message: string;
  level: Level;
  time: string;
  age: number;
  guardianName?: string;
  guardianPhone?: string;
  doctorPhone?: string;
  hospitalPhone?: string;
  patientId?: number;
}

const alerts: AlertItem[] = [
  {
    id: 1,
    patient: "김복순",
    room: "103호",
    message: "산소포화도 급락 감지",
    level: "위험",
    time: "2분 전",
    age: 87,
    guardianName: "박복지",
    guardianPhone: "010-7777-8888",
    doctorPhone: "010-9000-4444",
    hospitalPhone: "02-777-8888",
    patientId: 1,
  },
  { id: 2, patient: "최영만", room: "105호", message: "혈압 상승(경계)", level: "주의", time: "5분 전", age: 81, guardianName: "최보호", guardianPhone: "010-1111-2222", doctorPhone: "010-9000-1111", hospitalPhone: "02-111-2222", patientId: 2 },
  { id: 3, patient: "박정자", room: "201호", message: "정상 범위 유지", level: "정상", time: "12분 전", age: 78, guardianName: "박보호", guardianPhone: "010-3333-4444", doctorPhone: "010-9000-2222", hospitalPhone: "02-333-4444", patientId: 3 },
  { id: 4, patient: "이명자", room: "204호", message: "심박 변동성 경계", level: "주의", time: "7분 전", age: 84, guardianName: "이보호", guardianPhone: "010-5555-6666", doctorPhone: "010-9000-3333", hospitalPhone: "02-555-6666", patientId: 4 },
  { id: 5, patient: "오병철", room: "302호", message: "정상 범위 유지", level: "정상", time: "20분 전", age: 76, guardianName: "오보호", guardianPhone: "010-7777-9999", doctorPhone: "010-9000-5555", hospitalPhone: "02-777-9999", patientId: 5 },
  { id: 6, patient: "한순애", room: "305호", message: "정상 범위 유지", level: "정상", time: "5분 전", age: 90, guardianName: "한보호", guardianPhone: "010-8888-0000", doctorPhone: "010-9000-6666", hospitalPhone: "02-888-0000", patientId: 6 },
  { id: 7, patient: "정해철", room: "401호", message: "혈압·호흡 주의 관찰", level: "주의", time: "7분 전", age: 79, guardianName: "정보호", guardianPhone: "010-1212-3434", doctorPhone: "010-9000-7777", hospitalPhone: "02-121-3434", patientId: 7 },
  { id: 8, patient: "윤말자", room: "403호", message: "부정맥 의심", level: "위험", time: "2분 전", age: 85, guardianName: "윤보호", guardianPhone: "010-5656-7878", doctorPhone: "010-9000-8888", hospitalPhone: "02-565-7878", patientId: 8 },
];

const clsDot = (lv: Level) => ({ 정상: "ok", 주의: "warn", 위험: "danger" } as const)[lv];
const clsLvl = (lv: Level) => ({ 정상: "ok", 주의: "warn", 위험: "danger" } as const)[lv];

export default function DoctorAlertHistory() {
  const router = useRouter();
  const data = useMemo(() => alerts, []);

  // 상세 이동: 김복순은 고정 상세로, 그 외 쿼리
  const gotoDetail = (a: AlertItem) => {
    if (a.patient === "김복순") {
      router.push("/dashboard/doctor/patient/p001");
      return;
    }
    if (a.patientId) router.push(`/dashboard/doctor?patient=${a.patientId}`);
    else router.push(`/dashboard/doctor?patientName=${encodeURIComponent(a.patient)}`);
  };

  // 보호자 전화 모달
  const [callTarget, setCallTarget] = useState<null | { title: string; name: string; tel?: string }>(null);
  const openGuardian = (a: AlertItem) =>
    setCallTarget({ title: "보호자 전화 연결", name: a.guardianName || `${a.patient} 보호자`, tel: a.guardianPhone });
  const telHref = (tel?: string) => (tel ? `tel:${tel.replace(/[^0-9+]/g, "")}` : "#");

  return (
    <div className="wrap">
      {/* 안내 */}
      <div className="hint">
        <strong className="mr-1">의사</strong>
        <span>환자 상태 변화 실시간 알림 • 보호자에게 바로 전화 가능합니다.</span>
        <span className="demo"> (데모)</span>
      </div>

      {/* 리스트(모바일) */}
      <div className="list" role="list">
        {data.map((a) => (
          <div key={a.id} className="item" role="listitem">
            <div className="top">
              <span className={`dot ${clsDot(a.level)}`} aria-hidden />
              <span className="name">{a.patient}</span>
              <span className="ageChip">만 {a.age}세</span>
              {a.room && <span className="room">{a.room}</span>}
              <span className={`lvl ${clsLvl(a.level)}`}>{a.level}</span>
            </div>
            <div className="msg">{a.message}</div>
            <div className="time">{a.time}</div>
            <div className="actions">
              <button className="btn primary" onClick={() => openGuardian(a)}>보호자 전화</button>
              <button className="btn" onClick={() => gotoDetail(a)}>상태 상세</button>
            </div>
          </div>
        ))}
      </div>

      {/* 데스크톱 테이블 */}
      <div className="desk">
        <table className="tbl">
          <thead>
            <tr>
              <th>환자</th><th>나이</th><th>병실</th><th>상태</th><th>메시지</th><th>시간</th><th>액션</th>
            </tr>
          </thead>
          <tbody>
            {data.map((a) => (
              <tr key={a.id}>
                <td className="strong">{a.patient}</td>
                <td className="nowrap">만 {a.age}세</td>
                <td>{a.room}</td>
                <td className="nowrap"><span className={`dot ${clsDot(a.level)}`} /> {a.level}</td>
                <td>{a.message}</td>
                <td className="muted">{a.time}</td>
                <td className="actions-td">
                  <button className="btn xs primary" onClick={() => openGuardian(a)}>보호자 전화</button>
                  <button className="btn xs" onClick={() => gotoDetail(a)}>상태 상세</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 📞 모달을 포털로 body에 렌더 (중앙정렬). 스타일은 아래 전역 style에서 처리 */}
      {callTarget &&
        typeof window !== "undefined" &&
        createPortal(
          <div className="agemModal" role="dialog" aria-modal="true" onClick={() => setCallTarget(null)}>
            <div className="panel" onClick={(e) => e.stopPropagation()}>
              <div className="mhead">
                <strong>{callTarget.title}</strong>
                <button className="x" aria-label="닫기" onClick={() => setCallTarget(null)}>✕</button>
              </div>
              <div className="mbody">
                <div className="callCard">
                  <div className="phoneIcon" aria-hidden>📞</div>
                  <div className="who">{callTarget.name}</div>
                  {callTarget.tel ? (
                    <>
                      <div className="tel">{callTarget.tel}</div>
                      <div className="callActions">
                        <a className="btn primary big" href={telHref(callTarget.tel)}>통화하기</a>
                        <button
                          className="btn big"
                          onClick={async () => { try { await navigator.clipboard.writeText(callTarget.tel!); } catch {} }}
                        >
                          번호 복사
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="muted">등록된 전화번호가 없습니다.</div>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      }

      {/* 단일 styled-jsx: 포털 모달 포함한 모든 스타일을 한 군데로 */}
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
        .dot.danger{ background:#ef4444; box-shadow:0 0 0 2px #fff, 0 0 10px rgba(239,68,68,.4); animation:pulse 1.2s ease-in-out infinite; }
        @keyframes pulse{ 0%{transform:scale(1)} 50%{transform:scale(1.06)} 100%{transform:scale(1)} }

        .name{ font-weight:800; color:#0b1b33; }
        .ageChip{
          font-size:12px; font-weight:800; color:#3757a8;
          background:#eef4ff; border:1px solid #dbe7ff; border-radius:999px;
          padding:4px 8px; line-height:1;
        }
        .room{ margin-left:4px; font-size:12px; font-weight:800; color:#3757a8; background:#eef4ff; border-radius:999px; padding:4px 8px; }
        .lvl{
          margin-left:auto; display:inline-flex; align-items:center; gap:6px;
          font-weight:800; font-size:12px; padding:4px 10px; border-radius:999px; background:#fff; border:1px solid #e1e9ff; color:#0b1b33;
        }
        .lvl.ok{ background:#ecfdf5; border-color:#bbf7d0; color:#047857; }
        .lvl.warn{ background:#fff7ed; border-color:#fed7aa; color:#b45309; }
        .lvl.danger{ background:#fef2f2; border-color:#fecaca; color:#b91c1c; }

        .msg{ margin-top:6px; color:#475569; font-size:13px; }
        .time{ margin-top:4px; color:#64748b; font-size:12px; }
        .actions{ margin-top:10px; display:flex; gap:6px; flex-wrap:wrap; }

        .btn{ height:32px; padding:0 12px; border-radius:10px; border:1px solid #e1e9ff; background:#fff; font-weight:800; color:#0b1b33; box-shadow:0 2px 8px rgba(21,44,84,.06); }
        .btn.primary{ background:#2f6fe4; color:#fff; border-color:#2f6fe4; }
        .btn.big{ height:38px; padding:0 14px; border-radius:12px; }

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

        /* === 포털 모달: 중앙정렬 + safe-area 대응 === */
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
          background:#fff; border:1px solid #e1e9ff; border-radius:16px;
          box-shadow:0 20px 40px rgba(21,44,84,.18);
          display:flex; flex-direction:column;
        }
        .mhead{
          display:flex; align-items:center; justify-content:space-between;
          padding:10px 12px; border-bottom:1px solid #eef3fb;
          position: sticky; top:0; background:#fff; z-index:1;
        }
        .mbody{ padding:14px; }
        .x{ width:32px; height:32px; border-radius:10px; border:1px solid #e1e9ff; background:#fff; }
        .callCard{ display:flex; flex-direction:column; align-items:center; gap:10px; padding:6px 6px 12px; }
        .phoneIcon{ font-size:44px; line-height:1; }
        .who{ font-weight:900; color:#0b1b33; }
        .tel{ font-size:18px; font-weight:900; letter-spacing:.4px; }
        .callActions{ display:flex; gap:8px; margin-top:4px; }
        .muted{ color:#64748b; }
      `}</style>
    </div>
  );
}
