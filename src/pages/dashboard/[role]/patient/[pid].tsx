// src/pages/dashboard/[role]/patient/[pid].tsx
import { useMemo, useState } from "react";
import { useRouter } from "next/router";

/* 타입 */
type Status = "안정" | "주의" | "위험";
const statusToClass = (s: Status) =>
  s === "안정" ? "ok" : s === "주의" ? "warn" : "danger";

/* 고정 환자 데이터 */
const PATIENT: {
  id: string;
  name: string;
  age: number; // 만 나이
  floor: number;
  room: string;
  ward: string;
  status: Status;
  guardian: { name: string; phone: string };
} = {
  id: "p001",
  name: "김복순",
  age: 87,
  floor: 1,
  room: "103호",
  ward: "내과병동",
  status: "위험",
  guardian: { name: "이상훈", phone: "010-1234-5678" },
};

/* 고정 시계열 (길이 40) */
const SERIES = {
  bpm: [
    92, 91, 92, 93, 95, 94, 96, 95, 94, 93, 92, 93, 94, 96, 97, 96, 95, 94, 93,
    93, 92, 92, 93, 94, 96, 95, 95, 94, 93, 92, 92, 93, 95, 96, 95, 94, 94, 93,
    92, 92,
  ],
  rpm: [
    18, 18, 19, 18, 17, 18, 18, 19, 18, 18, 17, 17, 18, 19, 19, 18, 18, 17, 18,
    18, 19, 18, 18, 17, 18, 19, 18, 18, 18, 17, 17, 18, 18, 19, 19, 18, 18, 18,
    17, 18,
  ],
  temp: [
    36.6, 36.6, 36.7, 36.6, 36.7, 36.8, 36.7, 36.7, 36.6, 36.6, 36.7, 36.8,
    36.8, 36.7, 36.6, 36.6, 36.7, 36.8, 36.9, 36.8, 36.8, 36.7, 36.7, 36.6,
    36.6, 36.7, 36.7, 36.8, 36.8, 36.7, 36.7, 36.6, 36.6, 36.7, 36.8, 36.8,
    36.7, 36.6, 36.6, 36.7,
  ],
};

/* 히트맵(결정적) */
type Dot = { x: number; y: number; t: number };
function makeHumanPoseHeatmap(cols = 60, rows = 120): Dot[] {
  const cx = cols / 2;
  const headY = rows * 0.14;
  const chestY = rows * 0.35;
  const pelvisY = rows * 0.62;
  const legsY = rows * 0.82;

  const dots: Dot[] = [];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const dx = (i - cx) / cols;
      const y = j / rows;
      const g = (x0: number, y0: number, sx: number, sy: number, amp: number) =>
        amp *
        Math.exp(
          -((dx - x0) ** 2 / (2 * sx ** 2) + (y - y0) ** 2 / (2 * sy ** 2))
        );
      const head = g(0, headY / rows, 0.06, 0.04, 0.78);
      const chest = g(0, chestY / rows, 0.09, 0.06, 1.0);
      const belly = g(0, (chestY + pelvisY) / (2 * rows), 0.1, 0.07, 0.9);
      const pelvis = g(0, pelvisY / rows, 0.1, 0.06, 0.95);
      const legs = g(0, legsY / rows, 0.12, 0.09, 0.85);
      const ripple =
        0.015 * (Math.sin(i * 0.15) * Math.cos(j * 0.11) * 0.5 + 0.5);
      let t = head + chest + belly + pelvis + legs + ripple;
      if (t < 0) t = 0;
      if (t > 1) t = 1;
      dots.push({ x: i, y: j, t });
    }
  }
  return dots;
}
function tempColor(t: number) {
  const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const c = clamp(t);
  const r = Math.round(255 * c);
  const g = Math.round(160 * (1 - c) + 120 * c);
  const b = Math.round(255 * (1 - c));
  return `rgb(${r},${g},${b})`;
}

/* 스파크라인 */
function Spark({
  series,
  stroke = "#3b82f6",
}: {
  series: number[];
  stroke?: string;
}) {
  const w = 280;
  const h = 70;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const sx = (i: number) => (i / (series.length - 1)) * (w - 6) + 3;
  const sy = (v: number) => {
    if (max === min) return h / 2;
    const t = (v - min) / (max - min);
    return h - 8 - t * (h - 16);
  };
  const d = series
    .map((v, i) => `${i ? "L" : "M"} ${sx(i)} ${sy(v)}`)
    .join(" ");
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="trend">
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <circle
        cx={sx(series.length - 1)}
        cy={sy(series[series.length - 1])}
        r={3.5}
        fill={stroke}
      />
    </svg>
  );
}

export default function PatientDetail() {
  const router = useRouter();
  const { role = "doctor", pid } = router.query as {
    role?: string;
    pid?: string;
  };

  const bpm = useMemo(() => SERIES.bpm, []);
  const rpm = useMemo(() => SERIES.rpm, []);
  const temp = useMemo(() => SERIES.temp, []);
  const heatDots = useMemo(() => makeHumanPoseHeatmap(60, 120), []);

  const statusClass = statusToClass(PATIENT.status);

  /* 보호자 전화 모달 */
  const [callOpen, setCallOpen] = useState(false);
  const confirmCall = () => {
    setCallOpen(false);
    // 모바일/데스크톱 모두 tel 스킴 시도
    const tel = "tel:" + PATIENT.guardian.phone.replace(/-/g, "");
    if (typeof window !== "undefined") window.location.href = tel;
  };

  return (
    <main className="wrap">
      {/* 상단 */}
      <section className="header">
        <div className="crumbs">
          <span className="chip">{PATIENT.ward}</span>
          <span className="chip">{PATIENT.floor}층</span>
          <span className="chip">{PATIENT.room}</span>
        </div>
        <h1 className="title">
          환자 상세 · <b>{PATIENT.name}</b>
          <span className="muted">
            {" "}
            · 만 {PATIENT.age}세 · #{pid || PATIENT.id}
          </span>
        </h1>
        <div className="meta">
          <span className={`status ${statusClass}`}>{PATIENT.status}</span>
          <span className="role">역할: {role}</span>
          <button
            className="back"
            onClick={() => router.back()}
            aria-label="대시보드로">
            ← 대시보드
          </button>
        </div>
      </section>

      {/* KPI 3장 */}
      <section className="grid">
        <article className="card kpi">
          <header className="card-head">
            <div>
              <h3>심박수 BPM</h3>
              <span className="tiny">X: 시간 흐름(좌→우), Y: BPM</span>
            </div>
            <button
              className="pill sm ghost"
              onClick={() => alert("[데모] BPM 로그 보기")}>
              로그
            </button>
          </header>
          <div className="card-body">
            <div className="kpi-val">{bpm[bpm.length - 1]}</div>
            <Spark series={bpm} stroke="#3b82f6" />
          </div>
        </article>

        <article className="card kpi">
          <header className="card-head">
            <div>
              <h3>호흡 RPM</h3>
              <span className="tiny">X: 시간 흐름(좌→우), Y: RPM</span>
            </div>
            <button
              className="pill sm ghost"
              onClick={() => alert("[데모] RPM 로그 보기")}>
              로그
            </button>
          </header>
          <div className="card-body">
            <div className="kpi-val">{rpm[rpm.length - 1]}</div>
            <Spark series={rpm} stroke="#8b5cf6" />
          </div>
        </article>

        <article className="card kpi">
          <header className="card-head">
            <div>
              <h3>체온 ℃</h3>
              <span className="tiny">X: 시간 흐름(좌→우), Y: 체온(℃)</span>
            </div>
            <button
              className="pill sm ghost"
              onClick={() => alert("[데모] 체온 로그 보기")}>
              로그
            </button>
          </header>
          <div className="card-body">
            <div className="kpi-val">{temp[temp.length - 1].toFixed(1)}</div>
            <Spark
              series={temp.map((v) => Math.round(v * 10))}
              stroke="#10b981"
            />
          </div>
        </article>
      </section>

      {/* 히트맵 */}
      <article className="card heat">
        <header className="heat-head">
          <h3 className="heat-title">침대 압력/체온 분포</h3>
          <div className="chips">
            <button className="pill">데모(고정)</button>
            <button className="pill outline">자세 추정: 정자세</button>
            <button
              className="pill ghost"
              onClick={() => alert("[데모] 자세 로그 보기")}>
              자세 로그
            </button>
          </div>
        </header>

        <div className="svg-wrap" role="img" aria-label="정자세 히트맵">
          <svg
            className="heat-svg"
            viewBox="0 0 120 240"
            preserveAspectRatio="xMidYMid meet">
            <rect x="4" y="4" width="112" height="232" rx="8" fill="#eaf3ff" />
            {heatDots.map((d, idx) => {
              const px = 6 + (d.x / 60) * 108;
              const py = 6 + (d.y / 120) * 228;
              return (
                <circle
                  key={idx}
                  cx={px}
                  cy={py}
                  r={0.65}
                  fill={tempColor(d.t)}
                />
              );
            })}
          </svg>
        </div>

        <footer className="legend">
          <span className="tiny">좌→우: 침대 좌/우, 상→하: 머리→발</span>
          <div className="legend-dots">
            <span>
              <i className="dot cold" />
              차가움
            </span>
            <span>
              <i className="dot warm" />
              따뜻함
            </span>
            <span>
              <i className="dot hot" />
              뜨거움
            </span>
          </div>
        </footer>
      </article>

      {/* 로그/액션 */}
      <section className="stack">
        <article className="card logs">
          <header className="card-head">
            <h3>상태 로그</h3>
          </header>
          <ul className="log-list">
            <li>
              <i className="dot ok" /> BPM 최근값{" "}
              <b>{bpm[bpm.length - 1]}회/분</b> <em>2분 전</em>
            </li>
            <li>
              <i className="dot ok" /> RPM 최근값{" "}
              <b>{rpm[rpm.length - 1]}회/분</b> <em>9분 전</em>
            </li>
            <li>
              <i className="dot ok" /> 체온 최근값{" "}
              <b>{temp[temp.length - 1].toFixed(1)}℃</b> <em>16분 전</em>
            </li>
          </ul>
        </article>

        <article className="card quick">
          <header className="card-head">
            <h3>빠른 액션</h3>
          </header>
          <div className="actions">
            <button className="pill">알림 일시정지</button>
            <button className="pill outline">상세 모니터 열기</button>
            <button className="cta" onClick={() => setCallOpen(true)}>
              보호자에게 전화
            </button>
          </div>
        </article>
      </section>

      {/* 보호자 전화 모달 */}
      {callOpen && (
        <div
          className="modal"
          role="dialog"
          aria-modal="true"
          onClick={() => setCallOpen(false)}>
          <div className="panel" onClick={(e) => e.stopPropagation()}>
            <div className="p-head">
              <strong>전화 연결</strong>
              <button
                className="x"
                onClick={() => setCallOpen(false)}
                aria-label="닫기">
                ✕
              </button>
            </div>
            <div className="p-body">
              <div className="phone">
                {PATIENT.guardian.name} <span className="sep">·</span>{" "}
                <b>{PATIENT.guardian.phone}</b>
              </div>
              <div className="desc">위 번호로 전화를 걸까요?</div>
            </div>
            <div className="p-actions">
              <button className="btn ghost" onClick={() => setCallOpen(false)}>
                취소
              </button>
              <button className="btn primary" onClick={confirmCall}>
                전화하기
              </button>
            </div>
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
          box-sizing: border-box;
        }

        .crumbs {
          display: flex;
          gap: 6px;
          margin: 6px 0 8px;
        }
        .chip {
          display: inline-flex;
          align-items: center;
          height: 26px;
          padding: 0 10px;
          border: 1px solid #dbe7ff;
          border-radius: 999px;
          background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
          color: #1f2b48;
          font-weight: 700;
          font-size: 12px;
        }

        .title {
          margin: 4px 0 6px;
          font-size: 28px;
          letter-spacing: -0.2px;
          color: #13203b;
          line-height: 1.2;
        }
        .title .muted {
          font-size: 13px;
          font-weight: 600;
          color: #6b7aa8;
        }
        @media (max-width: 640px) {
          .title {
            font-size: 22px;
          }
          .title .muted {
            font-size: 11px;
          }
        }

        .meta {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
        }
        .status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 24px;
          padding: 0 10px;
          border-radius: 999px;
          font-weight: 800;
          font-size: 12px;
          border: 1px solid transparent;
        }
        .status.ok {
          background: #e9fbf1;
          color: #0f9d58;
          border-color: #c8f2da;
        }
        .status.warn {
          background: #fff7ed;
          color: #b45309;
          border-color: #fed7aa;
        }
        .status.danger {
          background: #fef2f2;
          color: #b91c1c;
          border-color: #fecaca;
        }
        .role {
          color: #4a5d87;
          font-weight: 700;
          font-size: 13px;
        }
        .back {
          margin-left: auto;
          border: 1px solid #dbe7ff;
          background: #fff;
          border-radius: 10px;
          padding: 6px 10px;
          font-weight: 700;
          color: #1e3a8a;
        }

        /* KPI 3장 그리드: 모바일 1열 → 태블릿 2열 → 데스크톱 3열 */
        .grid {
          display: grid;
          grid-template-columns: 1fr; /* 기본: 세로(1열) */
          gap: 16px;
          margin: 16px 0 8px;
        }
        @media (min-width: 640px) {
          .grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (min-width: 980px) {
          .grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        .stack {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          margin: 8px 0 0;
        }

        .card {
          background: #fff;
          border: 1px solid #e3edff;
          border-radius: 18px;
          box-shadow: 0 10px 22px rgba(21, 44, 84, 0.06);
          padding: 14px 14px 16px;
          box-sizing: border-box;
          overflow: hidden;
          isolation: isolate;
          margin-bottom: 2px;
        }
        .card-head {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 10px;
        }
        h3 {
          margin: 0;
          font-size: 16px;
          color: #0f1e3e;
        }
        .tiny {
          font-size: 12px;
          color: #789;
        }
        .kpi .kpi-val {
          font-size: 28px;
          font-weight: 800;
          color: #10224d;
          margin: 6px 0 4px;
        }

        .heat-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 8px;
        }
        .heat-title {
          margin: 0;
          font-size: 18px;
          color: #0f1e3e;
        }
        .chips {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .pill {
          height: 32px;
          padding: 0 12px;
          border-radius: 999px;
          border: 1px solid #dbe7ff;
          background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
          font-weight: 800;
          color: #15336b;
        }
        .pill.outline {
          background: #fff;
        }
        .pill.ghost {
          background: #fff;
          color: #41568a;
        }
        .pill.sm {
          height: 28px;
          padding: 0 10px;
          font-size: 12px;
        }

        .svg-wrap {
          width: 100%;
          max-width: 720px;
          margin: 6px auto 4px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .heat-svg {
          width: 100%;
          height: auto;
          display: block;
        }

        .legend {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-top: 10px;
          flex-wrap: wrap;
        }
        .legend-dots {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .legend-dots span {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #445;
        }
        .dot {
          display: inline-block;
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .dot.ok {
          background: #22c55e;
        }
        .dot.cold {
          background: #bfe3ff;
        }
        .dot.warm {
          background: #f1b44e;
        }
        .dot.hot {
          background: #ef4444;
        }

        .logs .log-list {
          list-style: none;
          margin: 6px 0 0;
          padding: 0;
          display: grid;
          gap: 10px;
        }
        .logs li {
          display: flex;
          align-items: center;
          gap: 10px;
          justify-content: space-between;
        }
        .logs li b {
          color: #0f1e3e;
        }
        .logs li em {
          color: #7a8;
          font-style: normal;
        }

        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .cta {
          margin-left: auto;
          border-radius: 12px;
          padding: 10px 16px;
          border: 1px solid #cfe0ff;
          background: #2e63e7;
          color: #fff;
          font-weight: 800;
          box-shadow: 0 6px 14px rgba(46, 99, 231, 0.18);
        }

        /* 모달 */
        .modal {
          position: fixed;
          inset: 0;
          background: rgba(10, 20, 40, 0.28);
          backdrop-filter: blur(2px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 60;
        }
        .panel {
          width: min(92vw, 420px);
          background: #fff;
          border: 1px solid #e1e9ff;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(21, 44, 84, 0.18);
          overflow: hidden;
        }
        .p-head {
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
        .p-body {
          padding: 14px;
        }
        .phone {
          font-size: 16px;
          font-weight: 800;
          color: #0f1e3e;
        }
        .phone .sep {
          opacity: 0.4;
          padding: 0 6px;
        }
        .desc {
          margin-top: 6px;
          color: #456;
          font-size: 13px;
        }
        .p-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
          padding: 12px 14px;
          background: #f8fbff;
          border-top: 1px solid #eef3fb;
        }
        .btn {
          height: 36px;
          padding: 0 14px;
          border-radius: 12px;
          font-weight: 800;
          border: 1px solid #e1e9ff;
          background: #fff;
        }
        .btn.ghost {
          color: #0b1b33;
        }
        .btn.primary {
          background: #2e63e7;
          color: #fff;
          border-color: #2e63e7;
          box-shadow: 0 6px 14px rgba(46, 99, 231, 0.18);
        }
      `}</style>
    </main>
  );
}
