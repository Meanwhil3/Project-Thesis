import UserManagement from "@/components/UserManagement";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MainNavbar from "@/components/MainNavbar";
import React from "react";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <MainNavbar />

      <main className="flex-1">
        <UserManagement />
      </main>
      <Footer />
    </div>
  );
}
