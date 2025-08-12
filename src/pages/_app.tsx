// src/pages/_app.tsx
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import "@/styles/globals.css";
import MainLayout from "@/layouts/MainLayout";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const noLayout =
    router.pathname.startsWith("/login") ||
    router.pathname === "/signup" ||
    router.pathname.startsWith("/signup/");

  if (noLayout) {
    // 로그인/회원가입은 네비/랩 안 씀
    return <Component {...pageProps} />;
  }

  return (
    <MainLayout>
      <Component {...pageProps} />
    </MainLayout>
  );
}
