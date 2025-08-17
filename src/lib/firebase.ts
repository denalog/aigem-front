// ### Backend ###
// Firebase 초기화 및 설정 파일

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import firebaseConfig from '../../auth/firebaseAuth.json';

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// Firebase Authentication 인스턴스
export const auth = getAuth(app);

// Firebase Realtime Database 인스턴스
export const database = getDatabase(app);

export default app;
