"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Eye, PencilLine, Trash2, Plus, Loader2, GripVertical, ArrowUpDown, Check } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation'; // เพิ่ม useRouter

// --- dnd-kit components ---
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
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Sortable Item Component ---
function SortableLessonItem({ lesson, index, isReordering, onEdit }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: lesson.lesson_id, 
    disabled: !isReordering 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`flex items-center justify-between p-4 bg-white border rounded-xl mb-3 transition-all ${
        isReordering 
          ? "border-blue-200 shadow-md ring-1 ring-blue-100" 
          : "border-gray-100 hover:border-green-200"
      }`}
    >
      <div className="flex items-center gap-4 flex-1">
        {isReordering && (
          <div 
            {...attributes} 
            {...listeners} 
            className="text-blue-400 cursor-grab active:cursor-grabbing p-2 hover:bg-blue-50 rounded-lg"
          >
            <GripVertical size={20} />
          </div>
        )}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-[#14532D] bg-green-50 px-2 py-0.5 rounded border border-green-100">
              บทที่ : {index + 1}
            </span>
            <h3 className="text-[15px] font-medium text-[#14532D]">{lesson.lesson_title}</h3>
          </div>
          {!isReordering && (
            <p className="text-[12px] text-gray-500 line-clamp-1 ml-1">{lesson.lesson_content}</p>
          )}
        </div>
      </div>

      {!isReordering && (
        <div className="flex gap-1 ml-4">
          <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-colors"><Eye size={18} /></button>
          <button 
            onClick={() => onEdit(lesson.lesson_id)}
            className="p-2 text-[#22C55E] hover:bg-green-50 rounded-full transition-colors"
          >
            <PencilLine size={18} />
          </button>
          <button className="p-2 text-[#EF4444] hover:bg-red-50 rounded-full transition-colors"><Trash2 size={18} /></button>
        </div>
      )}
    </div>
  );
}

// --- Main Page Component ---
export default function CourseLessonsPage() {
  const params = useParams();
  const router = useRouter(); // ใช้งาน router
  const courseId = params?.courseId;
  
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchLessons = useCallback(async () => {
    if (!courseId) return;
    try {
      setIsLoading(true);
      // ตรวจสอบ URL API ให้ตรงกับ Route ของคุณ
      const response = await fetch(`/api/courses/${courseId}/lessons`);
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.findIndex((i) => i.lesson_id === active.id);
        const newIndex = prev.findIndex((i) => i.lesson_id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const handleSaveOrder = async () => {
    setIsSubmitting(true);
    try {
      const reorderedList = items.map((item, index) => ({
        lesson_id: item.lesson_id,
        order_index: index + 1
      }));

      const response = await fetch(`/api/courses/${courseId}/lessons`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessons: reorderedList }),
      });

      if (response.ok) {
        setIsReordering(false);
        fetchLessons();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "ไม่สามารถบันทึกลำดับได้");
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ฟังก์ชันสำหรับการนำทาง
  const goToCreatePage = () => {
    // นำทางไปยังโฟลเดอร์ create ของบทเรียนในคอร์สนั้นๆ
    router.push(`/courses/${courseId}/lessons/create`);
  };

  const goToEditPage = (lessonId) => {
    router.push(`/courses/${courseId}/lessons/${lessonId}/edit`);
  };

  return (
    <div className="mt-7 w-full font-kanit">
      <div className="rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-black/5 backdrop-blur">
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">📖</span>
            <h1 className="text-[20px] font-semibold text-[#14532D]">
              {isReordering ? "จัดลำดับเนื้อหา (ลากวาง)" : "เนื้อหาการเรียน"}
            </h1>
          </div>

          <div className="flex gap-2">
            {!isReordering ? (
              <>
                <button 
                  onClick={() => setIsReordering(true)}
                  className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-600 px-4 py-2 rounded-xl text-sm transition-all"
                >
                  <ArrowUpDown size={18} />
                  <span>แก้ไขลำดับ</span>
                </button>
                <button 
                  onClick={goToCreatePage} // เปลี่ยนไปเรียกฟังก์ชันนำทาง
                  className="flex items-center gap-2 bg-[#22C55E] hover:bg-[#16A34A] text-white px-4 py-2 rounded-xl text-sm transition-all shadow-sm"
                >
                  <Plus size={18} />
                  <span>เพิ่มเนื้อหา</span>
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => { setIsReordering(false); fetchLessons(); }} 
                  className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  ยกเลิก
                </button>
                <button 
                  onClick={handleSaveOrder}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white px-4 py-2 rounded-xl text-sm transition-all shadow-md"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                  <span>บันทึกลำดับ</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col">
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-green-600" /></div>
          ) : items.length > 0 ? (
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={items.map(item => item.lesson_id)}
                strategy={verticalListSortingStrategy}
              >
                {items.map((lesson, index) => (
                  <SortableLessonItem 
                    key={lesson.lesson_id} 
                    lesson={lesson} 
                    index={index} 
                    isReordering={isReordering}
                    onEdit={goToEditPage}
                  />
                ))}
              </SortableContext>
            </DndContext>
          ) : (
            <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl font-light">
              ยังไม่มีเนื้อหาในบทเรียนนี้
            </div>
          )}
        </div>
      </div>
    </div>
  );
}