import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";

/* SSR→CSR 불일치 방지(필요시) */
function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

/* 데모 시계열 */
function makeSeries(n = 40, base = 70, drift = 1.5) {
  const out: number[] = [];
  let v = base;
  for (let i = 0; i < n; i++) {
    v += (Math.random() - 0.5) * drift;
    out.push(Math.max(0, Math.round(v)));
  }
  return out;
}

/* 히트맵 샘플(정자세) */
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
        amp * Math.exp(-(((dx - x0) ** 2) / (2 * sx ** 2) + ((y - y0) ** 2) / (2 * sy ** 2)));
      const head = g(0, headY / rows, 0.06, 0.04, 0.78);
      const chest = g(0, chestY / rows, 0.09, 0.06, 1.0);
      const belly = g(0, (chestY + pelvisY) / (2 * rows), 0.10, 0.07, 0.9);
      const pelvis = g(0, pelvisY / rows, 0.10, 0.06, 0.95);
      const legs = g(0, legsY / rows, 0.12, 0.09, 0.85);
      const noise = 0.02 * Math.random();

      let t = head + chest + belly + pelvis + legs + noise;
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
function Spark({ series, stroke = "#3b82f6" }: { series: number[]; stroke?: string }) {
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
  const d = series.map((v, i) => `${i ? "L" : "M"} ${sx(i)} ${sy(v)}`).join(" ");
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="trend">
      <path d={d} fill="none" stroke={stroke} strokeWidth={3} strokeLinecap="round" />
      <circle cx={sx(series.length - 1)} cy={sy(series[series.length - 1])} r={3.5} fill={stroke} />
    </svg>
  );
}

export default function PatientDetail() {
  useMounted(); // 필요시 사용
  const router = useRouter();
  const { role = "doctor", pid = "734928" } = router.query as { role?: string; pid?: string };

  const bpm = useMemo(() => makeSeries(40, 92, 2.0), []);
  const rpm = useMemo(() => makeSeries(40, 18, 0.8), []);
  const temp = useMemo(() => makeSeries(40, 36.6, 0.2).map((v) => v / 10), []);
  const heatDots = useMemo(() => makeHumanPoseHeatmap(60, 120), []);

  /* 로그 버튼 핸들러 */
  const openLog = (type: string) => {
    // 여기서 모달 열기/페이지 이동으로 교체 가능
    alert(`[데모] ${type} 로그 보기`);
  };

  return (
    <main className="wrap">
      {/* 상단 */}
      <section className="header">
        <div className="crumbs">
          <span className="chip">A동</span>
          <span className="chip">3병동</span>
          <span className="chip">3층</span>
          <span className="chip">305호</span>
        </div>
        <h1 className="title">
          환자 상세 · <b>김수현</b> <span className="muted">#{pid}</span>
        </h1>
        <div className="meta">
          <span className="status ok">정상</span>
          <span className="role">역할: {role}</span>
          <button className="back" onClick={() => router.back()} aria-label="대시보드로">← 대시보드</button>
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
            <button className="pill sm ghost" onClick={() => openLog("BPM")}>로그</button>
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
            <button className="pill sm ghost" onClick={() => openLog("RPM")}>로그</button>
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
            <button className="pill sm ghost" onClick={() => openLog("체온")}>로그</button>
          </header>
          <div className="card-body">
            <div className="kpi-val">{temp[temp.length - 1].toFixed(1)}</div>
            <Spark series={temp.map((v) => Math.round(v * 10))} stroke="#10b981" />
          </div>
        </article>
      </section>

      {/* 히트맵 */}
      <article className="card heat">
        <header className="heat-head">
          <h3 className="heat-title">침대 압력/체온 분포</h3>
          <div className="chips">
            <button className="pill">1초 간격 데모</button>
            <button className="pill outline">자세 추정: 정자세</button>
            <button className="pill ghost" onClick={() => openLog("자세")}>자세 로그</button>
          </div>
        </header>

        <div className="svg-wrap" role="img" aria-label="정자세 히트맵">
          <svg className="heat-svg" viewBox="0 0 120 240" preserveAspectRatio="xMidYMid meet">
            <rect x="4" y="4" width="112" height="232" rx="8" fill="#eaf3ff" />
            {heatDots.map((d, idx) => {
              const px = 6 + (d.x / 60) * 108;
              const py = 6 + (d.y / 120) * 228;
              return <circle key={idx} cx={px} cy={py} r={0.65} fill={tempColor(d.t)} />;
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

      {/* 변화/로그/액션 */}
      <section className="stack">

        <article className="card logs">
          <header className="card-head">
            <h3>상태 로그</h3>
          </header>
          <ul className="log-list">
            <li><i className="dot ok" /> BPM 최근값 <b>{bpm[bpm.length - 1]}회/분</b> <em>2분 전</em></li>
            <li><i className="dot ok" /> RPM 최근값 <b>{rpm[rpm.length - 1]}회/분</b> <em>9분 전</em></li>
            <li><i className="dot ok" /> 체온 최근값 <b>{temp[temp.length - 1].toFixed(1)}℃</b> <em>16분 전</em></li>
          </ul>
        </article>

        <article className="card quick">
          <header className="card-head">
            <h3>빠른 액션</h3>
          </header>
          <div className="actions">
            <button className="pill">알림 일시정지</button>
            <button className="pill outline">상세 모니터 열기</button>
            <button className="cta" onClick={() => alert("보호자에게 전화 (데모)")}>보호자에게 전화</button>
          </div>
        </article>
      </section>

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
        .muted{ color:#6b7aa8; font-weight:700; }
        .meta{ display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
        .status{ display:inline-flex; align-items:center; gap:6px; height:24px; padding:0 10px; border-radius:999px; font-weight:800; font-size:12px; }
        .status.ok{ background:#e9fbf1; color:#0f9d58; border:1px solid #c8f2da; }
        .role{ color:#4a5d87; font-weight:700; font-size:13px; }
        .back{ margin-left:auto; border:1px solid #dbe7ff; background:#fff; border-radius:10px; padding:6px 10px; font-weight:700; color:#1e3a8a; }

        .grid{ display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:16px; margin:16px 0 8px; }
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
          background:linear-gradient(180deg,#f8fbff 0%, #ffffff 100%);
          font-weight:800; color:#15336b;
        }
        .pill.outline{ background:#fff; }
        .pill.ghost{ background:#fff; color:#41568a; }
        .pill.sm{ height:28px; padding:0 10px; font-size:12px; }

        .svg-wrap{ width:100%; max-width:720px; margin:6px auto 4px; display:flex; justify-content:center; align-items:center; }
        .heat-svg{ width:100%; height:auto; display:block; }

        .legend{ display:flex; align-items:center; justify-content:space-between; gap:10px; margin-top:10px; flex-wrap:wrap; }
        .legend-dots{ display:flex; align-items:center; gap:14px; }
        .legend-dots span{ display:inline-flex; align-items:center; gap:6px; font-size:12px; color:#445; }
        .dot{ display:inline-block; width:10px; height:10px; border-radius:50%; }
        .dot.ok{ background:#22c55e; }
        .dot.cold{ background:#bfe3ff; }
        .dot.warm{ background:#f1b44e; }
        .dot.hot{ background:#ef4444; }

        .trend-wrap{ display:grid; grid-template-columns:1fr; gap:12px; }
        .logs .log-list{ list-style:none; margin:6px 0 0; padding:0; display:grid; gap:10px; }
        .logs li{ display:flex; align-items:center; gap:10px; justify-content:space-between; }
        .logs li b{ color:#0f1e3e; }
        .logs li em{ color:#7a8; font-style:normal; }
        .logs .dot.ok{ margin-right:2px; }

        .actions{ display:flex; flex-wrap:wrap; gap:10px; }
        .cta{ margin-left:auto; border-radius:12px; padding:10px 16px; border:1px solid #cfe0ff; background:#2e63e7; color:#fff; font-weight:800; box-shadow:0 6px 14px rgba(46,99,231,.18); }

        @media (max-width:980px){
          .grid{ grid-template-columns:repeat(2, minmax(0,1fr)); }
        }
        @media (max-width:640px){
          .grid{ grid-template-columns:1fr; }
          .back{ margin-left:0; }
          .heat-head{ align-items:flex-start; }
          .chips{ width:100%; }
          .svg-wrap{ max-width:560px; margin:8px auto; }
        }
      `}</style>
    </main>
  );
}
