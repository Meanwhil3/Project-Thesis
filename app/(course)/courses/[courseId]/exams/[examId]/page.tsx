import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import ExamStatusBadge from "@/components/Courses/Exams/ExamStatusBadge";
import { FileText, ListChecks, Pencil } from "lucide-react";
import { ExamType } from "@prisma/client";

function toBigInt(v: string) {
  if (!/^\d+$/.test(v)) throw new Error("invalid");
  return BigInt(v);
}

export default async function ExamDetailPage({
  params,
}: {
  params: { courseId: string; examId: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const role = String((session.user as any)?.role ?? "").toUpperCase();
  if (role === "TRAINEE") redirect(`/courses/${params.courseId}/exams`);

  const courseIdBigInt = toBigInt(params.courseId);
  const examIdBigInt = toBigInt(params.examId);

  const exam = await prisma.exams.findFirst({
    where: {
      exam_id: examIdBigInt,
      course_id: courseIdBigInt,
      deleted_at: null,
    },
    select: {
      exam_id: true,
      exam_title: true,
      exam_description: true,
      exam_type: true,
      duration_minute: true,
      exam_status: true,
      created_at: true,
      author: { select: { first_name: true } },
      questions: {
        where: { deleted_at: null },
        orderBy: { question_id: "asc" },
        select: {
          question_id: true,
          score: true,
          question_detail: true,
          choices: {
            where: { deleted_at: null },
            orderBy: { choice_id: "asc" },
            select: { choice_id: true, choice_detail: true, is_correct: true },
          },
        },
      },
    },
  });

  if (!exam) {
    return <div className="p-6 text-red-600">ไม่พบข้อสอบ</div>;
  }

  const isFill = exam.exam_type === ExamType.FILL_IN_THE_BLANK;
  const icon = isFill ? <FileText className="h-5 w-5 text-green-800" /> : <ListChecks className="h-5 w-5 text-green-800" />;
  const typeLabel = isFill ? "เติมคำตอบ" : "ปรนัย";

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-10">
        <div className="flex items-center justify-between gap-3">
          <Link
            href={`/courses/${params.courseId}/exams`}
            className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm text-[#14532D] shadow ring-1 ring-black/10"
          >
            กลับไปหน้าการสอบ
          </Link>

          <Link
            href={`/courses/${params.courseId}/exams/${params.examId}/edit`}
            className="inline-flex items-center gap-2 rounded-full bg-[#14532D] px-5 py-2 text-sm text-white shadow"
          >
            <Pencil className="h-4 w-4" />
            แก้ไขข้อสอบ
          </Link>
        </div>

        <section className="mt-6 rounded-3xl bg-white/85 p-6 shadow-[0_0_6px_#CAE0BC] ring-1 ring-black/5 backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-green-50">
                {icon}
              </div>

              <div>
                <div className="text-sm text-[#14532D]/70">{typeLabel}</div>
                <div className="mt-0.5 text-2xl font-medium text-[#14532D]">
                  {exam.exam_title}
                </div>

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#14532D]/60">
                  <span>
                    สร้างเมื่อ{" "}
                    {exam.created_at.toLocaleString("th-TH", {
                      year: "numeric",
                      month: "long",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span>ผู้สร้าง: <b className="font-medium">{exam.author?.first_name ?? "ไม่ระบุ"}</b></span>
                  <span>เวลา: <b className="font-medium">{exam.duration_minute}</b> นาที</span>
                </div>

                {exam.exam_description ? (
                  <div className="mt-3 max-w-3xl whitespace-pre-wrap text-sm text-[#14532D]/80">
                    {exam.exam_description}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ExamStatusBadge status={(exam.exam_status ?? "HIDE") as any} />
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {exam.questions.map((q, idx) => (
              <div key={q.question_id.toString()} className="rounded-2xl border border-black/10 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="text-[#14532D]">
                    <div className="text-sm text-[#14532D]/70">ข้อที่ {idx + 1}</div>
                    <div
                      className="question-html mt-0.5 text-base font-medium"
                      dangerouslySetInnerHTML={{ __html: q.question_detail ?? "" }}
                    />
                  </div>
                  <div className="text-sm text-[#14532D]/70">
                    คะแนน: <b className="font-medium text-[#14532D]">{q.score}</b>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  {isFill ? (
                    <div className="text-sm text-[#14532D]/80">
                      รหัสคำตอบที่ยอมรับได้:
                      <div className="mt-2 flex flex-wrap gap-2">
                        {q.choices.map((c) => (
                          <span
                            key={c.choice_id.toString()}
                            className="question-html rounded-full border border-black/10 bg-green-50 px-3 py-1 text-xs text-green-900"
                            dangerouslySetInnerHTML={{ __html: c.choice_detail ?? "" }}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {q.choices.map((c) => (
                        <li
                          key={c.choice_id.toString()}
                          className={`rounded-xl border px-3 py-2 text-sm ${
                            c.is_correct
                              ? "border-green-200 bg-green-50 text-green-900"
                              : "border-black/10 bg-white text-[#14532D]/85"
                          }`}
                        >
                          <span
                            className="question-html"
                            dangerouslySetInnerHTML={{ __html: c.choice_detail ?? "" }}
                          />
                          {c.is_correct ? <span className="ml-2 text-xs">(ถูก)</span> : null}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
