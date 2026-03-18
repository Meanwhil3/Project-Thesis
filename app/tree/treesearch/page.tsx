import React from "react";
import Header from "@/components/Header";
import Treesearch from "@/components/treesearch";
import Footer from "@/components/Footer";

export default function TreesearchPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header showNav />

      <main className="flex-1">
        <Treesearch />
      </main>
      <Footer />
    </div>
  );
}
