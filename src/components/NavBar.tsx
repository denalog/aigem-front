// src/components/NavBar.tsx
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";

/** 역할 타입 */
type Role = "doctor" | "nurse" | "patient" | "guardian" | "caregiver";

/** === 역할별 AlertHistory 로더 (동적 import + 안전 폴백) === */
const FallbackAlert = () => (
  <div style={{ padding: 12, color: "#334155" }}>알림 내역을 불러올 수 없습니다.</div>
);
// 공통 동적 로더 헬퍼
const makeDyn = (loader: () => Promise<any>) =>
  dynamic(() => loader().then((m) => m.default || m).catch(() => FallbackAlert), { ssr: false });

// ✅ 의사용 (철자 그대로 docter)
const DoctorAlertHistory    = makeDyn(() => import("./alerthistory/docter"));
const NurseAlertHistory     = makeDyn(() => import("./alerthistory/nurse"));
const PatientAlertHistory   = makeDyn(() => import("./alerthistory/patient"));
const GuardianAlertHistory  = makeDyn(() => import("./alerthistory/guardian"));
const CaregiverAlertHistory = makeDyn(() => import("./alerthistory/caregiver"));

/** 역할별 기본 프로필(라우트 기준으로 강제 적용) */
const DEFAULTS: Record<
  Role,
  { name: string; email?: string; id?: string; idLabel: "환자번호" | "면허번호" | "ID" }
> = {
  doctor:    { name: "김문수",  email: "munsu.kim@aigem.dev",    id: "doc001",   idLabel: "면허번호" },
  nurse:     { name: "박소연",  email: "soyeon.park@aigem.dev",  id: "NRS-0001", idLabel: "면허번호" },
  patient:   { name: "김복순",  email: "boksun.kim@aigem.dev",   id: "p001",     idLabel: "환자번호" },
  guardian:  { name: "이상훈",  email: "sanghoon.lee@aigem.dev", id: "g001",     idLabel: "ID" },
  caregiver: { name: "최은정",  email: "eunjeong.choi@aigem.dev",id: "CGV-0001", idLabel: "ID" },
};

export default function NavBar() {
  const router = useRouter();

  const [openMenu, setOpenMenu] = useState(false);
  const [openAlerts, setOpenAlerts] = useState(false);

  // 🔒 알림 팝오버가 열릴 때의 역할을 고정 (열려있는 동안만)
  const [alertRole, setAlertRole] = useState<Role | null>(null);

  const [userName, setUserName] = useState("유제나");
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [idLabel, setIdLabel] = useState<"환자번호" | "면허번호" | "ID">("ID");

  /** 현재 경로로부터 역할을 해석 (열고/닫을 때마다 재평가) */
  const resolveRole = (): Role => {
    const path = (router.asPath || router.pathname || "").toLowerCase();
    const m = path.match(/\/dashboard\/(doctor|nurse|guardian|caregiver|patient)\b/);
    if (m && m[1]) return m[1] as Role;
    if (router.pathname.toLowerCase().includes("doctor")) return "doctor";
    if (router.pathname.toLowerCase().includes("nurse")) return "nurse";
    if (router.pathname.toLowerCase().includes("guardian")) return "guardian";
    if (router.pathname.toLowerCase().includes("caregiver")) return "caregiver";
    if (router.pathname.toLowerCase().includes("patient")) return "patient";
    return "doctor";
  };

  /** 대시보드/프로필 경로 (경로 바뀔 때마다 재계산) */
  const dashPath    = useMemo(() => `/dashboard/${resolveRole()}`, [router.asPath]);
  const profilePath = useMemo(() => `/profile/${resolveRole()}`, [router.asPath]);

  /** 현재 표시할 역할: 팝오버 열릴 때 고정된 alertRole이 있으면 우선, 아니면 즉시 재평가 */
  const activeRole: Role = alertRole ?? resolveRole();

  /** 🔔 역할별 알림 컴포넌트 */
  const AlertComp = useMemo(() => {
    switch (activeRole) {
      case "doctor":    return DoctorAlertHistory;
      case "nurse":     return NurseAlertHistory;
      case "patient":   return PatientAlertHistory;
      case "guardian":  return GuardianAlertHistory;
      case "caregiver": return CaregiverAlertHistory;
      default:          return FallbackAlert;
    }
  }, [activeRole]);

  /** 기본 프로필을 라우트 기준으로 강제 적용 (쿼리가 있으면 우선) */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const roleNow = resolveRole();
    const qn  = typeof router.query.name === "string" ? router.query.name.trim() : "";
    const qe  = typeof router.query.email === "string" ? router.query.email.trim() : "";
    const qid = typeof router.query.id === "string" ? router.query.id.trim() : "";
    setUserName(qn || DEFAULTS[roleNow].name);
    setUserEmail(qe || DEFAULTS[roleNow].email || "");
    setUserId(qid || DEFAULTS[roleNow].id || "");
    setIdLabel(DEFAULTS[roleNow].idLabel);
  }, [router.query.name, router.query.email, router.query.id, router.asPath]);

  /** 라우팅 시작하면 팝오버 닫고 역할 고정 해제 */
  useEffect(() => {
    const closeAll = () => { setOpenAlerts(false); setOpenMenu(false); setAlertRole(null); };
    router.events.on("routeChangeStart", closeAll);
    return () => { router.events.off("routeChangeStart", closeAll); };
  }, [router.events]);

  /** ESC로 닫기 */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpenAlerts(false); setOpenMenu(false); setAlertRole(null); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /** 로고 클릭: 현재 역할의 대시보드로 이동 */
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/dashboard/${resolveRole()}`);
  };

  /** 팝오버 외부 클릭 닫기 */
  const alertsRef = useRef<HTMLDivElement | null>(null);
  const menuRef   = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onDown = (ev: MouseEvent) => {
      const t = ev.target as Node;
      if (openAlerts && alertsRef.current && !alertsRef.current.contains(t)) {
        resolveRole(); setOpenAlerts(false); setAlertRole(null);
      }
      if (openMenu && menuRef.current && !menuRef.current.contains(t)) {
        setOpenMenu(false);
      }
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [openAlerts, openMenu]);

  const surname = (userName || "").trim().charAt(0) || "N";

  /** 🔔 버튼 토글: 열고/닫을 때마다 항상 루트 검사 */
  const toggleAlerts = () => {
    setOpenAlerts(prev => {
      const next = !prev;
      const roleNow = resolveRole();
      setAlertRole(next ? roleNow : null);
      return next;
    });
    setOpenMenu(false);
  };

  /** 닫기 공통 핸들러 */
  const closeAlerts = () => {
    resolveRole();
    setOpenAlerts(false);
    setAlertRole(null);
  };

  return (
    <header className="nb">
      <div className="nb-inner">
        {/* 로고 */}
        <div className="left">
          <a href={dashPath} onClick={handleLogoClick} className="brand" aria-label="대시보드로 이동">
            <Image src="/logo_org.png" alt="AIGEM" width={120} height={28} priority />
          </a>
        </div>

        {/* 가운데 메뉴 (md 이상) */}
        <nav className="center" aria-label="주 메뉴">
          <Link href={dashPath} className={`pill ${router.asPath === dashPath ? "active" : ""}`}>대시보드</Link>
          <Link href={`${dashPath}#alerts`} className="pill">알림</Link>
          <Link href={`${dashPath}#settings`} className="pill">설정</Link>
        </nav>

        {/* 우측 버튼들 */}
        <div className="right">
          <button className="iconbtn" aria-label="알림" onClick={toggleAlerts}>
            <span className="badge">3</span>
            <span aria-hidden>🔔</span>
          </button>
          <button
            className="hamburger"
            onClick={() => { setOpenMenu(v => !v); setOpenAlerts(false); setAlertRole(null); }}
            aria-label="메뉴 열기"
          >
            ≡
          </button>
        </div>
      </div>

      {/* 반투명 오버레이 */}
      {(openAlerts || openMenu) && (
        <div className="overlay" onClick={() => { if (openAlerts) closeAlerts(); setOpenMenu(false); }} />
      )}

      {/* 알림 팝오버 */}
      {openAlerts && (
        <div className="alerts-popover" ref={alertsRef} role="dialog" aria-label="알림 내역">
          <div className="alerts-head">
            <strong>알림 내역</strong>
            <button className="x" onClick={closeAlerts} aria-label="닫기">✕</button>
          </div>
          <div className="alerts-body">
            <AlertComp />
          </div>
        </div>
      )}

      {/* 햄버거 드롭다운 카드 */}
      {openMenu && (
        <div className="menu-popover" ref={menuRef} role="dialog" aria-label="사용자 메뉴">
          <div className="menu-head">
            <Image src="/logo_org.png" alt="AIGEM" width={110} height={26} />
            <button className="x" onClick={() => setOpenMenu(false)} aria-label="닫기">✕</button>
          </div>

          {/* 사용자 카드 */}
          <div className="user-card">
            <div className="avatar-lg">{surname}</div>
            <div className="uinfo">
              <div className="name-line">
                <strong className="uname">{userName}</strong>
                {userId && <span className="chip">{idLabel} {userId}</span>}
              </div>
              <span className="muted">{userEmail || "로그인됨"}</span>
            </div>
          </div>

          {/* 가운데 정렬 메뉴 */}
          <nav className="menu-list">
            {/* ✅ 역할별 프로필 페이지로 이동 */}
            <Link href={profilePath} className="row" onClick={() => setOpenMenu(false)}>
              내 프로필
            </Link>

            {/* ✅ 알림 설정 고정 경로 */}
            <Link href="/settings/alert" className="row" onClick={() => setOpenMenu(false)}>
              알림 설정
            </Link>

            <hr />

            {/* ✅ 로그인 페이지로 이동 */}
            <Link href="/login" className="row danger" onClick={() => setOpenMenu(false)}>
              로그아웃
            </Link>
          </nav>
        </div>
      )}

      {/* === styled-jsx === */}
      <style jsx>{`
        .nb{
          position: sticky; top: 0; z-index: 20;
          backdrop-filter: blur(10px);
          background: color-mix(in oklab, #e9f2ff 70%, #fff 30%);
          border-bottom: 1px solid #d7e6ff;
        }
        .nb-inner{
          max-width: 1120px; margin: 0 auto; padding: 10px 16px;
          display: grid; grid-template-columns: auto 1fr auto;
          align-items: center; gap: 8px;
        }
        .center{ justify-self: center; display: none; gap: 8px; }
        .right{ justify-self: end; display: flex; align-items: center; gap: 8px; }
        .brand{ display:inline-flex; align-items:center; gap:8px }

        .pill{
          display:inline-flex; align-items:center; height:36px; padding:0 12px;
          border-radius:999px; border:1px solid #e1e9ff;
          background: linear-gradient(180deg,#f7faff 0%, #ffffff 100%);
          color:#0b1b33; font-weight:700; box-shadow:0 2px 8px rgba(21,44,84,.06);
          transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease;
        }
        .pill:hover{ transform: translateY(-1px); box-shadow:0 6px 14px rgba(21,44,84,.10); }
        .pill.active{ border-color:#4a86ff; box-shadow:0 8px 18px rgba(21,44,84,.12); }

        .iconbtn{
          position:relative; width:36px; height:36px; border-radius:999px;
          border:1px solid #e1e9ff; background:#fff;
          box-shadow:0 2px 8px rgba(21,44,84,.06); cursor:pointer;
          display:grid; place-items:center;
        }
        .badge{
          position:absolute; top:-5px; right:-6px; min-width:18px; height:18px;
          background:#ef4444; color:#fff; font-size:11px; border-radius:999px;
          display:grid; place-items:center; padding:0 5px; box-shadow:0 0 0 2px #fff;
          font-weight:800;
        }
        .hamburger{
          display:inline-flex; align-items:center; justify-content:center;
          width:36px; height:36px; border-radius:10px;
          border:1px solid #e1e9ff; background:#fff; box-shadow:0 2px 8px rgba(21,44,84,.06);
        }

        @media (min-width:768px){
          .center{ display:flex; }
        }

        /* 공용 오버레이 */
        .overlay{
          position: fixed; inset: 0; z-index: 30;
          background: rgba(10,20,40,.28);
          backdrop-filter: blur(2px);
        }

        /* 알림 팝오버 */
        .alerts-popover{
          position: fixed; top: 62px; right: 16px; z-index: 40;
          width: min(92vw, 380px); max-height: 70vh; overflow:auto;
          background:#fff; border:1px solid #e1e9ff; border-radius:16px;
          box-shadow: 0 12px 30px rgba(21,44,84,.14);
          animation: pop .12s ease;
        }
        .alerts-head{
          display:flex; align-items:center; justify-content:space-between;
          padding:10px 12px; border-bottom:1px solid #eef3fb;
          position: sticky; top:0; background:#fff;
          border-top-left-radius:16px; border-top-right-radius:16px;
        }
        .alerts-body{ padding:8px 8px 12px; }
        .x{ width:28px; height:28px; border-radius:8px; border:1px solid #e1e9ff; background:#fff; }
        @keyframes pop{ from{ transform: translateY(-6px); opacity:0 } to{ transform:none; opacity:1 } }

        /* 햄버거 드롭다운 카드 */
        .menu-popover{
          position: fixed; top: 62px; right: 16px; z-index: 40;
          width: min(92vw, 360px);
          background:#fff; border:1px solid #e1e9ff; border-radius:16px;
          box-shadow: 0 12px 30px rgba(21,44,84,.14);
          animation: pop .14s ease;
          display:flex; flex-direction:column; gap:10px; padding:10px;
        }
        .menu-head{
          display:flex; align-items:center; justify-content:space-between;
          padding:4px 2px 8px 2px; border-bottom:1px solid #eef3fb;
        }

        .user-card{
          display:flex; align-items:center; gap:12px;
          padding:12px; border-radius:16px; border:1px solid #e1e9ff;
          background: linear-gradient(180deg,#f7faff 0%, #ffffff 100%);
          box-shadow:0 4px 12px rgba(21,44,84,.06);
        }
        .avatar-lg{
          width:48px; height:48px; border-radius:999px; border:1px solid #cfe0ff;
          background: radial-gradient(100% 100% at 30% 20%, #e7efff 0%, #dce8ff 100%);
          color:#2a54b6; font-weight:800; display:grid; place-items:center; font-size:18px;
        }
        .uinfo{ display:flex; flex-direction:column; gap:4px; }
        .name-line{ display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
        .uname{ font-weight:800; color:#0b1b33; }
        .chip{
          font-size:12px; line-height:1; padding:6px 8px; border-radius:999px;
          border:1px solid #dbe7ff; background:#f4f8ff; color:#3457b1; font-weight:700;
        }
        .muted{ font-size:12px; color:#64748b; }

        .menu-list{ display:flex; flex-direction:column; gap:8px; }
        .menu-list :global(a.row){
          display:flex; align-items:center; justify-content:center;
          width:100%;
          height:52px; padding:0 12px;
          border-radius:14px; border:1px solid #e1e9ff;
          background: linear-gradient(180deg,#f7faff 0%, #ffffff 100%);
          color:#0b1b33; font-weight:800; letter-spacing:.2px;
          text-align:center;
          box-shadow:0 4px 12px rgba(21,44,84,.06);
          transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease;
        }
        .menu-list :global(a.row:hover){
          transform: translateY(-1px); box-shadow:0 10px 20px rgba(21,44,84,.10); border-color:#d1dcff;
        }
        .menu-list :global(a.row.danger){ color:#c24141; }

        hr{ border:0; border-top:1px solid #eef3fb; margin:6px 0 }
      `}</style>
    </header>
  );
}
