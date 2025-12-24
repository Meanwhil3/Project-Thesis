-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('HIDE', 'SHOW');

-- CreateEnum
CREATE TYPE "LessonStatus" AS ENUM ('OPEN', 'CLOSE');

-- CreateEnum
CREATE TYPE "ExamType" AS ENUM ('FILL IN THE BLANK', 'MULTIPLE CHOICE');

-- CreateEnum
CREATE TYPE "ExamStatus" AS ENUM ('HIDE', 'SHOW');

-- CreateEnum
CREATE TYPE "AttemptStatus" AS ENUM ('IN PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "WoodStatus" AS ENUM ('HIDE', 'SHOW');

-- CreateEnum
CREATE TYPE "WoodWeight" AS ENUM ('LIGHT', 'MEDIUM', 'HEAVY');

-- CreateEnum
CREATE TYPE "RaysPerMm" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "Role" (
    "role_id" BIGSERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "User" (
    "user_id" BIGSERIAL NOT NULL,
    "role_id" BIGINT,
    "first_name" VARCHAR(120) NOT NULL,
    "last_name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" TEXT NOT NULL,
    "is_active" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Course" (
    "course_id" BIGSERIAL NOT NULL,
    "course_name" VARCHAR(255) NOT NULL,
    "enroll_code" VARCHAR(255),
    "course_description" TEXT,
    "image_url" TEXT,
    "location" TEXT,
    "course_status" "CourseStatus",
    "start_date" TIMESTAMPTZ,
    "end_date" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("course_id")
);

-- CreateTable
CREATE TABLE "Course_Enrollments" (
    "enrollment_id" BIGSERIAL NOT NULL,
    "user_id" BIGINT,
    "course_id" BIGINT,
    "enrollment_date" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "Course_Enrollments_pkey" PRIMARY KEY ("enrollment_id")
);

-- CreateTable
CREATE TABLE "Instructor" (
    "user_id" BIGINT NOT NULL,
    "course_id" BIGINT NOT NULL,

    CONSTRAINT "Instructor_pkey" PRIMARY KEY ("user_id","course_id")
);

-- CreateTable
CREATE TABLE "Announcements" (
    "announcement_id" BIGSERIAL NOT NULL,
    "course_id" BIGINT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,
    "created_by" BIGINT,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "Announcements_pkey" PRIMARY KEY ("announcement_id")
);

-- CreateTable
CREATE TABLE "Lessons" (
    "lesson_id" BIGSERIAL NOT NULL,
    "course_id" BIGINT,
    "lesson_title" TEXT NOT NULL,
    "lesson_content" TEXT NOT NULL,
    "lesson_status" "LessonStatus",
    "created_at" TIMESTAMPTZ NOT NULL,
    "created_by" BIGINT,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "Lessons_pkey" PRIMARY KEY ("lesson_id")
);

-- CreateTable
CREATE TABLE "Lesson_Attachments" (
    "attachment_id" BIGSERIAL NOT NULL,
    "lesson_id" BIGINT,
    "display_name" VARCHAR(255) NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ,

    CONSTRAINT "Lesson_Attachments_pkey" PRIMARY KEY ("attachment_id")
);

-- CreateTable
CREATE TABLE "Exams" (
    "exam_id" BIGSERIAL NOT NULL,
    "course_id" BIGINT,
    "exam_title" TEXT NOT NULL,
    "exam_description" TEXT,
    "exam_type" "ExamType",
    "duration_minute" INTEGER NOT NULL,
    "exam_status" "ExamStatus",
    "created_at" TIMESTAMPTZ NOT NULL,
    "created_by" BIGINT,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "Exams_pkey" PRIMARY KEY ("exam_id")
);

-- CreateTable
CREATE TABLE "Questions" (
    "question_id" BIGSERIAL NOT NULL,
    "exam_id" BIGINT,
    "score" INTEGER NOT NULL,
    "question_detail" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "Questions_pkey" PRIMARY KEY ("question_id")
);

-- CreateTable
CREATE TABLE "Choices" (
    "choice_id" BIGSERIAL NOT NULL,
    "question_id" BIGINT,
    "choice_detail" TEXT NOT NULL,
    "is_correct" BOOLEAN,
    "created_at" TIMESTAMPTZ,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "Choices_pkey" PRIMARY KEY ("choice_id")
);

-- CreateTable
CREATE TABLE "Exam_Attempts" (
    "attempt_id" BIGSERIAL NOT NULL,
    "user_id" BIGINT,
    "exam_id" BIGINT,
    "attempt_status" "AttemptStatus",
    "total_score" INTEGER NOT NULL,
    "submit_datetime" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "Exam_Attempts_pkey" PRIMARY KEY ("attempt_id")
);

-- CreateTable
CREATE TABLE "Wood" (
    "wood_id" BIGSERIAL NOT NULL,
    "scientific_name" VARCHAR(255),
    "common_name" VARCHAR(255),
    "wood_origin" VARCHAR(255),
    "wood_description" TEXT,
    "wood_status" "WoodStatus",
    "wood_taste" VARCHAR(255),
    "wood_odor" VARCHAR(255),
    "wood_Texture" VARCHAR(255),
    "wood_luster" VARCHAR(255),
    "wood_grain" VARCHAR(255),
    "wood_weight" "WoodWeight",
    "wood_colors" VARCHAR(255),
    "sapwood_heartwood_color_diff" VARCHAR(255),
    "growth_rings" VARCHAR(255),
    "included_phloem" VARCHAR(255),
    "intercellular_canals" VARCHAR(255),
    "vp_porosity" VARCHAR(255),
    "vp_vessel_grouping" VARCHAR(255),
    "vp_vessel_arrangement" VARCHAR(255),
    "vp_inclusions_in_Pores" VARCHAR(255),
    "vp_Pores_frequency" VARCHAR(255),
    "vp_Pores_size" VARCHAR(255),
    "vp_Pores_rays_ratio" VARCHAR(255),
    "rays_per_mm" "RaysPerMm",
    "rays_width" VARCHAR(255),
    "rays_two_distinct_sizes" VARCHAR(255),
    "rays_aggregate" VARCHAR(255),
    "rays_storied_ripple_mark" VARCHAR(255),
    "rays_deposit_in_rays" VARCHAR(255),
    "ap_type" VARCHAR(255),
    "ap_paratracheal" VARCHAR(255),
    "ap_apotracheal" VARCHAR(255),
    "ap_banded" VARCHAR(255),
    "created_by" BIGINT,
    "deleted_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "Wood_pkey" PRIMARY KEY ("wood_id")
);

-- CreateTable
CREATE TABLE "Wood_Images" (
    "image_id" BIGSERIAL NOT NULL,
    "wood_id" BIGINT,
    "image_url" TEXT NOT NULL,
    "image_description" TEXT,
    "date_added" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Wood_Images_pkey" PRIMARY KEY ("image_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_Attachments_file_path_key" ON "Lesson_Attachments"("file_path");

-- CreateIndex
CREATE UNIQUE INDEX "Wood_Images_image_url_key" ON "Wood_Images"("image_url");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("role_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course_Enrollments" ADD CONSTRAINT "Course_Enrollments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course_Enrollments" ADD CONSTRAINT "Course_Enrollments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("course_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Instructor" ADD CONSTRAINT "Instructor_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Instructor" ADD CONSTRAINT "Instructor_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("course_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcements" ADD CONSTRAINT "Announcements_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("course_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcements" ADD CONSTRAINT "Announcements_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lessons" ADD CONSTRAINT "Lessons_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("course_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lessons" ADD CONSTRAINT "Lessons_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson_Attachments" ADD CONSTRAINT "Lesson_Attachments_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "Lessons"("lesson_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exams" ADD CONSTRAINT "Exams_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("course_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exams" ADD CONSTRAINT "Exams_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Questions" ADD CONSTRAINT "Questions_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "Exams"("exam_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Choices" ADD CONSTRAINT "Choices_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Questions"("question_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam_Attempts" ADD CONSTRAINT "Exam_Attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam_Attempts" ADD CONSTRAINT "Exam_Attempts_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "Exams"("exam_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wood" ADD CONSTRAINT "Wood_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wood_Images" ADD CONSTRAINT "Wood_Images_wood_id_fkey" FOREIGN KEY ("wood_id") REFERENCES "Wood"("wood_id") ON DELETE SET NULL ON UPDATE CASCADE;
