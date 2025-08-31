import { useMemo, useState } from "react";
import { useRouter } from "next/router";

/** ===== 고정 데이터 (김복순) ===== */
const PATIENT = {
  id: "p001",
  name: "김복순",
  ageText: "만 87세",
  locationText: "AIGEM 요양병원 · 본관 3층 305호",
  status: "위험" as "안정" | "주의" | "위험",
};
/** 연락처 (후에 회원가입과 연동 예정) */
const GUARDIAN = { name: "이상훈", phone: "010-1234-5678", label: "보호자" };
const CAREGIVER = { name: "최은정", phone: "010-9876-5432", label: "요양사" };

/** ===== 고정 시계열 (난수 없음, SSR/CSR 일치) ===== */
const BPM_SERIES = Array.from({ length: 40 }, (_, i) => 92 + Math.round(Math.sin((i + 2) / 3) * 3));
const RPM_SERIES = Array.from({ length: 40 }, (_, i) => 18 + Math.round(Math.sin(i / 5)));
const TEMP_SERIES = Array.from({ length: 40 }, (_, i) =>
  Math.round((36.6 + Math.sin(i / 8) * 0.2) * 10) / 10
);

/** ===== 히트맵(정자세) — 난수 제거 ===== */
type Dot = { x: number; y: number; t: number };
function makeHumanPoseHeatmap(cols = 60, rows = 120): Dot[] {
  const cx = cols / 2;
  const headY = rows * 0.14;
  const chestY = rows * 0.35;
  const pelvisY = rows * 0.62;
  const legsY = rows * 0.82;
  const dots: Dot[] = [];
  const g = (dx: number, y: number, x0: number, y0: number, sx: number, sy: number, amp: number) =>
    amp * Math.exp(-(((dx - x0) ** 2) / (2 * sx ** 2) + ((y - y0) ** 2) / (2 * sy ** 2)));

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const dx = (i - cx) / cols;
      const y = j / rows;
      const t =
        g(dx, y, 0, headY / rows, 0.06, 0.04, 0.78) +
        g(dx, y, 0, chestY / rows, 0.09, 0.06, 1.0) +
        g(dx, y, 0, (chestY + pelvisY) / (2 * rows), 0.10, 0.07, 0.9) +
        g(dx, y, 0, pelvisY / rows, 0.10, 0.06, 0.95) +
        g(dx, y, 0, legsY / rows, 0.12, 0.09, 0.85);
      dots.push({ x: i, y: j, t: Math.max(0, Math.min(1, t)) });
    }
  }
  return dots;
}
const heatColor = (t: number) => {
  const c = Math.max(0, Math.min(1, t));
  const r = Math.round(255 * c);
  const g = Math.round(160 * (1 - c) + 120 * c);
  const b = Math.round(255 * (1 - c));
  return `rgb(${r},${g},${b})`;
};

/** 스파크라인 */
function Spark({ series, stroke = "#3b82f6" }: { series: number[]; stroke?: string }) {
  const w = 320;
  const h = 72;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const sx = (i: number) => (i / (series.length - 1)) * (w - 6) + 3;
  const sy = (v: number) => (h - 8) - ((v - min) / (max - min || 1)) * (h - 16);
  const d = series.map((v, i) => `${i ? "L" : "M"} ${sx(i)} ${sy(v)}`).join(" ");
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="trend">
      <path d={d} fill="none" stroke={stroke} strokeWidth={3} strokeLinecap="round" />
      <circle cx={sx(series.length - 1)} cy={sy(series.at(-1) as number)} r={3.5} fill={stroke} />
    </svg>
  );
}

export default function PatientDashboard() {
  const router = useRouter();
  const heatDots = useMemo(() => makeHumanPoseHeatmap(60, 120), []);
  const [callModal, setCallModal] = useState<null | "guardian" | "caregiver">(null);

  const statusClass = PATIENT.status === "안정" ? "ok" : PATIENT.status === "주의" ? "warn" : "danger";

  const target =
    callModal === "guardian"
      ? { ...GUARDIAN, tel: GUARDIAN.phone.replace(/-/g, "") }
      : callModal === "caregiver"
      ? { ...CAREGIVER, tel: CAREGIVER.phone.replace(/-/g, "") }
      : null;

  return (
    <main className="wrap">
      {/* 상단 */}
      <section className="header">
        <div className="crumbs">
          <span className="chip">{PATIENT.locationText}</span>
        </div>
        <h1 className="title">
          환자 대시보드 · <b>{PATIENT.name}</b>
          <span className="age"> {PATIENT.ageText}</span>
          <span className="muted"> · #{PATIENT.id}</span>
        </h1>
        <div className="meta">
          <span className={`status ${statusClass}`}>{PATIENT.status}</span>
        </div>
      </section>

      {/* KPI (세로로 드롭) */}
      <section className="grid">
        <article className="card kpi">
          <header className="card-head">
            <div>
              <h3>심박수 BPM</h3>
              <span className="tiny">X: 시간 흐름(좌→우), Y: BPM</span>
            </div>
            <button className="pill sm ghost" onClick={() => alert("[데모] BPM 로그")}>로그</button>
          </header>
          <div className="card-body">
            <div className="kpi-val">{BPM_SERIES.at(-1)}</div>
            <Spark series={BPM_SERIES} stroke="#3b82f6" />
          </div>
        </article>

        <article className="card kpi">
          <header className="card-head">
            <div>
              <h3>호흡 RPM</h3>
              <span className="tiny">X: 시간 흐름(좌→우), Y: RPM</span>
            </div>
            <button className="pill sm ghost" onClick={() => alert("[데모] RPM 로그")}>로그</button>
          </header>
          <div className="card-body">
            <div className="kpi-val">{RPM_SERIES.at(-1)}</div>
            <Spark series={RPM_SERIES} stroke="#8b5cf6" />
          </div>
        </article>

        <article className="card kpi">
          <header className="card-head">
            <div>
              <h3>체온 ℃</h3>
              <span className="tiny">X: 시간 흐름(좌→우), Y: 체온(℃)</span>
            </div>
            <button className="pill sm ghost" onClick={() => alert("[데모] 체온 로그")}>로그</button>
          </header>
          <div className="card-body">
            <div className="kpi-val">{TEMP_SERIES.at(-1)?.toFixed(1)}</div>
            <Spark series={TEMP_SERIES.map((v) => Math.round(v * 10))} stroke="#10b981" />
          </div>
        </article>
      </section>

      {/* 히트맵 */}
      <article className="card heat">
        <header className="heat-head">
          <h3 className="heat-title">침대 압력/체온 분포</h3>
          <div className="chips">
            <button className="pill outline">자세 추정: 정자세</button>
          </div>
        </header>

        <div className="svg-wrap" role="img" aria-label="정자세 히트맵">
          <svg className="heat-svg" viewBox="0 0 120 240" preserveAspectRatio="xMidYMid meet">
            <rect x="4" y="4" width="112" height="232" rx="8" fill="#eaf3ff" />
            {heatDots.map((d, idx) => {
              const px = 6 + (d.x / 60) * 108;
              const py = 6 + (d.y / 120) * 228;
              return <circle key={idx} cx={px} cy={py} r={0.65} fill={heatColor(d.t)} />;
            })}
          </svg>
        </div>

        <footer className="legend">
          <span className="tiny">좌→우: 침대 좌/우, 상→하: 머리→발</span>
          <div className="legend-dots">
            <span><i className="dot cold" />차가움</span>
            <span><i className="dot warm" />따뜻함</span>
            <span><i className="dot hot" />뜨거움</span>
          </div>
        </footer>
      </article>

      {/* 연락/빠른 액션 */}
      <section className="stack">
        <article className="card quick">
          <header className="card-head">
            <h3>연락하기</h3>
          </header>
          <div className="actions">
            <button className="cta" onClick={() => setCallModal("guardian")}>
              보호자에게 연락하기
            </button>
            <button className="pill" onClick={() => setCallModal("caregiver")}>
              요양사에게 연락하기
            </button>
          </div>
        </article>
      </section>

      {/* 전화 확인 모달 */}
      {callModal && target && (
        <div className="modal" role="dialog" aria-modal="true" onClick={() => setCallModal(null)}>
          <div className="panel" onClick={(e) => e.stopPropagation()}>
            <header className="mhead">
              <strong>전화하기</strong>
              <button className="x" onClick={() => setCallModal(null)} aria-label="닫기">✕</button>
            </header>
            <div className="mbody">
              <p className="call-title">
                {target.label} <b>{target.name}</b>님에게 전화를 걸까요?
              </p>
              <p className="call-phone">{target.phone}</p>
              <p className="hint">연결을 누르면 전화 앱이 실행됩니다.</p>
              <div className="btns">
                <button className="btn ghost" onClick={() => setCallModal(null)}>취소</button>
                <a className="btn primary" href={`tel:${target.tel}`}>전화하기</a>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        :global(html, body){ background:#f6f9ff; }
        .wrap{ max-width:1040px; margin:0 auto; padding:16px 14px 80px; box-sizing:border-box; }

        .crumbs{ display:flex; gap:6px; margin:6px 0 8px; }
        .chip{
          display:inline-flex; align-items:center; height:26px; padding:0 10px;
          border:1px solid #dbe7ff; border-radius:999px;
          background:linear-gradient(180deg,#f8fbff 0%, #ffffff 100%);
          color:#1f2b48; font-weight:700; font-size:12px;
        }
        .title{ margin:4px 0 6px; font-size:28px; letter-spacing:-0.2px; color:#13203b; }
        .age{ color:#6b7aa8; font-weight:700; font-size:12px; margin-left:6px; } /* 모바일에서 작게 */
        .muted{ color:#6b7aa8; font-weight:700; }
        .meta{ display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
        .status{ display:inline-flex; align-items:center; gap:6px; height:24px; padding:0 10px; border-radius:999px; font-weight:800; font-size:12px; }
        .status.ok{ background:#e9fbf1; color:#0f9d58; border:1px solid #c8f2da; }
        .status.warn{ background:#fff7ed; color:#b45309; border:1px solid #fed7aa; }
        .status.danger{ background:#fef2f2; color:#b91c1c; border:1px solid #fecaca; }
        .back{ margin-left:auto; border:1px solid #dbe7ff; background:#fff; border-radius:10px; padding:6px 10px; font-weight:700; color:#1e3a8a; }

        /* KPI: 항상 세로 드롭 */
        .grid{ display:grid; grid-template-columns:1fr; gap:16px; margin:16px 0 8px; }
        .stack{ display:grid; grid-template-columns:1fr; gap:16px; margin:8px 0 0; }

        .card{
          background:#fff; border:1px solid #e3edff; border-radius:18px;
          box-shadow:0 10px 22px rgba(21,44,84,.06);
          padding:14px 14px 16px; box-sizing:border-box;
          overflow:hidden; isolation:isolate; margin-bottom:2px;
        }
        .card-head{ display:flex; align-items:end; justify-content:space-between; gap:8px; flex-wrap:wrap; margin-bottom:10px; }
        h3{ margin:0; font-size:16px; color:#0f1e3e; }
        .tiny{ font-size:12px; color:#789; }
        .kpi .kpi-val{ font-size:28px; font-weight:800; color:#10224d; margin:6px 0 4px; }

        .heat-head{ display:flex; align-items:center; justify-content:space-between; gap:8px; flex-wrap:wrap; margin-bottom:8px; }
        .heat-title{ margin:0; font-size:18px; color:#0f1e3e; }
        .chips{ display:flex; gap:8px; flex-wrap:wrap; }
        .pill{
          height:32px; padding:0 12px; border-radius:999px; border:1px solid #dbe7ff;
          background:linear-gradient(180deg,#f8fbff 0%,#ffffff 100%);
          font-weight:800; color:#15336b;
        }
        .pill.ghost{ background:#fff; color:#41568a; }
        .pill.sm{ height:28px; padding:0 10px; font-size:12px; }
        .cta{
          border-radius:12px; padding:10px 16px; border:1px solid #cfe0ff;
          background:#2e63e7; color:#fff; font-weight:800; box-shadow:0 6px 14px rgba(46,99,231,.18);
        }

        .svg-wrap{ width:100%; max-width:720px; margin:6px auto 4px; display:flex; justify-content:center; align-items:center; }
        .heat-svg{ width:100%; height:auto; display:block; }

        .legend{ display:flex; align-items:center; justify-content:space-between; gap:10px; margin-top:10px; flex-wrap:wrap; }
        .legend-dots{ display:flex; align-items:center; gap:14px; }
        .legend-dots span{ display:inline-flex; align-items:center; gap:6px; font-size:12px; color:#445; }
        .dot{ display:inline-block; width:10px; height:10px; border-radius:50%; }
        .dot.cold{ background:#bfe3ff; }
        .dot.warm{ background:#f1b44e; }
        .dot.hot{ background:#ef4444; }

        .actions{ display:flex; flex-wrap:wrap; gap:10px; }

        /* 모달 */
        .modal{ position:fixed; inset:0; background:rgba(10,20,40,.28); backdrop-filter:blur(2px); display:flex; align-items:center; justify-content:center; z-index:40; }
        .panel{ width:min(92vw, 420px); background:#fff; border-radius:16px; border:1px solid #e1e9ff; box-shadow:0 20px 40px rgba(21,44,84,.18); overflow:hidden; }
        .mhead{ display:flex; align-items:center; justify-content:space-between; padding:10px 12px; border-bottom:1px solid #eef3fb; }
        .x{ width:32px; height:32px; border-radius:10px; border:1px solid #e1e9ff; background:#fff; }
        .mbody{ padding:16px; }
        .call-title{ margin:2px 0 6px; font-weight:800; color:#0f1e3e; }
        .call-phone{ font-size:18px; font-weight:900; color:#16357a; letter-spacing:1px; }
        .hint{ color:#6b7aa8; font-size:12px; margin-top:6px; }
        .btns{ display:flex; justify-content:flex-end; gap:8px; margin-top:16px; }
        .btn{ height:36px; padding:0 14px; border-radius:10px; font-weight:800; }
        .btn.ghost{ border:1px solid #e1e9ff; background:#fff; color:#0b1b33; }
        .btn.primary{ border:1px solid #2e63e7; background:#2e63e7; color:#fff; }
      `}</style>
    </main>
  );
}
