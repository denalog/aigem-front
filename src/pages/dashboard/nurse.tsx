import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";

// 알림 내역(없어도 안전)
const AlertHistory = dynamic(
  () =>
    import("../../components/AlertHistory").catch(
      () => () => <div style={{ padding: 12 }}>알림 내역을 불러올 수 없습니다.</div>
    ),
  { ssr: false }
);

type Status = "안정" | "주의" | "위험";
type WardId = "A" | "B";

interface Patient {
  id: number;
  ward: WardId;      // 'A' | 'B'
  floor: number;     // A:1~4, B:1~3
  roomNo: number;    // 1~5
  code: string;      // 예: A-304호
  name: string;
  status: Status;
  last: string;      // '2분 전' 등
  doctor: string;    // 담당 의사
}

const WARDS = [
  { id: "A" as WardId, label: "A병동", floors: [1, 2, 3, 4] },
  { id: "B" as WardId, label: "B병동", floors: [1, 2, 3] },
];

const NAMES   = ["김철수","박지은","이영희","정민수","한서윤","이상훈","조유리","최진혁","오세훈","문가영"];
const DOCTORS = ["김도윤","박민호","이수정","최우진","정가람","한태훈"];
const STATUSES: Status[] = ["안정", "주의", "위험"];
const TIMES   = ["2분 전","5분 전","7분 전","12분 전","20분 전"];

/* ============================
   ▶ Hydration 오류 방지용: 고정 시드 PRNG
   - 서버/클라이언트 모두 같은 시퀀스를 생성
   ============================ */
const SEED = 1337;
let _seed = SEED;
function srnd() {
  // LCG: Numerical Recipes
  _seed = (_seed * 1664525 + 1013904223) >>> 0;
  return _seed / 4294967296;
}
function pick<T>(arr: T[]) {
  return arr[Math.floor(srnd() * arr.length)];
}

/** 중복 없는 병동/층/호 조합으로 20명 생성 (결정론적) */
function makePatients(count = 20): Patient[] {
  const used = new Set<string>();
  const out: Patient[] = [];
  let id = 1;

  while (out.length < count) {
    const ward = (srnd() < 0.5 ? "A" : "B") as WardId;
    const floors = WARDS.find(w => w.id === ward)!.floors;
    const floor  = floors[Math.floor(srnd() * floors.length)];
    const roomNo = 1 + Math.floor(srnd() * 5); // 1~5
    const key = `${ward}-${floor}-${roomNo}`;
    if (used.has(key)) continue;
    used.add(key);

    out.push({
      id: id++,
      ward,
      floor,
      roomNo,
      code: `${ward}-${floor}0${roomNo}호`,
      name: pick(NAMES),
      status: pick(STATUSES),
      last: pick(TIMES),
      doctor: pick(DOCTORS),
    });
  }

  return out.sort(
    (a, b) =>
      a.ward.localeCompare(b.ward) ||
      a.floor - b.floor ||
      a.roomNo - b.roomNo
  );
}

// 결정론적 더미 데이터 (SSR/CSR 동일)
const ALL: Patient[] = makePatients(20);

export default function NurseDashboard() {
  const router = useRouter();

  // 필터/검색
  const [wardFilter,   setWardFilter]   = useState<"전체" | WardId>("전체");
  const [floorFilter,  setFloorFilter]  = useState<number | "전체">("전체");
  const [statusFilter, setStatusFilter] = useState<"전체" | Status>("전체");
  const [q, setQ] = useState("");        // 이름/코드 검색
  const [docQ, setDocQ] = useState("");  // 담당의사 검색
  const [openAlerts, setOpenAlerts] = useState(false);

  // 기준 목록(병동/층/검색/담당의사만 반영) — 상태 칩 뱃지 카운트 계산용
  const base = useMemo(() => {
    let arr = ALL;
    if (wardFilter !== "전체") arr = arr.filter(p => p.ward === wardFilter);
    if (floorFilter !== "전체") arr = arr.filter(p => p.floor === floorFilter);

    const t = q.trim();
    if (t) arr = arr.filter(p => p.name.includes(t) || p.code.includes(t));

    const d = docQ.trim();
    if (d) arr = arr.filter(p => p.doctor.includes(d));

    return arr;
  }, [wardFilter, floorFilter, q, docQ]);

  const counts = useMemo(() => ({
    danger: base.filter(p => p.status === "위험").length,
    warn:   base.filter(p => p.status === "주의").length,
    ok:     base.filter(p => p.status === "안정").length,
  }), [base]);

  // 최종 표시(상태 필터까지 반영)
  const filtered = useMemo(() => {
    let arr = base;
    if (statusFilter !== "전체") arr = arr.filter(p => p.status === statusFilter);
    return arr;
  }, [base, statusFilter]);

  // 병동 → 층 → 환자 그룹핑
  const grouped = useMemo(() => {
    const wardMap = new Map<WardId, Map<number, Patient[]>>();
    filtered.forEach(p => {
      if (!wardMap.has(p.ward)) wardMap.set(p.ward, new Map());
      const fMap = wardMap.get(p.ward)!;
      if (!fMap.has(p.floor)) fMap.set(p.floor, []);
      fMap.get(p.floor)!.push(p);
    });
    for (const [, fMap] of wardMap) {
      for (const [, arr] of fMap) arr.sort((a, b) => a.roomNo - b.roomNo);
    }
    return wardMap;
  }, [filtered]);

  const availableFloors = useMemo(() => {
    if (wardFilter === "전체")
      return Array.from(new Set(base.map(p => p.floor))).sort((a, b) => a - b);
    return WARDS.find(w => w.id === wardFilter)!.floors;
  }, [wardFilter, base]);

  const goDetail = (p: Patient) => {
    router.push(`/dashboard/nurse?patient=${p.id}`);
  };

  const sDot = (s: Status) => (s === "안정" ? "ok" : s === "주의" ? "warn" : "danger");

  return (
    <main className="page">
      <div className="inner">

        {/* 헤더 */}
        <div className="head">
          <div className="title">
            <h1>실시간 모니터링</h1>
            <span className="live">
              <span className="dot ok glow" aria-hidden />
              연결됨
            </span>
          </div>

          {/* 1행: 상태 칩 + 검색들 + 알림내역 */}
          <div className="tools">
            <div className="statusChips" role="tablist" aria-label="상태 필터">
              <button className={`sbtn ${statusFilter === "전체" ? "on" : ""}`} onClick={() => setStatusFilter("전체")}>
                전체
              </button>

              <button
                className={`sbtn danger ${statusFilter === "위험" ? "on" : ""}`}
                onClick={() => setStatusFilter("위험")}
                aria-label={`위험 ${counts.danger}명`}
              >
                위험
                {counts.danger > 0 && <span className="badge">{counts.danger}</span>}
              </button>

              <button
                className={`sbtn warn ${statusFilter === "주의" ? "on" : ""}`}
                onClick={() => setStatusFilter("주의")}
                aria-label={`주의 ${counts.warn}명`}
              >
                주의
                {counts.warn > 0 && <span className="badge">{counts.warn}</span>}
              </button>

              <button
                className={`sbtn ok ${statusFilter === "안정" ? "on" : ""}`}
                onClick={() => setStatusFilter("안정")}
                aria-label={`안정 ${counts.ok}명`}
              >
                안정
                {counts.ok > 0 && <span className="badge">{counts.ok}</span>}
              </button>
            </div>

            {/* 검색영역: 환자/코드 + 담당 의사 */}
            <div className="searchGroup">
              <div className="search">
                <input
                  placeholder="이름/코드 검색 (예: 김철수, A-304)"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  aria-label="환자 검색"
                />
              </div>
              <div className="search">
                <input
                  list="doctorsList"
                  placeholder="담당 의사 검색 (예: 김도윤)"
                  value={docQ}
                  onChange={(e) => setDocQ(e.target.value)}
                  aria-label="담당 의사 검색"
                />
                <datalist id="doctorsList">
                  {Array.from(new Set(DOCTORS)).map((d) => (
                    <option key={d} value={d} />
                  ))}
                </datalist>
              </div>
            </div>

            <button className="alertBtn" onClick={() => setOpenAlerts(true)}>알림 내역</button>
          </div>

          {/* 2행: 병동/층 선택 */}
          <div className="views">
            <div className="wardChips" role="tablist" aria-label="병동 선택">
              <button className={`wbtn ${wardFilter === "전체" ? "on" : ""}`} onClick={() => { setWardFilter("전체"); setFloorFilter("전체"); }}>
                전체
              </button>
              {WARDS.map(w => (
                <button
                  key={w.id}
                  className={`wbtn ${wardFilter === w.id ? "on" : ""}`}
                  onClick={() => { setWardFilter(w.id); setFloorFilter("전체"); }}
                >
                  {w.label}
                </button>
              ))}
            </div>

            <div className="floorChips" role="tablist" aria-label="층 선택">
              <button className={`fbtn ${floorFilter === "전체" ? "on" : ""}`} onClick={() => setFloorFilter("전체")}>전체</button>
              {availableFloors.map(f => (
                <button key={f} className={`fbtn ${floorFilter === f ? "on" : ""}`} onClick={() => setFloorFilter(f)}>{f}층</button>
              ))}
            </div>
          </div>
        </div>

        {/* 본문: 병동 → 층 → 카드 */}
        <div className="sections">
          {(wardFilter === "전체" ? WARDS.map(w => w.id) : [wardFilter]).map(ward => {
            const floorsMap = grouped.get(ward as WardId);
            if (!floorsMap) return null;

            const wardLabel = WARDS.find(w => w.id === ward)!.label;
            const keys = Array.from(floorsMap.keys()).sort((a, b) => a - b)
              .filter(f => floorFilter === "전체" || f === floorFilter);
            if (keys.length === 0) return null;

            return (
              <section key={ward} className="wardSection">
                <div className="wardHead">{wardLabel}</div>

                {keys.map(f => {
                  const items = floorsMap.get(f)!;
                  return (
                    <div key={f} className="floorBlock">
                      <div className="floorHead">{f}층</div>
                      <div className="grid">
                        {items.map(p => (
                          <article key={p.id} className="card" role="button" tabIndex={0}
                            onClick={() => goDetail(p)}
                            onKeyDown={(e) => e.key === "Enter" && goDetail(p)}>
                            <div className="row1">
                              <div className="avatar" aria-hidden>{p.name.charAt(0)}</div>
                              <div className="meta">
                                <div className="name">{p.name}</div>
                                <div className="sub">
                                  {p.code} · {p.last}
                                </div>
                              </div>
                              <div className={`status ${sDot(p.status)}`}>
                                <span className={`dot ${sDot(p.status)}`} aria-hidden />
                                {p.status}
                              </div>
                            </div>

                            {/* 간호사 전용: 담당 의사 뱃지 */}
                            <div className="rowBadge">
                              <span className="chip">담당 의사 · {p.doctor}</span>
                            </div>

                            <div className="row2">
                              <div className="liveRow">
                                <span className={`dot ${sDot(p.status)}`} aria-hidden />
                                실시간 모니터링
                              </div>
                              <button className="detail" onClick={(e) => { e.stopPropagation(); goDetail(p); }}>상세보기</button>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </section>
            );
          })}
        </div>
      </div>

      {/* 알림 내역 모달 */}
      {openAlerts && (
        <div className="modal" role="dialog" aria-modal="true" onClick={() => setOpenAlerts(false)}>
          <div className="panel" onClick={(e) => e.stopPropagation()}>
            <div className="mhead">
              <strong>알림 내역</strong>
              <button className="x" onClick={() => setOpenAlerts(false)} aria-label="닫기">✕</button>
            </div>
            <div className="mbody">
              <AlertHistory />
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .page{ min-height:100vh; background:linear-gradient(135deg,#e9f2ff 0%, #f6f9ff 100%); padding:12px 16px 28px; }
        .inner{ max-width:1120px; margin:0 auto; }

        .head{ display:flex; flex-direction:column; gap:12px; margin:6px 0 10px; }
        .title{ display:flex; align-items:center; gap:10px; }
        .title h1{ margin:0; font-size:20px; font-weight:900; color:#0b1b33; }
        .live{ display:inline-flex; align-items:center; gap:6px; color:#2a4d8f; font-weight:800; font-size:12px; }
        .dot{ width:8px; height:8px; border-radius:999px; display:inline-block; }
        .glow{ box-shadow:0 0 10px rgba(34,197,94,.55); }
        .ok{ background:#22c55e; }
        .warn{ background:#f59e0b; }
        .danger{ background:#ef4444; animation:pulseDanger 1.2s ease-in-out infinite; }
        @keyframes pulseDanger{
          0%{ transform:scale(1); box-shadow:0 0 10px rgba(239,68,68,.40); }
          50%{ transform:scale(1.06); box-shadow:0 0 16px rgba(239,68,68,.60); }
          100%{ transform:scale(1); box-shadow:0 0 10px rgba(239,68,68,.40); }
        }

        .tools{ display:grid; grid-template-columns:1fr; gap:8px; }
        @media(min-width:880px){ .tools{ grid-template-columns:auto 1fr auto; align-items:center; } }

        .statusChips{
          display:flex; gap:8px;
          overflow:visible; padding:6px 2px 2px;
        }
        .sbtn{
          height:32px; padding:0 12px; border-radius:999px; border:1px solid #dbe7ff;
          background:#f4f8ff; color:#3457b1; font-weight:900; font-size:12px;
          position:relative; overflow:visible;
        }
        .sbtn.on{ border-color:#4a86ff; background:#fff; box-shadow:0 6px 14px rgba(21,44,84,.12); color:#193a8a; }
        .sbtn.ok{ background:#ecfdf5; border-color:#bbf7d0; color:#047857; }
        .sbtn.warn{ background:#fff7ed; border-color:#fed7aa; color:#b45309; }
        .sbtn.danger{ background:#fef2f2; border-color:#fecaca; color:#b91c1c; }
        .badge{
          position:absolute; top:0; right:0; transform: translate(45%, -45%);
          min-width:18px; height:18px; padding:0 5px; border-radius:999px;
          font-size:11px; font-weight:800; display:grid; place-items:center; color:#fff;
          box-shadow:0 0 0 2px #fff; z-index:2;
        }
        .sbtn.danger .badge{ background:#ef4444; }
        .sbtn.warn   .badge{ background:#f59e0b; }
        .sbtn.ok     .badge{ background:#22c55e; }

        .searchGroup{ display:grid; grid-template-columns:1fr; gap:6px; }
        @media(min-width:520px){ .searchGroup{ grid-template-columns:1fr 1fr; } }
        .search input{
          width:100%; height:36px; padding:0 12px; border-radius:12px; border:1px solid #e1e9ff; background:#fff;
          box-shadow:0 2px 10px rgba(21,44,84,.06); font-weight:700; color:#0b1b33;
        }
        .alertBtn{
          height:36px; padding:0 14px; border-radius:12px; border:1px solid #e1e9ff; background:#fff;
          font-weight:900; color:#0b1b33; box-shadow:0 2px 10px rgba(21,44,84,.06);
        }

        .views{ display:grid; grid-template-columns:1fr; gap:8px; }
        @media(min-width:800px){ .views{ grid-template-columns:auto 1fr; align-items:center; } }
        .wardChips, .floorChips{ display:flex; gap:6px; overflow:auto; padding:2px; }
        .wbtn, .fbtn{
          height:30px; padding:0 12px; border-radius:999px; border:1px solid #e1e9ff; background:#fff;
          font-weight:800; color:#0b1b33; box-shadow:0 2px 8px rgba(21,44,84,.06);
        }
        .wbtn.on, .fbtn.on{ background:#2f6fe4; color:#fff; border-color:#2f6fe4; }

        .sections{ display:flex; flex-direction:column; gap:18px; }
        .wardSection{ display:flex; flex-direction:column; gap:12px; }
        .wardHead{
          position:sticky; top:0; z-index:1; padding:8px 12px; border:1px solid #d7e6ff; border-radius:12px;
          background:rgba(246,249,255,.9); backdrop-filter:blur(2px); color:#2a4d8f; font-weight:900;
        }
        .floorBlock{ display:flex; flex-direction:column; gap:8px; }
        .floorHead{ margin-left:2px; padding:4px 10px; border-left:3px solid #9db7ff; color:#2a4d8f; font-weight:900; }

        .grid{ display:grid; gap:10px; }
        @media(min-width:540px){ .grid{ grid-template-columns: 1fr 1fr; } }
        @media(min-width:960px){ .grid{ grid-template-columns: 1fr 1fr 1fr; } }

        .card{
          cursor:pointer; border:none; border-radius:16px;
          background:linear-gradient(180deg,#f7faff 0%, #ffffff 100%);
          box-shadow:0 6px 14px rgba(21,44,84,.08); padding:12px;
          transition: transform .12s ease, box-shadow .12s ease;
        }
        .card:hover{ transform: translateY(-2px); box-shadow:0 16px 24px rgba(21,44,84,.12); }

        .row1{ display:grid; grid-template-columns:auto 1fr auto; gap:10px; align-items:center; }
        .avatar{
          width:42px; height:42px; border-radius:999px; border:1px solid #cfe0ff;
          background: radial-gradient(100% 100% at 30% 20%, #e7efff 0%, #dce8ff 100%);
          color:#2a54b6; display:grid; place-items:center; font-weight:900;
        }
        .meta{ display:flex; flex-direction:column; }
        .name{ font-weight:900; color:#0b1b33; }
        .sub{ font-size:12px; color:#64748b; }

        .status{
          height:28px; padding:0 10px; border-radius:999px; border:1px solid #e1e9ff;
          display:inline-flex; align-items:center; gap:6px; font-weight:800; font-size:12px; background:#fff;
        }
        .status .dot.ok{ box-shadow:0 0 8px rgba(34,197,94,.28); }
        .status .dot.warn{ box-shadow:0 0 8px rgba(245,158,11,.28); }
        .status .dot.danger{ box-shadow:0 0 10px rgba(239,68,68,.4); }

        .rowBadge{ margin-top:8px; }
        .chip{
          display:inline-flex; align-items:center; height:22px; padding:0 10px;
          border-radius:999px; border:1px solid #e1e9ff; background:#fff;
          font-size:12px; color:#375670; font-weight:800;
        }

        .row2{ margin-top:10px; display:flex; align-items:center; justify-content:space-between; }
        .liveRow{ display:inline-flex; align-items:center; gap:6px; color:#375670; font-size:12px; font-weight:800; }
        .detail{
          height:30px; padding:0 12px; border-radius:10px; border:1px solid #e1e9ff; background:#fff;
          font-weight:800; color:#0b1b33; box-shadow:0 2px 8px rgba(21,44,84,.06);
        }

        .modal{ position:fixed; inset:0; background:rgba(10,20,40,.28); backdrop-filter:blur(2px); display:flex;
          align-items:center; justify-content:center; z-index:40; }
        .panel{ width:min(92vw, 760px); max-height:80vh; overflow:auto; background:#fff; border-radius:16px;
          border:1px solid #e1e9ff; box-shadow:0 20px 40px rgba(21,44,84,.18); }
        .mhead{ display:flex; align-items:center; justify-content:space-between; padding:10px 12px; border-bottom:1px solid #eef3fb; }
        .x{ width:32px; height:32px; border-radius:10px; border:1px solid #e1e9ff; background:#fff; }
        .mbody{ padding:8px; }
      `}</style>
    </main>
  );
}
