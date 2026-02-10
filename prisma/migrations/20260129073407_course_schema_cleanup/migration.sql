/*
  Warnings:

  - A unique constraint covering the columns `[user_id,course_id]` on the table `Course_Enrollments` will be added. If there are existing duplicate values, this will fail.
  - Made the column `course_id` on table `Announcements` required. This step will fail if there are existing NULL values in that column.
  - Made the column `question_id` on table `Choices` required. This step will fail if there are existing NULL values in that column.
  - Made the column `is_correct` on table `Choices` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `Choices` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `Course` required. This step will fail if there are existing NULL values in that column.
  - Made the column `user_id` on table `Course_Enrollments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `course_id` on table `Course_Enrollments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `user_id` on table `Exam_Attempts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `exam_id` on table `Exam_Attempts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `course_id` on table `Exams` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lesson_id` on table `Lesson_Attachments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `Lesson_Attachments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `course_id` on table `Lessons` required. This step will fail if there are existing NULL values in that column.
  - Made the column `exam_id` on table `Questions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `Questions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `User` required. This step will fail if there are existing NULL values in that column.

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
ALTER TABLE "Exam_Attempts" DROP CONSTRAINT "Exam_Attempts_exam_id_fkey";

-- DropForeignKey
ALTER TABLE "Exam_Attempts" DROP CONSTRAINT "Exam_Attempts_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Exams" DROP CONSTRAINT "Exams_course_id_fkey";

-- DropForeignKey
ALTER TABLE "Lesson_Attachments" DROP CONSTRAINT "Lesson_Attachments_lesson_id_fkey";

-- DropForeignKey
ALTER TABLE "Lessons" DROP CONSTRAINT "Lessons_course_id_fkey";

-- DropForeignKey
ALTER TABLE "Questions" DROP CONSTRAINT "Questions_exam_id_fkey";

-- AlterTable
ALTER TABLE "Announcements" ALTER COLUMN "course_id" SET NOT NULL,
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Choices" ALTER COLUMN "question_id" SET NOT NULL,
ALTER COLUMN "is_correct" SET NOT NULL,
ALTER COLUMN "is_correct" SET DEFAULT false,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Course" ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Course_Enrollments" ALTER COLUMN "user_id" SET NOT NULL,
ALTER COLUMN "course_id" SET NOT NULL,
ALTER COLUMN "enrollment_date" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Exam_Attempts" ALTER COLUMN "user_id" SET NOT NULL,
ALTER COLUMN "exam_id" SET NOT NULL,
ALTER COLUMN "total_score" SET DEFAULT 0,
ALTER COLUMN "submit_datetime" DROP NOT NULL,
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Exams" ALTER COLUMN "course_id" SET NOT NULL,
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Instructor" ADD COLUMN     "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMPTZ;

-- AlterTable
ALTER TABLE "Lesson_Attachments" ALTER COLUMN "lesson_id" SET NOT NULL,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Lessons" ALTER COLUMN "course_id" SET NOT NULL,
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Questions" ALTER COLUMN "exam_id" SET NOT NULL,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Announcements_course_id_idx" ON "Announcements"("course_id");

-- CreateIndex
CREATE INDEX "Choices_question_id_idx" ON "Choices"("question_id");

-- CreateIndex
CREATE INDEX "Course_Enrollments_course_id_idx" ON "Course_Enrollments"("course_id");

-- CreateIndex
CREATE INDEX "Course_Enrollments_user_id_idx" ON "Course_Enrollments"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Course_Enrollments_user_id_course_id_key" ON "Course_Enrollments"("user_id", "course_id");

-- CreateIndex
CREATE INDEX "Exam_Attempts_user_id_idx" ON "Exam_Attempts"("user_id");

-- CreateIndex
CREATE INDEX "Exam_Attempts_exam_id_idx" ON "Exam_Attempts"("exam_id");

-- CreateIndex
CREATE INDEX "Exams_course_id_idx" ON "Exams"("course_id");

-- CreateIndex
CREATE INDEX "Instructor_course_id_idx" ON "Instructor"("course_id");

-- CreateIndex
CREATE INDEX "Lesson_Attachments_lesson_id_idx" ON "Lesson_Attachments"("lesson_id");

-- CreateIndex
CREATE INDEX "Lessons_course_id_idx" ON "Lessons"("course_id");

-- CreateIndex
CREATE INDEX "Questions_exam_id_idx" ON "Questions"("exam_id");

-- AddForeignKey
ALTER TABLE "Course_Enrollments" ADD CONSTRAINT "Course_Enrollments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course_Enrollments" ADD CONSTRAINT "Course_Enrollments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("course_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcements" ADD CONSTRAINT "Announcements_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("course_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lessons" ADD CONSTRAINT "Lessons_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("course_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson_Attachments" ADD CONSTRAINT "Lesson_Attachments_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "Lessons"("lesson_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exams" ADD CONSTRAINT "Exams_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("course_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Questions" ADD CONSTRAINT "Questions_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "Exams"("exam_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Choices" ADD CONSTRAINT "Choices_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Questions"("question_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam_Attempts" ADD CONSTRAINT "Exam_Attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam_Attempts" ADD CONSTRAINT "Exam_Attempts_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "Exams"("exam_id") ON DELETE RESTRICT ON UPDATE CASCADE;
