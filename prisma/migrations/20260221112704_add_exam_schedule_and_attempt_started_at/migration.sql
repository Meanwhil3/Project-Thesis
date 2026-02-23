/*
  Warnings:

  - You are about to drop the column `created_at` on the `Instructor` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `Instructor` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[course_id,exam_access_code]` on the table `Exams` will be added. If there are existing duplicate values, this will fail.
  - Made the column `attempt_status` on table `Exam_Attempts` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Announcements" DROP CONSTRAINT "Announcements_course_id_fkey";

-- DropForeignKey
ALTER TABLE "Choices" DROP CONSTRAINT "Choices_question_id_fkey";

-- DropForeignKey
ALTER TABLE "Course_Enrollments" DROP CONSTRAINT "Course_Enrollments_course_id_fkey";

-- DropForeignKey
ALTER TABLE "Course_Enrollments" DROP CONSTRAINT "Course_Enrollments_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Exams" DROP CONSTRAINT "Exams_course_id_fkey";

-- DropForeignKey
ALTER TABLE "Lesson_Attachments" DROP CONSTRAINT "Lesson_Attachments_lesson_id_fkey";

-- DropForeignKey
ALTER TABLE "Lessons" DROP CONSTRAINT "Lessons_course_id_fkey";

-- DropForeignKey
ALTER TABLE "Questions" DROP CONSTRAINT "Questions_exam_id_fkey";

-- DropIndex
DROP INDEX "Announcements_course_id_idx";

-- DropIndex
DROP INDEX "Choices_question_id_idx";

-- DropIndex
DROP INDEX "Course_Enrollments_course_id_idx";

-- DropIndex
DROP INDEX "Course_Enrollments_user_id_course_id_key";

-- DropIndex
DROP INDEX "Course_Enrollments_user_id_idx";

-- DropIndex
DROP INDEX "Exam_Attempts_exam_id_idx";

-- DropIndex
DROP INDEX "Exam_Attempts_user_id_idx";

-- DropIndex
DROP INDEX "Exams_course_id_idx";

-- DropIndex
DROP INDEX "Instructor_course_id_idx";

-- DropIndex
DROP INDEX "Lesson_Attachments_lesson_id_idx";

-- DropIndex
DROP INDEX "Lessons_course_id_idx";

-- DropIndex
DROP INDEX "Questions_exam_id_idx";

-- AlterTable
ALTER TABLE "Announcements" ALTER COLUMN "course_id" DROP NOT NULL,
ALTER COLUMN "created_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Choices" ALTER COLUMN "question_id" DROP NOT NULL,
ALTER COLUMN "created_at" DROP NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Course" ALTER COLUMN "created_at" DROP NOT NULL,
ALTER COLUMN "created_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Course_Enrollments" ALTER COLUMN "user_id" DROP NOT NULL,
ALTER COLUMN "course_id" DROP NOT NULL,
ALTER COLUMN "enrollment_date" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Exam_Attempts" ADD COLUMN     "started_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "attempt_status" SET NOT NULL,
ALTER COLUMN "attempt_status" SET DEFAULT 'IN PROGRESS';

-- AlterTable
ALTER TABLE "Exams" ADD COLUMN     "close_at" TIMESTAMPTZ,
ADD COLUMN     "exam_access_code" VARCHAR(6),
ADD COLUMN     "open_at" TIMESTAMPTZ,
ALTER COLUMN "course_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Instructor" DROP COLUMN "created_at",
DROP COLUMN "deleted_at";

-- AlterTable
ALTER TABLE "Lesson_Attachments" ALTER COLUMN "lesson_id" DROP NOT NULL,
ALTER COLUMN "created_at" DROP NOT NULL,
ALTER COLUMN "created_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Lessons" ALTER COLUMN "course_id" DROP NOT NULL,
ALTER COLUMN "created_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Questions" ALTER COLUMN "exam_id" DROP NOT NULL,
ALTER COLUMN "created_at" DROP NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Exam_Attempts_exam_id_user_id_idx" ON "Exam_Attempts"("exam_id", "user_id");

-- CreateIndex
CREATE INDEX "Exam_Attempts_submit_datetime_idx" ON "Exam_Attempts"("submit_datetime");

-- CreateIndex
CREATE INDEX "Exams_open_at_idx" ON "Exams"("open_at");

-- CreateIndex
CREATE INDEX "Exams_close_at_idx" ON "Exams"("close_at");

-- CreateIndex
CREATE UNIQUE INDEX "Exams_course_id_exam_access_code_key" ON "Exams"("course_id", "exam_access_code");

-- AddForeignKey
ALTER TABLE "Course_Enrollments" ADD CONSTRAINT "Course_Enrollments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course_Enrollments" ADD CONSTRAINT "Course_Enrollments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("course_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcements" ADD CONSTRAINT "Announcements_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("course_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lessons" ADD CONSTRAINT "Lessons_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("course_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson_Attachments" ADD CONSTRAINT "Lesson_Attachments_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "Lessons"("lesson_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exams" ADD CONSTRAINT "Exams_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("course_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Questions" ADD CONSTRAINT "Questions_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "Exams"("exam_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Choices" ADD CONSTRAINT "Choices_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Questions"("question_id") ON DELETE SET NULL ON UPDATE CASCADE;
