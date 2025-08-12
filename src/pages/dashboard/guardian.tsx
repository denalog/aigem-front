import { useState } from "react";

type Status = "정상" | "주의" | "위험";
interface Patient {
  id: number;
  patientNo: string;
  name: string;
  status: Status;
  lastAlert: string; // 요약 문장 한 줄
  reassure: string;  // 안심 메시지
  doctor: { name: string; phone: string; hospital: string; site: string };
}

// 데모용 고정 데이터(SSR/CSR 일치)
const PATIENTS: Patient[] = [
  {
    id: 1,
    patientNo: "734928",
    name: "김수현",
    status: "정상",
    lastAlert: "3시간 전 압력 이상 감지",
    reassure: "현재 환자 상태는 안정적입니다. 걱정 마세요.",
    doctor: {
      name: "이도현",
      phone: "010-1234-5678",
      hospital: "에이젬병원",
      site: "https://aigem-hospital.example",
    },
  },
  {
    id: 2,
    patientNo: "552714",
    name: "이하늘",
    status: "주의",
    lastAlert: "1시간 전 심박수 상승 감지",
    reassure: "현재 상태는 ‘주의’입니다. 주기적으로 확인해주세요.",
    doctor: {
      name: "정유진",
      phone: "010-2222-8888",
      hospital: "에이젬병원",
      site: "https://aigem-hospital.example",
    },
  },
  {
    id: 3,
    patientNo: "913046",
    name: "박은별",
    status: "위험",
    lastAlert: "10분 전 산소포화도 급감",
    reassure: "즉시 병원에 연락이 필요합니다.",
    doctor: {
      name: "한지훈",
      phone: "010-7777-4444",
      hospital: "에이젬병원",
      site: "https://aigem-hospital.example",
    },
  },
];

const statusOrder: Record<Status, number> = { 위험: 0, 주의: 1, 정상: 2 };

export default function GuardianDashboard() {
  // 문의 토글/내용(환자별)
  const [openById, setOpenById] = useState<Record<number, boolean>>({});
  const [textById, setTextById] = useState<Record<number, string>>({});

  const sorted = [...PATIENTS].sort(
    (a, b) => statusOrder[a.status] - statusOrder[b.status]
  );

  const tone = (s: Status) => (s === "정상" ? "ok" : s === "주의" ? "warn" : "danger");

  const tel = (num: string) =>
    (window.location.href = `tel:${num.replaceAll("-", "")}`);
  const sms = (num: string) =>
    (window.location.href = `sms:${num.replaceAll("-", "")}`);

  const sendInquiry = (p: Patient) => {
    const v = (textById[p.id] || "").trim();
    if (!v) return;
    alert(`문의가 전송되었습니다. (대상: ${p.name})`);
    setTextById((m) => ({ ...m, [p.id]: "" }));
    setOpenById((m) => ({ ...m, [p.id]: false }));
  };

  return (
    <main className="page">
      <div className="wrap">
        <div className="pageHead">
          <h1>안심 모니터링</h1>
          <div className="live"><span className="dot ok glow" /> 실시간 연결</div>
        </div>

        {/* 환자 카드 리스트 */}
        <div className="list">
          {sorted.map((p) => (
            <section key={p.id} className="card" aria-label={`${p.name} 카드`}>
              {/* 환자 상단 */}
              <header className="header">
                <div className="pnoBox">
                  <div className="pno">{p.patientNo}</div>
                  <div className="pnoLabel">환자 번호</div>
                </div>

                <div className="idRow">
                  <span className="namePill">{p.name}</span>
                  <span className={`badge ${tone(p.status)}`}>
                    <i className={`dot ${tone(p.status)}`} />
                    {p.status}
                  </span>
                </div>

                <div className="alertLine">{p.lastAlert}</div>
              </header>

              {/* 주치의/연락 */}
              <div className="doctor">
                <div className="left">
                  <div className="title">담당 주치의</div>
                  <div className="row">
                    <strong>{p.doctor.name}</strong>
                    <span className="sep">·</span>
                    <span>{p.doctor.hospital}</span>
                    <span className="sep">·</span>
                    <span className="phone nowrap">{p.doctor.phone}</span>
                  </div>
                </div>
                <div className="right">
                  <button className="iconbtn" onClick={() => tel(p.doctor.phone)} aria-label="전화하기">📞</button>
                  <button className="iconbtn" onClick={() => sms(p.doctor.phone)} aria-label="문자 보내기">✉️</button>
                </div>
              </div>

              {/* 안심 메시지 */}
              <div className={`reassure ${tone(p.status)}`}>{p.reassure}</div>

              {/* 액션 */}
              <div className="btns">
                <button className="ghost" onClick={() => alert("상태 상세보기 (데모)")}>상태 상세보기</button>
                <button
                  className="primary"
                  onClick={() => setOpenById((m) => ({ ...m, [p.id]: !m[p.id] }))}
                >
                  문의하기
                </button>
              </div>

              {/* 문의 입력 */}
              {openById[p.id] && (
                <div className="inq">
                  <label className="qlabel">문의 메시지</label>
                  <textarea
                    rows={4}
                    value={textById[p.id] || ""}
                    onChange={(e) =>
                      setTextById((m) => ({ ...m, [p.id]: e.target.value }))
                    }
                    placeholder="문의하고 싶은 내용을 입력해주세요"
                  />
                  <div className="inqBtns">
                    <button
                      className="ghost"
                      onClick={() =>
                        setOpenById((m) => ({ ...m, [p.id]: false }))
                      }
                    >
                      취소
                    </button>
                    <button className="primary" onClick={() => sendInquiry(p)}>
                      전송
                    </button>
                  </div>
                </div>
              )}

              {/* 병원 사이트 */}
              <div className="site">
                병원 사이트&nbsp;
                <a href={p.doctor.site} target="_blank" rel="noreferrer">
                  {p.doctor.site}
                </a>
              </div>
            </section>
          ))}
        </div>
      </div>

      <style jsx>{`
        .page{
          min-height:100vh;
          background:linear-gradient(135deg,#e9f2ff 0%,#f6f9ff 100%);
          padding:24px 16px;
          display:flex; justify-content:center;
        }
        .wrap{ width:100%; max-width:720px; }
        .pageHead{
          display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;
        }
        h1{ margin:0; font-size:20px; font-weight:900; color:#0b1b33; }
        .live{ display:flex; align-items:center; gap:6px; color:#2a4d8f; font-weight:800; font-size:12px; }
        .dot{ width:8px; height:8px; border-radius:999px; display:inline-block; }
        .ok{ background:#22c55e; } .warn{ background:#f59e0b; }
        .danger{ background:#ef4444; animation:pulse 1.2s ease-in-out infinite; }
        .glow{ box-shadow:0 0 8px rgba(34,197,94,.5); }
        @keyframes pulse{
          0%{ transform:scale(1); box-shadow:0 0 10px rgba(239,68,68,.35); }
          50%{ transform:scale(1.07); box-shadow:0 0 16px rgba(239,68,68,.55); }
          100%{ transform:scale(1); box-shadow:0 0 10px rgba(239,68,68,.35); }
        }

        .list{ display:grid; gap:14px; }

        .card{
          background:linear-gradient(180deg,#f7faff 0%,#ffffff 100%);
          border:1px solid #e1e9ff; border-radius:18px;
          box-shadow:0 16px 40px rgba(21,44,84,.12);
          padding:16px;
        }

        .header{
          border:1px solid #e1e9ff; border-radius:14px; background:#fff;
          box-shadow:0 6px 14px rgba(21,44,84,.06);
          padding:12px;
          display:grid; gap:8px;
        }
        .pnoBox{ display:grid; justify-items:start; gap:2px; }
        .pno{ font-weight:900; font-size:18px; color:#0b1b33; letter-spacing:.4px; }
        .pnoLabel{ font-size:11px; color:#6b7fb0; }

        .idRow{ display:flex; align-items:center; gap:8px; }
        .namePill{
          border:1px solid #cfe0ff; background:#fff;
          padding:4px 10px; border-radius:999px; font-weight:900; color:#2a4d8f; font-size:13px;
        }
        .badge{
          height:22px; padding:0 10px; border-radius:999px; border:1px solid #e1e9ff;
          display:inline-flex; align-items:center; gap:6px; font-weight:800; font-size:12px; background:#fff;
        }
        .badge.ok{ color:#047857; border-color:#bbf7d0; background:#ecfdf5; }
        .badge.warn{ color:#b45309; border-color:#fed7aa; background:#fff7ed; }
        .badge.danger{ color:#b91c1c; border-color:#fecaca; background:#fef2f2; }

        .alertLine{
          font-size:13px; color:#334155; font-weight:700;
          padding-top:2px;
        }

        .doctor{
          margin-top:12px; padding:10px;
          border:1px solid #e1e9ff; border-radius:14px;
          background:linear-gradient(180deg,#f7faff 0%,#ffffff 100%);
          box-shadow:0 6px 14px rgba(21,44,84,.06);
          display:grid; grid-template-columns:1fr auto; gap:8px; align-items:center;
        }
        .title{ font-size:12px; color:#6b7fb0; font-weight:800; margin-bottom:2px; }
        .row{ display:flex; align-items:center; gap:6px; flex-wrap:wrap; color:#0b1b33; font-weight:800; }
        .sep{ color:#a1b5e6; }
        .phone{ color:#2a4d8f; }
        .nowrap{ white-space:nowrap; }
        .right{ display:flex; gap:6px; }
        .iconbtn{
          width:34px; height:34px; border-radius:10px; border:1px solid #e1e9ff;
          background:#fff; box-shadow:0 2px 8px rgba(21,44,84,.06); font-size:16px;
        }

        .reassure{
          margin-top:10px; border-radius:14px; padding:12px; border:1px solid #e1e9ff; font-weight:800;
          font-size:14px;
        }
        .reassure.ok{ background:#ecfdf5; border-color:#bbf7d0; color:#065f46; }
        .reassure.warn{ background:#fff7ed; border-color:#fed7aa; color:#9a3412; }
        .reassure.danger{ background:#fef2f2; border-color:#fecaca; color:#7f1d1d; }

        .btns{ display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:10px; }
        .ghost{
          height:36px; border-radius:10px; border:1px solid #e1e9ff; background:#fff; color:#0b1b33; font-weight:900;
          box-shadow:0 2px 8px rgba(21,44,84,.06);
        }
        .primary{
          height:36px; border-radius:10px; border:1px solid #2f6fe4; background:#2f6fe4; color:#fff; font-weight:900;
          box-shadow:0 2px 8px rgba(21,44,84,.06);
        }

        .inq{ margin-top:10px; padding-top:8px; border-top:1px solid #eef3fb; display:grid; gap:8px; }
        .qlabel{ font-size:12px; color:#2a4d8f; font-weight:900; }
        textarea{
          width:100%; resize:none; border-radius:12px; border:1px solid #e1e9ff; padding:10px; font-size:14px; background:#fff;
          box-shadow:0 2px 10px rgba(21,44,84,.06);
        }
        .inqBtns{ display:flex; justify-content:flex-end; gap:8px; }

        .site{
          margin-top:10px; padding:10px 12px; border-radius:12px; border:1px solid #eef3fb; background:#f9fbff;
          color:#5b6c94; font-size:12px; display:flex; align-items:center; gap:6px;
        }
        .site a{ color:#2f6fe4; font-weight:800; text-decoration:none; }
      `}</style>
    </main>
  );
}
