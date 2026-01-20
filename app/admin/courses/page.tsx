import CourseManagement from "@/components/Courses/CoursesManagement";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import React from "react";

export default function Page() {
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
        topOffsetClassName="top-16"
      />

      <main className="flex-1 overflow-y-auto">
        <CourseManagement />
        <Footer />
      </main>
    </div>
  );
}
