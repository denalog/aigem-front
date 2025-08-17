// // ### Backend ###
// Firebase 인증 관련 유틸리티 함수들

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup, 
  GoogleAuthProvider,
  updateProfile,
  User
} from 'firebase/auth';
import { ref, set, get, serverTimestamp } from 'firebase/database';
import { auth, database } from './firebase';

// 사용자 역할 타입
export type UserRole = 'doctor' | 'nurse' | 'patient' | 'guardian';

// 사용자 정보 타입
export interface UserData {
  email: string;
  name: string;
  role: UserRole;
  createdAt: any;
  // 역할별 추가 정보
  [key: string]: any;
}

// // ### Backend ###
// Google 로그인 처리 함수
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error('Google 로그인 오류:', error);
    throw error;
  }
};

// // ### Backend ###
// 이메일/비밀번호로 회원가입 처리 함수
export const signUpWithEmailPassword = async (
  email: string, 
  password: string,
  name: string,
  role: UserRole,
  additionalData: Record<string, any> = {}
) => {
  try {
    // Firebase Authentication에 사용자 생성
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 사용자 프로필 업데이트 (displayName 설정)
    await updateProfile(user, {
      displayName: name
    });

    // Realtime Database에 사용자 정보 저장
    await saveUserToDatabase(user, role, name, additionalData);

    return user;
  } catch (error: any) {
    console.error('회원가입 오류:', error);
    // Firebase 에러 객체에서 코드 추출
    const errorCode = error?.code || 'auth/unknown-error';
    console.error('에러 코드:', errorCode);
    throw error;
  }
};

// // ### Backend ###
// Realtime Database에 사용자 정보 저장 함수
export const saveUserToDatabase = async (
  user: User,
  role: UserRole,
  name: string,
  additionalData: Record<string, any> = {}
) => {
  const userData: UserData = {
    email: user.email || '',
    name: name,
    role: role,
    createdAt: serverTimestamp(),
    ...additionalData
  };

  // users/[uid] 경로에 데이터 저장
  const userRef = ref(database, `users/${user.uid}`);
  await set(userRef, userData);
};

// ### Backend ###
// 이메일/비밀번호로 로그인 처리 함수
export const signInWithEmailPassword = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error('로그인 오류:', error);
    throw error;
  }
};

// ### Backend ###
// 사용자 역할 조회 함수 (Realtime Database에서)
export const getUserRole = async (uid: string): Promise<UserRole | null> => {
  try {
    const userRef = ref(database, `users/${uid}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      const userData = snapshot.val();
      return userData.role || null;
    }
    return null;
  } catch (error) {
    console.error('사용자 역할 조회 오류:', error);
    return null;
  }
};

// // ### Backend ###
// 에러 메시지 한글화 함수
export const getAuthErrorMessage = (errorCode?: string): string => {
  if (!errorCode) {
    return '인증 중 오류가 발생했습니다. 다시 시도해주세요.';
  }
  
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return '이미 사용 중인 이메일입니다. 다른 이메일을 사용해주세요.';
    case 'auth/invalid-email':
      return '유효하지 않은 이메일 주소입니다.';
    case 'auth/invalid-credential':
      return '이메일 또는 비밀번호가 올바르지 않습니다. 다시 확인해주세요.';
    case 'auth/operation-not-allowed':
      return '이메일/비밀번호 계정이 활성화되지 않았습니다.';
    case 'auth/weak-password':
      return '비밀번호가 너무 약합니다. 6자 이상 입력해주세요.';
    case 'auth/user-disabled':
      return '해당 사용자 계정이 비활성화되었습니다.';
    case 'auth/user-not-found':
      return '해당 이메일로 등록된 사용자를 찾을 수 없습니다.';
    case 'auth/wrong-password':
      return '잘못된 비밀번호입니다.';
    case 'auth/invalid-login-credentials':
      return '로그인 정보가 올바르지 않습니다. 이메일과 비밀번호를 다시 확인해주세요.';
    case 'auth/popup-closed-by-user':
      return '로그인 팝업이 닫혔습니다. 다시 시도해주세요.';
    case 'auth/network-request-failed':
      return '네트워크 연결을 확인해주세요.';
    case 'auth/too-many-requests':
      return '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.';
    case 'auth/missing-password':
      return '비밀번호를 입력해주세요.';
    case 'auth/missing-email':
      return '이메일을 입력해주세요.';
    default:
      console.warn('처리되지 않은 에러 코드:', errorCode);
      return `인증 중 오류가 발생했습니다. (${errorCode}) 다시 시도해주세요.`;
  }
};
