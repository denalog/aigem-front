// src/data/roles/doctor.ts

/** 의사(Doctor) 스키마 — signup/doctor.tsx의 폼 필드와 1:1 매칭 */
export type Doctor = {
  id: string;                  // 내부 식별자 (예: "doc001")
  role: "의사";
  /** 회원가입 폼 필드 */
  email: string;               // Google 인증 시 readOnly
  name: string;
  password?: string;           // 데모에서는 저장 지양 (필요시 임시)
  specialty: string;           // 전문분야
  licenseNumber: string;       // 면허번호
  phone: string;
  hospital: string;            // 소속 병원
  department: string;          // 진료과/담당부서
  ward?: string | null;        // 담당 병동(선택)
  hospitalCode?: string | null;// 병원코드/직원번호(선택)
  /** 시스템 관리용 */
  isVerified: boolean;         // 의사 인증 상태
  isGoogleAuth: boolean;       // 구글 인증 여부
  createdAt: string;           // ISO 문자열 (데모 고정)
  updatedAt: string;           // ISO 문자열 (데모 고정)
};

// ✅ 데모 고정값
export const DEMO_DOCTOR_ID = "doc001";
export const DEMO_TS = "2025-08-31T00:00:00.000Z";

/** 폼에서 필요한 필수값 체크용 (UI/검증에 활용 가능) */
export const REQUIRED_FIELDS_FOR_DOCTOR_SIGNUP: Array<keyof Doctor> = [
  "email",
  "name",
  // "password", // 구글 인증-only 플로우면 제외 가능
  "specialty",
  "licenseNumber",
  "phone",
  "hospital",
  "department",
];

/** 데모용 의사 1명 — 베타 시연에서 즉시 사용 가능 (고정) */
export const demoDoctor: Doctor = {
  id: DEMO_DOCTOR_ID,
  role: "의사",
  email: "dr.kim@aigem-care.local",
  name: "김민준",
  specialty: "내과",
  licenseNumber: "MD-2025-000123",
  phone: "010-1234-5678",
  hospital: "AIGEM 요양병원",
  department: "내과",
  ward: "본관 3병동",
  hospitalCode: "HSP-00123",
  isVerified: false,
  isGoogleAuth: false,
  createdAt: DEMO_TS,  // ✅ 고정
  updatedAt: DEMO_TS,  // ✅ 고정
};

/** 폼 payload → Doctor 엔티티로 안전 변환 (id/시간 전부 고정) */
export function buildDoctorFromSignup(payload: {
  email: string;
  name: string;
  specialty: string;
  licenseNumber: string;
  phone: string;
  hospital: string;
  department: string;
  ward?: string;
  hospitalCode?: string;
  isGoogleAuth?: boolean;
}): Doctor {
  return {
    id: DEMO_DOCTOR_ID,        // ✅ 항상 doc001
    role: "의사",
    email: payload.email,
    name: payload.name,
    specialty: payload.specialty,
    licenseNumber: payload.licenseNumber,
    phone: payload.phone,
    hospital: payload.hospital,
    department: payload.department,
    ward: payload.ward ?? null,
    hospitalCode: payload.hospitalCode ?? null,
    isVerified: false,
    isGoogleAuth: !!payload.isGoogleAuth,
    createdAt: DEMO_TS,        // ✅ 고정
    updatedAt: DEMO_TS,        // ✅ 고정
  };
}

export function toBackendRole(roleKo: Doctor["role"]): "doctor" {
  return "doctor";
}
