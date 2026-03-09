import React from "react";
import Header from "@/components/Header";
import Treesearch from "@/components/treesearch";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function TreesearchPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <Navbar
        items={[
          { key: "overview", label: "ภาพรวม", href: "/login" },
          { key: "training", label: "อบรม", href: "/admin/courses" },
          { key: "species", label: "พันธุ์ไม้", href: "/tree/treesearch" },
          { key: "users", label: "ผู้ใช้งาน", href: "/users" },
        ]}
        topOffsetClassName="top-14"
      />

      <main className="flex-1">
        <Treesearch />
        <Footer />
      </main>
    </div>
  );
}