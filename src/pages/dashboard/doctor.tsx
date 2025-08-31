// src/pages/dashboard/doctor.tsx
import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { demoDoctor } from "../../data/roles/doctor";

// 알림 내역 (없어도 안전)
const AlertHistory = dynamic(
  () =>
    import("../../components/alerthistory/docter").catch(() => () => (
      <div style={{ padding: 12 }}>알림 내역을 불러올 수 없습니다.</div>
    )),
  { ssr: false }
);

type Status = "안정" | "주의" | "위험";

interface Patient {
  id: number;
  floor: number;      // 1~4
  roomNo: number;     // 1~5
  code: string;       // 예: 103호
  name: string;
  age: number;        // ✅ 만 나이 표기용(고정값)
  status: Status;
  last: string;       // '2분 전' 등
}

/** ✅ 고정 8명 (난수/SSR 없음, 김복순 id=1) */
const PATIENTS: Patient[] = [
  { id: 1, floor: 1, roomNo: 3, code: "103호", name: "김복순", age: 87, status: "위험", last: "2분 전" },
  { id: 2, floor: 1, roomNo: 5, code: "105호", name: "최영만", age: 81, status: "주의", last: "5분 전" },
  { id: 3, floor: 2, roomNo: 1, code: "201호", name: "박정자", age: 78, status: "안정", last: "12분 전" },
  { id: 4, floor: 2, roomNo: 4, code: "204호", name: "이명자", age: 84, status: "주의", last: "7분 전" },
  { id: 5, floor: 3, roomNo: 2, code: "302호", name: "오병철", age: 76, status: "안정", last: "20분 전" },
  { id: 6, floor: 3, roomNo: 5, code: "305호", name: "한순애", age: 90, status: "안정", last: "5분 전" },
  { id: 7, floor: 4, roomNo: 1, code: "401호", name: "정해철", age: 79, status: "주의", last: "7분 전" },
  { id: 8, floor: 4, roomNo: 3, code: "403호", name: "윤말자", age: 85, status: "위험", last: "2분 전" },
];

export default function DoctorDashboard() {
  const router = useRouter();
  const patients = PATIENTS; // 고정 스냅샷

  // 필터/검색
  const [floorFilter, setFloorFilter] = useState<number | "전체">("전체");
  const [statusFilter, setStatusFilter] = useState<"전체" | Status>("전체");
  const [q, setQ] = useState("");
  const [openAlerts, setOpenAlerts] = useState(false);

  // 검색/상태/층 필터 적용
  const filtered = useMemo(() => {
    let arr = patients;
    if (floorFilter !== "전체") arr = arr.filter((p) => p.floor === floorFilter);
    if (statusFilter !== "전체") arr = arr.filter((p) => p.status === statusFilter);
    if (q.trim()) {
      const t = q.trim();
      arr = arr.filter((p) => p.name.includes(t) || p.code.includes(t));
    }
    return arr;
  }, [patients, floorFilter, statusFilter, q]);

  // 층 → 환자 그룹
  const groupedByFloor = useMemo(() => {
    const fMap = new Map<number, Patient[]>();
    filtered.forEach((p) => {
      if (!fMap.has(p.floor)) fMap.set(p.floor, []);
      fMap.get(p.floor)!.push(p);
    });
    for (const [, arr] of fMap) arr.sort((a, b) => a.roomNo - b.roomNo);
    return fMap;
  }, [filtered]);

  // 층 목록
  const availableFloors = useMemo(
    () => Array.from(new Set(patients.map((p) => p.floor))).sort((a, b) => a - b),
    [patients]
  );

  // ✅ 변경 1: 항상 김복순 상세 페이지로 이동
  const goDetail = () => router.push("/dashboard/doctor/patient/p001");

  const sDot = (s: Status) => (s === "안정" ? "ok" : s === "주의" ? "warn" : "danger");

  // 상단 카운트(층/검색만 반영)
  const base = useMemo(() => {
    let arr = patients;
    if (floorFilter !== "전체") arr = arr.filter((p) => p.floor === floorFilter);
    if (q.trim()) {
      const t = q.trim();
      arr = arr.filter((p) => p.name.includes(t) || p.code.includes(t));
    }
    return arr;
  }, [patients, floorFilter, q]);

  const counts = useMemo(
    () => ({
      danger: base.filter((p) => p.status === "위험").length,
      warn: base.filter((p) => p.status === "주의").length,
      ok: base.filter((p) => p.status === "안정").length,
    }),
    [base]
  );

  return (
    <main className="page">
      <div className="inner">
        {/* 헤더 */}
        <div className="head">
          <div className="title">
            <h1>실시간 모니터링</h1>
            <span className="who" title={`의사 ID: ${demoDoctor.id}`} aria-label={`담당 의사: ${demoDoctor.name}`}>
              👨‍⚕️ {demoDoctor.name} <span className="role">의사</span>
            </span>
            <span className="live">
              <span className="dot ok glow" aria-hidden />
              연결됨
            </span>
          </div>

          {/* 1행: 상태 버튼 + 검색 + 알림내역 */}
          <div className="tools">
            <div className="statusChips" role="tablist" aria-label="상태 필터">
              <button
                className={`sbtn ${statusFilter === "전체" ? "on" : ""}`}
                onClick={() => setStatusFilter("전체")}
              >
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

            <div className="search">
              <input
                placeholder="이름/코드 검색 (예: 김복순, 103호)"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                aria-label="검색"
              />
            </div>

            <button className="alertBtn" onClick={() => setOpenAlerts(true)}>
              알림 내역
            </button>
          </div>

          {/* 2행: 층 필터 */}
          <div className="views">
            <div className="floorChips" role="tablist" aria-label="층 선택">
              <button
                className={`fbtn ${floorFilter === "전체" ? "on" : ""}`}
                onClick={() => setFloorFilter("전체")}
              >
                전체
              </button>
              {availableFloors.map((f) => (
                <button
                  key={f}
                  className={`fbtn ${floorFilter === f ? "on" : ""}`}
                  onClick={() => setFloorFilter(f)}
                >
                  {f}층
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 본문: 층 → 카드 그리드 */}
        <div className="sections">
          {Array.from(groupedByFloor.keys())
            .sort((a, b) => a - b)
            .filter((f) => floorFilter === "전체" || f === floorFilter)
            .map((f) => {
              const items = groupedByFloor.get(f)!;
              return (
                <div key={f} className="floorBlock">
                  <div className="floorHead">{f}층</div>
                  <div className="grid">
                    {items.map((p) => (
                      <article
                        key={p.id}
                        className="card"
                        role="button"
                        tabIndex={0}
                        onClick={() => goDetail()}
                        onKeyDown={(e) => e.key === "Enter" && goDetail()}
                      >
                        <div className="row1">
                          <div className="avatar" aria-hidden>
                            {p.name.charAt(0)}
                          </div>
                          <div className="meta">
                            {/* ✅ 변경 2: 이름 옆 만 나이 표기 */}
                            <div className="name">
                              {p.name}
                              <span className="age"> · 만 {p.age}세</span>
                            </div>
                            <div className="sub">
                              {p.code} · {p.last}
                            </div>
                          </div>
                          <div className={`status ${sDot(p.status)}`}>
                            <span className={`dot ${sDot(p.status)}`} aria-hidden />
                            {p.status}
                          </div>
                        </div>
                        <div className="row2">
                          <div className="liveRow">
                            <span className={`dot ${sDot(p.status)}`} aria-hidden />
                            실시간 모니터링
                          </div>
                          <button
                            className="detail"
                            onClick={(e) => {
                              e.stopPropagation();
                              goDetail();
                            }}
                          >
                            상세보기
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
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
              <button className="x" onClick={() => setOpenAlerts(false)} aria-label="닫기">
                ✕
              </button>
            </div>
            <div className="mbody">
              <AlertHistory />
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .page{min-height:100vh;background:linear-gradient(135deg,#e9f2ff 0%,#f6f9ff 100%);padding:12px 16px 28px;}
        .inner{max-width:1120px;margin:0 auto;}
        .head{display:flex;flex-direction:column;gap:12px;margin:6px 0 10px;}
        .title{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
        .title h1{margin:0;font-size:20px;font-weight:900;color:#0b1b33;}
        .who{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;border:1px solid #d7e6ff;background:#eef3ff;color:#27477d;font-weight:900;font-size:12px;}
        .who .role{font-size:11px;color:#3b5ea7;margin-left:2px;}
        .live{display:inline-flex;align-items:center;gap:6px;color:#2a4d8f;font-weight:800;font-size:12px;}
        .dot{width:8px;height:8px;border-radius:999px;display:inline-block;}
        .glow{box-shadow:0 0 10px rgba(34,197,94,.55);}
        .ok{background:#22c55e;}
        .warn{background:#f59e0b;}
        .danger{background:#ef4444;animation:pulseDanger 1.2s ease-in-out infinite;}
        @keyframes pulseDanger{0%{transform:scale(1);box-shadow:0 0 10px rgba(239,68,68,.4);}50%{transform:scale(1.06);box-shadow:0 0 16px rgba(239,68,68,.6);}100%{transform:scale(1);box-shadow:0 0 10px rgba(239,68,68,.4);}}

        .tools{display:grid;grid-template-columns:1fr;gap:8px;}
        @media(min-width:800px){.tools{grid-template-columns:auto 1fr auto;align-items:center;}}

        .statusChips{display:flex;gap:8px;overflow:visible;padding:2px;}
        .sbtn{height:32px;padding:0 12px;border-radius:999px;border:1px solid #dbe7ff;background:#f4f8ff;color:#3457b1;font-weight:900;font-size:12px;overflow:visible;position:relative;}
        .sbtn.on{border-color:#4a86ff;background:#fff;box-shadow:0 6px 14px rgba(21,44,84,.12);color:#193a8a;}
        .sbtn.ok{background:#ecfdf5;border-color:#bbf7d0;color:#047857;}
        .sbtn.warn{background:#fff7ed;border-color:#fed7aa;color:#b45309;}
        .sbtn.danger{background:#fef2f2;border-color:#fecaca;color:#b91c1c;}
        .badge{position:absolute;top:-6px;right:-6px;min-width:18px;height:18px;padding:0 5px;border-radius:999px;font-size:11px;font-weight:800;display:grid;place-items:center;color:#fff;box-shadow:0 0 0 2px #fff;}
        .sbtn.danger .badge{background:#ef4444;}
        .sbtn.warn .badge{background:#f59e0b;}
        .sbtn.ok .badge{background:#22c55e;}

        .search input{width:100%;height:36px;padding:0 12px;border-radius:12px;border:1px solid #e1e9ff;background:#fff;box-shadow:0 2px 10px rgba(21,44,84,.06);font-weight:700;color:#0b1b33;}
        .alertBtn{height:36px;padding:0 14px;border-radius:12px;border:1px solid #e1e9ff;background:#fff;font-weight:900;color:#0b1b33;box-shadow:0 2px 10px rgba(21,44,84,.06);}

        .views{display:grid;grid-template-columns:1fr;gap:8px;}
        @media(min-width:800px){.views{grid-template-columns:auto;align-items:center;}}

        .floorChips{display:flex;gap:6px;overflow:auto;padding:2px;}
        .fbtn{height:30px;padding:0 12px;border-radius:999px;border:1px solid #e1e9ff;background:#fff;font-weight:800;color:#0b1b33;box-shadow:0 2px 8px rgba(21,44,84,.06);}
        .fbtn.on{background:#2f6fe4;color:#fff;border-color:#2f6fe4;}

        .sections{display:flex;flex-direction:column;gap:18px;}
        .floorBlock{display:flex;flex-direction:column;gap:8px;}
        .floorHead{margin-left:2px;padding:4px 10px;border-left:3px solid #9db7ff;color:#2a4d8f;font-weight:900;}
        .grid{display:grid;gap:10px;}
        @media(min-width:540px){.grid{grid-template-columns:1fr 1fr;}}
        @media(min-width:960px){.grid{grid-template-columns:1fr 1fr 1fr;}}
        .card{cursor:pointer;border:none;border-radius:16px;background:linear-gradient(180deg,#f7faff 0%,#ffffff 100%);box-shadow:0 6px 14px rgba(21,44,84,.08);padding:12px;transition:transform .12s ease,box-shadow .12s ease;}
        .card:hover{transform:translateY(-2px);box-shadow:0 16px 24px rgba(21,44,84,.12);}
        .row1{display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;}
        .avatar{width:42px;height:42px;border-radius:999px;border:1px solid #cfe0ff;background:radial-gradient(100% 100% at 30% 20%,#e7efff 0%,#dce8ff 100%);color:#2a54b6;display:grid;place-items:center;font-weight:900;}
        .meta{display:flex;flex-direction:column;}
        .name{font-weight:900;color:#0b1b33;}
        .age{font-size:12px;color:#94a3b8;margin-left:6px;font-weight:700;}
        .sub{font-size:12px;color:#64748b;}
        .status{height:28px;padding:0 10px;border-radius:999px;border:1px solid #e1e9ff;display:inline-flex;align-items:center;gap:6px;font-weight:800;font-size:12px;background:#fff;}
        .status .dot.ok{box-shadow:0 0 8px rgba(34,197,94,.28);}
        .status .dot.warn{box-shadow:0 0 8px rgba(245,158,11,.28);}
        .status .dot.danger{box-shadow:0 0 10px rgba(239,68,68,.4);}
        .row2{margin-top:10px;display:flex;align-items:center;justify-content:space-between;}
        .liveRow{display:inline-flex;align-items:center;gap:6px;color:#375670;font-size:12px;font-weight:800;}
        .detail{height:30px;padding:0 12px;border-radius:10px;border:1px solid #e1e9ff;background:#fff;font-weight:800;color:#0b1b33;box-shadow:0 2px 8px rgba(21,44,84,.06);}

        /* ✅ 모달 스타일(빠져 있던 부분) */
        .modal{
          position:fixed; inset:0; z-index:50;
          background:rgba(10,20,40,.28); backdrop-filter:blur(2px);
          display:flex; align-items:center; justify-content:center;
        }
        .panel{
          width:min(92vw, 760px); max-height:80vh; overflow:auto;
          background:#fff; border-radius:16px; border:1px solid #e1e9ff;
          box-shadow:0 20px 40px rgba(21,44,84,.18);
        }
        .mhead{
          display:flex; align-items:center; justify-content:space-between;
          padding:10px 12px; border-bottom:1px solid #eef3fb;
        }
        .x{
          width:32px; height:32px; border-radius:10px;
          border:1px solid #e1e9ff; background:#fff;
        }
        .mbody{ padding:8px; }
      `}</style>
    </main>
  );
}
