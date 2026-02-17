"use client";
import React, { useState, useEffect } from 'react';
import { GripVertical, Eye, PencilLine, Trash2, Plus } from 'lucide-react';
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Component ย่อยสำหรับแต่ละแถวที่ลากได้ ---
function SortableLessonItem({ lesson }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="group flex items-center justify-between p-5 bg-white border border-[#E2E8F0] rounded-2xl hover:border-[#CAE0BC] hover:shadow-sm transition-all mb-4"
    >
      <div className="flex items-center gap-6">
        <div 
          {...attributes} 
          {...listeners} 
          className="cursor-grab active:cursor-grabbing text-gray-400 p-1 hover:bg-gray-100 rounded"
        >
          <GripVertical size={20} />
        </div>
        
        <div>
          <h3 className="text-[16px] font-medium text-[#14532D]">
            {lesson.title}
          </h3>
          <p className="text-[13px] text-gray-500 mt-0.5">
            {lesson.description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <Eye size={20} />
        </button>
        <button className="p-2 text-[#22C55E] hover:bg-green-50 rounded-full transition-colors">
          <PencilLine size={20} />
        </button>
        <button className="p-2 text-[#EF4444] hover:bg-red-50 rounded-full transition-colors">
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
}

// --- Main Component ---
export default function CourseLessonsPage() {
  // ข้อมูลตั้งต้น
  const defaultLessons = [
    { id: 1, title: 'บทที่ 1 : ความรู้เบื้องต้นเกี่ยวกับไม้', description: 'ประวัติและความสำคัญของไม้ในอุตสาหกรรม' },
    { id: 2, title: 'บทที่ 2 : ชนิดและคุณสมบัติของไม้', description: 'การจำแนกประเภทไม้และคุณสมบัติเฉพาะ' },
    { id: 3, title: 'บทที่ 3 : การตรวจสอบคุณภาพไม้', description: 'เทคนิคและวิธีการตรวจสอบคุณภาพไม้' },
    { id: 4, title: 'บทที่ 4 : การแปรรูปไม้เบื้องต้น', description: 'กระบวนการตัดและเตรียมไม้' },
    { id: 5, title: 'บทที่ 5 : การรักษาเนื้อไม้', description: 'การป้องกันปลวกและแมลงกินไม้' },
  ];

  // 1. ตรวจสอบ localStorage เมื่อเริ่มต้น
  const [items, setItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedOrder = localStorage.getItem('course-lessons-order');
    if (savedOrder) {
      setItems(JSON.parse(savedOrder));
    } else {
      setItems(defaultLessons);
    }
    setIsLoaded(true);
  }, []);

  // 2. บันทึกลง localStorage ทุกครั้งที่มีการเปลี่ยนแปลง items
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('course-lessons-order', JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  // ป้องกันการกระพริบของ UI ระหว่างโหลดข้อมูลจาก localStorage
  if (!isLoaded) return <div className="min-h-screen bg-[#F8FAF8]" />;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-[#F8FAF8] min-h-screen font-kanit">
      <div className="rounded-2xl bg-white p-8 shadow-[0_0_15px_rgba(202,224,188,0.4)] border border-[#E8F0E5]">
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">📖</span>
            <h1 className="text-[22px] font-semibold text-[#14532D]">เนื้อหาการเรียน</h1>
          </div>
          <button className="flex items-center gap-2 bg-[#22C55E] hover:bg-[#16A34A] text-white px-4 py-2 rounded-lg text-sm transition-colors">
            <Plus size={18} />
            <span>เพิ่มเนื้อหา</span>
          </button>
        </div>

        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={items}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col">
              {items.map((lesson) => (
                <SortableLessonItem key={lesson.id} lesson={lesson} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}