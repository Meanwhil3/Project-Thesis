import CourseManagement from "@/components/Courses/CoursesManagement";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import React from "react";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header showNav />

      <main className="flex-1">
        <CourseManagement />
        <Footer />
      </main>
    </div>
  );
}