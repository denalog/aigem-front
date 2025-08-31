import { useMemo } from "react";
import { useRouter } from "next/router";

type Level = "정상" | "주의" | "위험";

interface AlertItem {
  id: number;
  patient: string;
  room: string;     // 간호사는 병실 강조
  message: string;
  level: Level;
  time: string;
  age: number;      // 만 나이 배지
  patientId?: number; // (사용 안 함, 호환용으로만 유지)
}

/** 의사 대시보드와 동일한 8명 스냅샷 기반 */
const alerts: AlertItem[] = [
  { id: 1, patient: "김복순", room: "103호", message: "산소포화도 급락 감지", level: "위험", time: "2분 전",  age: 87, patientId: 1 },
  { id: 2, patient: "최영만", room: "105호", message: "혈압 상승(경계)",     level: "주의", time: "5분 전",  age: 81, patientId: 2 },
  { id: 3, patient: "박정자", room: "201호", message: "정상 범위 유지",       level: "정상", time: "12분 전", age: 78, patientId: 3 },
  { id: 4, patient: "이명자", room: "204호", message: "심박 변동성 경계",     level: "주의", time: "7분 전",  age: 84, patientId: 4 },
  { id: 5, patient: "오병철", room: "302호", message: "정상 범위 유지",       level: "정상", time: "20분 전", age: 76, patientId: 5 },
  { id: 6, patient: "한순애", room: "305호", message: "정상 범위 유지",       level: "정상", time: "5분 전",  age: 90, patientId: 6 },
  { id: 7, patient: "정해철", room: "401호", message: "혈압·호흡 주의 관찰",  level: "주의", time: "7분 전",  age: 79, patientId: 7 },
  { id: 8, patient: "윤말자", room: "403호", message: "부정맥 의심",         level: "위험", time: "2분 전",  age: 85, patientId: 8 },
];

const clsDot = (lv: Level) => ({ 정상: "ok", 주의: "warn", 위험: "danger" } as const)[lv];
const clsLvl = (lv: Level) => ({ 정상: "ok", 주의: "warn", 위험: "danger" } as const)[lv];

export default function NurseAlertHistory() {
  const router = useRouter();
  const data = useMemo(() => alerts, []);

  // ✅ 상세는 항상 간호사 라우트의 p001(김복순)로 이동
  const gotoDetail = () => {
    router.push("/dashboard/nurse/patient/p001");
  };

  return (
    <div className="wrap">
      {/* 안내 */}
      <div className="hint">
        <strong className="mr-1">간호사</strong>
        <span>환자(병실) 상태 변화 실시간 알림 • 상세보기로 확인하세요.</span>
        <span className="demo"> (데모)</span>
      </div>

      {/* 모바일 카드 리스트 */}
      <div className="list" role="list">
        {data.map((a) => (
          <div key={a.id} className="item" role="listitem">
            <div className="top">
              <span className={`dot ${clsDot(a.level)}`} aria-hidden />
              <span className="name">{a.patient}</span>
              <span className="ageChip">만 {a.age}세</span>
              <span className="room">{a.room}</span>
              <span className={`lvl ${clsLvl(a.level)}`}>{a.level}</span>
            </div>
            <div className="msg">{a.message}</div>
            <div className="time">{a.time}</div>
            <div className="actions">
              <button className="btn" onClick={gotoDetail}>상태 상세</button>
            </div>
          </div>
        ))}
      </div>

      {/* 데스크톱 테이블 */}
      <div className="desk">
        <table className="tbl">
          <thead>
            <tr>
              <th>환자</th>
              <th>나이</th>
              <th>병실</th>
              <th>상태</th>
              <th>메시지</th>
              <th>시간</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {data.map((a) => (
              <tr key={a.id}>
                <td className="strong">{a.patient}</td>
                <td className="nowrap">만 {a.age}세</td>
                <td>{a.room}</td>
                <td className="nowrap">
                  <span className={`dot ${clsDot(a.level)}`} /> {a.level}
                </td>
                <td>{a.message}</td>
                <td className="muted">{a.time}</td>
                <td className="actions-td">
                  <button className="btn xs" onClick={gotoDetail}>상태 상세</button>
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
        .dot.danger{ background:#ef4444; box-shadow:0 0 0 2px #fff, 0 0 10px rgba(239,68,68,.4); animation:pulse 1.2s ease-in-out infinite; }
        @keyframes pulse{
          0%{ transform:scale(1); box-shadow:0 0 0 2px #fff, 0 0 10px rgba(239,68,68,.40); }
          50%{ transform:scale(1.06); box-shadow:0 0 0 2px #fff, 0 0 16px rgba(239,68,68,.60); }
          100%{ transform:scale(1); box-shadow:0 0 0 2px #fff, 0 0 10px rgba(239,68,68,.40); }
        }

        .name{ font-weight:800; color:#0b1b33; }
        .ageChip{
          font-size:12px; font-weight:800; color:#3757a8;
          background:#eef4ff; border:1px solid #dbe7ff; border-radius:999px;
          padding:4px 8px; line-height:1;
        }
        .room{
          font-size:12px; font-weight:800; color:#3757a8;
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
