// src/components/NavBar.tsx
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";

// 알림 히스토리(없어도 안전)
const AlertHistory = dynamic(
  () =>
    import("./AlertHistory").catch(
      () => () => <div style={{ padding: 12, color: "#334155" }}>알림 내역을 불러올 수 없습니다.</div>
    ),
  { ssr: false }
);

export default function NavBar() {
  const router = useRouter();

  const [openMenu, setOpenMenu] = useState(false);   // 햄버거 드롭다운
  const [openAlerts, setOpenAlerts] = useState(false); // 알림 팝오버

  const [isAuthed, setIsAuthed] = useState(false);
  const [userName, setUserName] = useState("유제나");
  const [userEmail, setUserEmail] = useState("");

  // 카드에 표기되는 번호(환자번호/면허번호/기타)
  const [userId, setUserId] = useState("");
  const [idLabel, setIdLabel] = useState<"환자번호" | "면허번호" | "ID">("ID");

  // 경로에서 역할 추정 → 대시보드 경로
  const role = useMemo(() => {
    const p = router.pathname.toLowerCase();
    if (p.includes("doctor")) return "doctor";
    if (p.includes("nurse")) return "nurse";
    if (p.includes("guardian")) return "guardian";
    if (p.includes("patient")) return "patient";
    return "doctor";
  }, [router.pathname]);
  const dashPath = `/dashboard/${role}`;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ok = localStorage.getItem("isAuthed") === "true" || !!localStorage.getItem("userName");
    setIsAuthed(ok);

    const qn = typeof router.query.name === "string" ? router.query.name : null;
    setUserName((qn && qn.trim()) || localStorage.getItem("userName") || "유제나");

    const qe = typeof router.query.email === "string" ? router.query.email : null;
    setUserEmail(
      (qe && qe.trim()) || localStorage.getItem("userEmail") || localStorage.getItem("email") || ""
    );

    // 번호 수집
    const qid = typeof router.query.id === "string" ? router.query.id : null;
    const ls = (k: string) => localStorage.getItem(k) || "";

    const patientId = ls("patientId") || ls("patientID") || ls("patientNo");
    const license = ls("licenseNumber") || ls("licenseNo");
    const other = ls("userId") || ls("staffId") || ls("id");

    const value = (qid && qid.trim()) || patientId || license || other || "";
    setUserId(value);

    let label: "환자번호" | "면허번호" | "ID" = "ID";
    if (patientId || role === "patient") label = "환자번호";
    else if (license || role === "doctor" || role === "nurse") label = "면허번호";
    setIdLabel(label);
  }, [router.query.name, router.query.email, router.query.id, role]);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(isAuthed ? dashPath : "/login");
  };

  // 팝오버 외부 클릭 닫기
  const alertsRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onDown = (ev: MouseEvent) => {
      const t = ev.target as Node;
      if (openAlerts && alertsRef.current && !alertsRef.current.contains(t)) setOpenAlerts(false);
      if (openMenu && menuRef.current && !menuRef.current.contains(t)) setOpenMenu(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [openAlerts, openMenu]);

  const surname = (userName || "").trim().charAt(0) || "N";

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
          <Link href={dashPath} className={`pill ${router.pathname === dashPath ? "active" : ""}`}>대시보드</Link>
          <Link href={`${dashPath}#alerts`} className="pill">알림</Link>
          <Link href={`${dashPath}#settings`} className="pill">설정</Link>
        </nav>

        {/* 우측 버튼들 */}
        <div className="right">
          <button
            className="iconbtn"
            aria-label="알림"
            onClick={() => { setOpenAlerts(v => !v); setOpenMenu(false); }}
          >
            <span className="badge">3</span>
            <span aria-hidden>🔔</span>
          </button>
          <button
            className="hamburger"
            onClick={() => { setOpenMenu(v => !v); setOpenAlerts(false); }}
            aria-label="메뉴 열기"
          >
            ≡
          </button>
        </div>
      </div>

      {/* 반투명 오버레이 */}
      {(openAlerts || openMenu) && <div className="overlay" />}

      {/* 알림 팝오버 */}
      {openAlerts && (
        <div className="alerts-popover" ref={alertsRef} role="dialog" aria-label="알림 내역">
          <div className="alerts-head">
            <strong>알림 내역</strong>
            <button className="x" onClick={() => setOpenAlerts(false)} aria-label="닫기">✕</button>
          </div>
          <div className="alerts-body">
            <AlertHistory />
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

          {/* 사용자 카드: 이름 + 번호 칩 */}
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
            <Link href={`${dashPath}#profile`} className="row" onClick={() => setOpenMenu(false)}>
              내 프로필
            </Link>
            <Link href={`${dashPath}#security`} className="row" onClick={() => setOpenMenu(false)}>
              알림 설정
            </Link>

            <hr />

            <Link href="/login" className="row danger">
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

        /* Link가 렌더한 실제 <a>를 명확히 타깃 */
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

        /* 로그아웃 위 구분선 유지 */
        hr{ border:0; border-top:1px solid #eef3fb; margin:6px 0 }
      `}</style>
    </header>
  );
}
