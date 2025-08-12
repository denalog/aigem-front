// src/pages/settings/alerts.tsx
import { useEffect, useMemo, useState } from "react";

type ChannelState = {
  popup: boolean;
  sms: boolean;
  smsNumber: string;
  smsVerified: boolean;
};

type ConditionState = {
  risk: boolean;   // 위험
  warn: boolean;   // 주의
  normal: boolean; // 정상
  bpm: boolean;
  rpm: boolean;
  temp: boolean;
  pressure: boolean;
};

type DndState = {
  enabled: boolean;
  start: string; // "22:00"
  end: string;   // "07:00"
};

type ConsentState = {
  marketing: boolean;
  marketingDate?: string;
};

type Pref = {
  channel: ChannelState;
  cond: ConditionState;
  dnd: DndState;
  consent: ConsentState;
  savedAt?: string;
};

const DEFAULT_PREF: Pref = {
  channel: { popup: true, sms: false, smsNumber: "", smsVerified: false },
  cond: { risk: true, warn: true, normal: false, bpm: true, rpm: true, temp: true, pressure: true },
  dnd: { enabled: false, start: "22:00", end: "07:00" },
  consent: { marketing: false, marketingDate: undefined },
  savedAt: undefined,
};

function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

export default function AlertSettingsPage() {
  const mounted = useMounted();
  const [pref, setPref] = useState<Pref>(DEFAULT_PREF);

  // 초기 로딩
  useEffect(() => {
    if (!mounted) return;
    try {
      const raw = localStorage.getItem("aigem_alert_prefs");
      if (raw) setPref(JSON.parse(raw));
    } catch {}
  }, [mounted]);

  const savedTimeText = useMemo(() => {
    if (!pref.savedAt) return "아직 저장되지 않음";
    const d = new Date(pref.savedAt);
    const y = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${y}-${mm}-${dd} ${hh}:${mi}`;
  }, [pref.savedAt]);

  function save() {
    const next: Pref = { ...pref, savedAt: new Date().toISOString() };
    setPref(next);
    localStorage.setItem("aigem_alert_prefs", JSON.stringify(next));
    alert("알림 설정이 저장되었습니다.");
  }

  function resetAll() {
    if (!confirm("모든 알림 설정을 기본값으로 되돌릴까요?")) return;
    setPref(DEFAULT_PREF);
    localStorage.setItem("aigem_alert_prefs", JSON.stringify(DEFAULT_PREF));
  }

  // 마케팅 동의 토글 시 일시 기록
  function toggleMarketing(v: boolean) {
    setPref((p) => ({
      ...p,
      consent: { marketing: v, marketingDate: v ? new Date().toISOString() : undefined },
    }));
  }

  function sendTestSms() {
    if (!pref.channel.sms) {
      alert("SMS 채널을 먼저 켜주세요.");
      return;
    }
    if (!pref.channel.smsNumber) {
      alert("수신 전화번호를 입력해주세요.");
      return;
    }
    // 실제 Twilio 연동은 서버 API를 통해 처리하세요.
    // 예: fetch("/api/sms/test", { method:"POST", body: JSON.stringify({ to: pref.channel.smsNumber }) })
    alert(`(데모) 테스트 문자를 ${pref.channel.smsNumber} 으로 보냈다고 가정합니다.`);
  }

  return (
    <main className="wrap">
      <section className="head">
        <div className="title-row">
          <h1>알림 설정</h1>
          <span className="saved">최근 저장: {savedTimeText}</span>
        </div>
        <p className="muted">
          환자 상태 변화에 대한 알림 채널과 조건을 설정합니다. 조용 시간(DND)과 문자(SMS) 연동도 여기서 관리합니다.
        </p>
      </section>

      <section className="grid">
        {/* 알림 채널 */}
        <article className="card">
          <header className="card-head">
            <h3>알림 채널</h3>
          </header>
          <div className="rows">
            <div className="row">
              <label>실시간 팝업 알림</label>
              <Toggle
                checked={pref.channel.popup}
                onChange={(v) => setPref((p) => ({ ...p, channel: { ...p.channel, popup: v } }))}
              />
            </div>

            <div className="row">
              <label>문자(SMS) 알림</label>
              <Toggle
                checked={pref.channel.sms}
                onChange={(v) => setPref((p) => ({ ...p, channel: { ...p.channel, sms: v } }))}
              />
            </div>

            <div className="row col">
              <label>수신 전화번호</label>
              <div className="inline">
                <input
                  type="tel"
                  placeholder="010-0000-0000"
                  value={pref.channel.smsNumber}
                  onChange={(e) =>
                    setPref((p) => ({ ...p, channel: { ...p.channel, smsNumber: e.target.value } }))
                  }
                  disabled={!pref.channel.sms}
                />
                <button
                  className="pill ghost"
                  onClick={() =>
                    setPref((p) => ({ ...p, channel: { ...p.channel, smsVerified: true } }))
                  }
                  disabled={!pref.channel.sms || !pref.channel.smsNumber}
                >
                  번호 인증(데모)
                </button>
                <button
                  className="pill"
                  onClick={sendTestSms}
                  disabled={!pref.channel.sms || !pref.channel.smsNumber}
                >
                  테스트 전송
                </button>
              </div>
              {pref.channel.smsVerified && <span className="ok">인증 완료</span>}
              <p className="help">
                실제 발송은 Twilio API를 서버에서 연동해 처리하세요. (본 화면은 데모용 UI입니다)
              </p>
            </div>
          </div>
        </article>
        {/* 조용 시간 */}
        <article className="card">
          <header className="card-head">
            <h3>조용 시간(DND)</h3>
          </header>
          <div className="rows">
            <div className="row">
              <label>조용 시간 사용</label>
              <Toggle
                checked={pref.dnd.enabled}
                onChange={(v) => setPref((p) => ({ ...p, dnd: { ...p.dnd, enabled: v } }))}
              />
            </div>
            <div className="row two">
              <div>
                <label>시작</label>
                <input
                  type="time"
                  value={pref.dnd.start}
                  onChange={(e) => setPref((p) => ({ ...p, dnd: { ...p.dnd, start: e.target.value } }))}
                  disabled={!pref.dnd.enabled}
                />
              </div>
              <div>
                <label>종료</label>
                <input
                  type="time"
                  value={pref.dnd.end}
                  onChange={(e) => setPref((p) => ({ ...p, dnd: { ...p.dnd, end: e.target.value } }))}
                  disabled={!pref.dnd.enabled}
                />
              </div>
            </div>
            <p className="help">조용 시간 중에는 팝업·문자 알림을 중단합니다. (응급·위험은 예외 적용 옵션을 추후 제공)</p>
          </div>
        </article>

        {/* 동의 */}
        <article className="card">
          <header className="card-head">
            <h3>수신 동의</h3>
          </header>
          <div className="rows">
            <div className="row">
              <label>공지/프로모션 수신동의</label>
              <Toggle
                checked={pref.consent.marketing}
                onChange={toggleMarketing}
              />
            </div>
            <p className="help">
              동의 시 서비스 공지 및 프로모션 정보를 받을 수 있습니다.{" "}
              {pref.consent.marketing && pref.consent.marketingDate && (
                <span className="muted">
                  (동의 일시: {new Date(pref.consent.marketingDate).toLocaleString()})
                </span>
              )}{" "}
              <a className="plink" href="/legal/marketing">수신 동의 안내</a>
            </p>
          </div>
        </article>
      </section>

      {/* 액션 바 */}
      <section className="actions-bar">
        <div className="inner">
          <button className="pill ghost" onClick={resetAll}>기본값으로</button>
          <button className="pill save" onClick={save}>저장</button>
        </div>
      </section>

      <style jsx>{`
        :global(html, body) { background:#f6f9ff; }
        .wrap{
          max-width:1040px; margin:0 auto; padding:16px 14px 80px;
        }
        .head .title-row{
          display:flex; align-items:baseline; justify-content:space-between; gap:10px; flex-wrap:wrap;
        }
        h1{ margin:4px 0; font-size:28px; color:#152447; letter-spacing:-0.2px; }
        .saved{ color:#6b7aa8; font-weight:700; }
        .muted{ color:#6b7aa8; margin:4px 0 8px; }

        .grid{ display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px; }
        @media (max-width: 860px){ .grid{ grid-template-columns:1fr; } }

        .card{
          background:#fff; border:1px solid #e3edff; border-radius:18px;
          box-shadow:0 10px 22px rgba(21,44,84,.06); padding:14px;
        }
        .card-head h3{ margin:2px 0 8px; font-size:16px; color:#0f1e3e; }

        .rows{ display:flex; flex-direction:column; gap:12px; }
        .row{ display:flex; align-items:center; justify-content:space-between; gap:12px; }
        .row.col{ flex-direction:column; align-items:stretch; }
        .row.two{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        label, .label{ color:#5e719c; font-weight:700; font-size:12px; }
        input{
          width:100%; border:1px solid #dbe7ff; border-radius:12px; padding:10px 12px; background:#fff; color:#10224d;
        }
        input:disabled{ background:#f3f6ff; color:#7b87a7; }
        .inline{ display:flex; gap:8px; flex-wrap:wrap; }
        .help{ color:#7b8baa; font-size:12px; margin:0; }
        .ok{ color:#0f9d58; font-weight:800; font-size:12px; }

        .chips{ display:flex; gap:8px; flex-wrap:wrap; }

        .pill{
          height:34px; padding:0 14px; border-radius:999px; border:1px solid #dbe7ff;
          background:linear-gradient(180deg,#f8fbff 0%,#ffffff 100%); font-weight:800; color:#15336b;
        }
        .pill.ghost{ background:#fff; color:#41568a; }
        .pill.save{
          background:#2e63e7; color:#fff; border-color:#2e63e7; box-shadow:0 6px 14px rgba(46,99,231,.18);
        }

        .actions-bar{ position:sticky; bottom:0; margin-top:18px; }
        .actions-bar .inner{
          display:flex; justify-content:flex-end; gap:10px; padding:10px 0;
        }

        .plink{ color:#2e63e7; font-weight:800; text-decoration:underline; }
      `}</style>
    </main>
  );
}

/* ====== 재사용 토글 & 칩 ====== */

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      className={`toggle ${checked ? "on" : ""}`}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
    >
      <span className="knob" />
      <style jsx>{`
        .toggle{
          width:52px; height:30px; border-radius:999px; border:1px solid #dbe7ff;
          background:#fff; position:relative; box-shadow:inset 0 0 0 2px #eaf1ff;
        }
        .toggle.on{ background:#2e63e7; border-color:#2e63e7; box-shadow:none; }
        .knob{
          position:absolute; top:3px; left:3px; width:24px; height:24px;
          border-radius:50%; background:#fff; box-shadow:0 2px 6px rgba(21,44,84,.15);
          transform:translateX(0); transition:transform .15s ease;
        }
        .toggle.on .knob{ transform:translateX(22px); }
      `}</style>
    </button>
  );
}

function Chip({
  active,
  onClick,
  children,
  color,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <button
      className={`chip ${active ? "active" : ""}`}
      onClick={onClick}
      aria-pressed={active}
      style={active && color ? { borderColor: color, boxShadow: `0 8px 18px ${hexShadow(color)}` } : {}}
    >
      {children}
      <style jsx>{`
        .chip{
          height:32px; padding:0 12px; border-radius:999px; border:1px solid #e1e9ff;
          background:linear-gradient(180deg,#f7faff 0%, #ffffff 100%); color:#0b1b33; font-weight:800;
          transition:transform .12s ease, box-shadow .12s ease, border-color .12s ease;
        }
        .chip.active{ transform:translateY(-1px); }
      `}</style>
    </button>
  );
}

function hexShadow(hex: string) {
  // 간단 변환: 빨간/주황/초록 톤에 어울리는 투명 그림자
  return hex === "#ef4444"
    ? "rgba(239,68,68,.18)"
    : hex === "#f59e0b"
    ? "rgba(245,158,11,.18)"
    : hex === "#22c55e"
    ? "rgba(34,197,94,.18)"
    : "rgba(46,99,231,.16)";
}
