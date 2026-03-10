"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Eye, EyeOff, PencilLine, Trash2, Plus, Loader2, GripVertical, ArrowUpDown, Check } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ConfirmModal from "@/components/modals/ConfirmModal";

// --- Sortable Item Component ---
function SortableLessonItem({ lesson, isReordering, canManage, onEdit, onView, onDelete, onToggleStatus, isDeleting }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: lesson.lesson_id, 
    disabled: !isReordering 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.6 : 1,
  };

  const isVisible = lesson.lesson_status === "OPEN";

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      onClick={() => !isReordering && onView(lesson.lesson_id)}
      className={`flex items-center justify-between p-4 bg-white border rounded-xl mb-3 transition-all group ${
        isReordering ? "border-blue-200 shadow-md ring-1 ring-blue-100" : "border-gray-100 hover:border-green-300 cursor-pointer"
      } ${!isVisible && !isReordering ? "opacity-75 bg-gray-50/50" : ""}`}
    >
      <div className="flex items-center gap-4 flex-1 overflow-hidden">
        {isReordering && (
          <div {...attributes} {...listeners} className="text-blue-400 cursor-grab p-2 hover:bg-blue-50 rounded-lg">
            <GripVertical size={20} />
          </div>
        )}
        <div className="flex flex-col gap-0.5 overflow-hidden">
          <div className="flex items-center gap-2">
            <h3 className={`text-[15px] font-medium truncate ${isVisible ? "text-[#14532D]" : "text-gray-400"}`}>
              {lesson.lesson_title}
              {!isVisible && <span className="ml-2 text-[10px] bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">ซ่อนอยู่</span>}
            </h3>
          </div>
          {!isReordering && <p className="text-[12px] text-gray-400 line-clamp-1 ml-1 font-light">กดเพื่อดูรายละเอียดเนื้อหา...</p>}
        </div>
      </div>

      {!isReordering && canManage && (
        <div className="flex gap-1 ml-4" onClick={(e) => e.stopPropagation()}> 
          <button onClick={() => onToggleStatus(lesson.lesson_id, lesson.lesson_status)} className={`p-2 rounded-full ${isVisible ? "text-blue-500 hover:bg-blue-50" : "text-gray-300 hover:bg-gray-100"}`}>
            {isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
          <button onClick={() => onEdit(lesson.lesson_id)} className="p-2 text-[#22C55E] hover:bg-green-50 rounded-full">
            <PencilLine size={18} />
          </button>
          <button onClick={() => onDelete(lesson.lesson_id)} disabled={isDeleting} className="p-2 text-[#EF4444] hover:bg-red-50 rounded-full">
            {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
          </button>
        </div>
      )}
    </div>
  );
}

// --- Main Page Component ---
export default function CourseLessonsPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const courseId = params?.courseId;
  
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const role = String(session?.user?.role ?? "").toUpperCase();
  const canManage = role === "ADMIN" || role === "INSTRUCTOR";

  // กรองบทเรียน: ถ้าไม่ใช่คนสอน ให้เห็นเฉพาะ OPEN
  const displayItems = useMemo(() => {
    return canManage ? items : items.filter(item => item.lesson_status === "OPEN");
  }, [items, canManage]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchLessons = useCallback(async () => {
    if (!courseId) return;
    try {
      setIsLoading(true);
      const response = await fetch(`/api/courses/${courseId}/lessons`);
      if (response.ok) {
        const data = await response.json();
        setItems(data.sort((a, b) => (a.order_index || 0) - (b.order_index || 0)));
      }
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  }, [courseId]);

  useEffect(() => { fetchLessons(); }, [fetchLessons]);

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
    if (!canManage) return;
    setIsSubmitting(true);
    try {
      const reorderedList = items.map((item, index) => ({
        lesson_id: item.lesson_id,
        order_index: index + 1
      }));
      const response = await fetch(`/api/admin/courses/${courseId}/lessons`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessons: reorderedList }),
      });
      if (response.ok) { setIsReordering(false); fetchLessons(); }
    } catch (error) { console.error(error); } finally { setIsSubmitting(false); }
  };

  const handleToggleStatus = async (lessonId, currentStatus) => {
    if (!canManage) return;
    const newStatus = currentStatus === "OPEN" ? "CLOSED" : "OPEN";
    try {
      setItems(prev => prev.map(item => item.lesson_id === lessonId ? { ...item, lesson_status: newStatus } : item));
      await fetch(`/api/admin/courses/${courseId}/lessons/${lessonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus === "OPEN" ? "SHOW" : "HIDE", toggleOnly: true }),
      });
    } catch (error) { alert("Error"); fetchLessons(); }
  };

  const handleDelete = (lessonId: string) => {
    if (!canManage) return;
    setDeleteTargetId(lessonId);
  };

  const doDeleteLesson = async (lessonId: string) => {
    try {
      setDeletingId(lessonId);
      const response = await fetch(`/api/admin/courses/${courseId}/lessons/${lessonId}`, { method: 'DELETE' });
      if (response.ok) setItems((prev) => prev.filter(item => item.lesson_id !== lessonId));
    } catch (error) { console.error(error); } finally { setDeletingId(null); }
  };

  const goToViewPage = (lessonId) => router.push(`/courses/${courseId}/lessons/${lessonId}`);
  const goToCreatePage = () => router.push(`/admin/courses/${courseId}/lessons/create`);
  const goToEditPage = (lessonId) => router.push(`/admin/courses/${courseId}/lessons/${lessonId}/edit`);

  return (
    <div className="mt-7 w-full font-kanit">
      <div className="rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-black/5 backdrop-blur">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-[20px] font-semibold text-[#14532D]">เนื้อหาการเรียน</h1>
          {canManage && (
            <div className="flex gap-2">
              {!isReordering ? (
                <>
                  <button onClick={() => setIsReordering(true)} className="flex items-center gap-2 border px-4 py-2 rounded-xl text-sm"><ArrowUpDown size={18} /> แก้ไขลำดับ</button>
                  <button onClick={goToCreatePage} className="flex items-center gap-2 bg-[#22C55E] text-white px-4 py-2 rounded-xl text-sm"><Plus size={18} /> เพิ่มเนื้อหา</button>
                </>
              ) : (
                <>
                  <button onClick={() => { setIsReordering(false); fetchLessons(); }} className="px-4 py-2 text-sm">ยกเลิก</button>
                  <button onClick={handleSaveOrder} disabled={isSubmitting} className="flex items-center gap-2 bg-[#3B82F6] text-white px-4 py-2 rounded-xl text-sm">
                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />} บันทึกลำดับ
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div>
          ) : displayItems.length > 0 ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={displayItems.map(item => item.lesson_id)} strategy={verticalListSortingStrategy}>
                {displayItems.map((lesson) => (
                  <SortableLessonItem 
                    key={lesson.lesson_id.toString()} 
                    lesson={lesson} 
                    isReordering={isReordering}
                    canManage={canManage}
                    onEdit={goToEditPage}
                    onView={goToViewPage}
                    onDelete={handleDelete}
                    onToggleStatus={handleToggleStatus}
                    isDeleting={deletingId === lesson.lesson_id}
                  />
                ))}
              </SortableContext>
            </DndContext>
          ) : (
            <div className="text-center py-10 text-gray-400 border-2 border-dashed rounded-xl">
               {canManage ? "ยังไม่มีบทเรียน" : "ยังไม่มีเนื้อหาเปิดให้เข้าชม"}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={deleteTargetId !== null}
        title="ลบบทเรียน"
        description="ยืนยันการลบบทเรียนนี้? การลบจะไม่สามารถย้อนกลับได้"
        confirmText="ลบ"
        cancelText="ยกเลิก"
        variant="danger"
        onConfirm={() => {
          if (deleteTargetId) doDeleteLesson(deleteTargetId);
          setDeleteTargetId(null);
        }}
        onClose={() => setDeleteTargetId(null)}
      />
    </div>
  );
}