import React from "react";
import Header from "@/components/Header";
import Treesearch from "@/components/treesearch";
import Footer from "@/components/Footer";
import MainNavbar from "@/components/MainNavbar";

export default function TreesearchPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <MainNavbar />

      <main className="flex-1">
        <Treesearch />
        <Footer />
      </main>
    </div>
  );
}