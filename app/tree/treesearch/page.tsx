import React from "react";
import Header from "@/components/Header";
import Treesearch from "@/components/treesearch"; // แก้ชื่อตัวแปรให้เป็นตัวใหญ่ตามชื่อ Component
import Footer from "@/components/Footer";

// เปลี่ยนชื่อ component ให้เป็น PascalCase (TreesearchPage) เพื่อความ convention ที่ดี
const TreesearchPage: React.FC = () => { 
  return (
    // ลบ div ที่ครอบทั้งหมดและ class ที่ไม่จำเป็นออก เพื่อให้ Header แปะด้านบนสุด
    <div className="flex flex-col min-h-screen">
      
      {/* 1. Header Component (แถบโลโก้และผู้ใช้งาน) */}
      {/* NOTE: คุณอาจต้องการส่ง props 'user' ให้ Header ในสถานการณ์จริง */}
      <Header /> 
      
      {/* 2. Treesearch Component (มี Nav bar ย่อย, เนื้อหา และ Filter) */}
      <main className="flex-grow"> 
          <Treesearch /> 
      </main>

      {/* 3. Footer Component */}
      <Footer />
      
    </div>
  );
};

// เปลี่ยนชื่อ export default ให้ตรงกับชื่อ Component
export default TreesearchPage;