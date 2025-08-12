// src/layouts/MainLayout.tsx
import { ReactNode } from "react";
import NavBar from "../components/NavBar";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app">
      <NavBar />
      <main className="app-main">{children}</main>

      <style jsx>{`
        .app{ min-height:100dvh; background: linear-gradient(180deg,#f5f8ff,#fff); }
        .app-main{
          max-width:1120px; margin:0 auto; padding:16px;
        }
        @media (min-width:768px){
          .app-main{ padding:24px 16px 40px; }
        }
      `}</style>
    </div>
  );
}
