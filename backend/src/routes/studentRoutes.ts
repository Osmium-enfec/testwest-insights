import { Router } from "express";
import { z } from "zod";
import {
  listStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  listStudentTests,
  getStudentDashboard,
} from "../controllers/studentController";
import { validate } from "../middleware/validate";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

const createSchema = z.object({
  body: z.object({
    user: z.object({
      email: z.string().email(),
      password: z.string().min(8),
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      avatarUrl: z.string().optional(),
      bio: z.string().optional(),
      phone: z.string().optional(),
      city: z.string().optional(),
    }),
    profile: z.object({
      grade: z.number().min(1).max(12),
      board: z.string().min(1),
      avatarUrl: z.string().optional(),
      schoolId: z.string().optional(),
      classId: z.string().optional(),
      section: z.string().optional(),
      rollNo: z.string().optional(),
    }),
  }),
});

const updateSchema = z.object({
  body: z.object({
    user: z
      .object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        avatarUrl: z.string().optional(),
        bio: z.string().optional(),
        phone: z.string().optional(),
        city: z.string().optional(),
      })
      .optional(),
    profile: z
      .object({
        grade: z.number().min(1).max(12).optional(),
        board: z.string().optional(),
        avatarUrl: z.string().optional(),
        schoolId: z.string().optional(),
        classId: z.string().optional(),
        section: z.string().optional(),
        rollNo: z.string().optional(),
        subjects: z.array(z.string()).optional(),
        subjectChapters: z
          .array(
            z.object({
              subject: z.string(),
              chapters: z.array(z.string()),
            }),
          )
          .optional(),
      })
      .optional(),
  }),
});

/**
 * @openapi
 * /students:
 *   get:
 *     summary: List students (requires auth)
 *     tags:
 *       - Students
 *     responses:
 *       '200':
 *         description: Array of students
 *       '401':
 *         description: Missing or invalid token
 */
router.get("/", requireAuth, listStudents);

/**
 * @openapi
 * /students:
 *   post:
 *     summary: Create a student (school role required)
 *     tags:
 *       - Students
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StudentCreateRequest'
 *     responses:
 *       '201':
 *         description: Student created
 *       '400':
 *         description: Validation error
 */
router.post("/", requireAuth, requireRole(["SCHOOL"]), validate(createSchema), createStudent);

/**
 * @openapi
 * /students/{id}:
 *   get:
 *     summary: Get a student by ID
 *     tags:
 *       - Students
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Student object
 *       '404':
 *         description: Not found
 */
router.get("/:id", requireAuth, getStudent);

/**
 * @openapi
 * /students/{id}:
 *   patch:
 *     summary: Update a student by ID
 *     tags:
 *       - Students
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StudentUpdateRequest'
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Updated student
 */
router.patch("/:id", requireAuth, validate(updateSchema), updateStudent);

/**
 * @openapi
 * /students/{id}:
 *   delete:
 *     summary: Delete a student (school role required)
 *     tags:
 *       - Students
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: Deleted
 */
router.delete("/:id", requireAuth, requireRole(["SCHOOL"]), deleteStudent);

/**
 * @openapi
 * /students/{id}/tests:
 *   get:
 *     summary: List tests for a student
 *     tags:
 *       - Students
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Array of tests
 */
router.get("/:id/tests", requireAuth, listStudentTests);

/**
 * @openapi
 * /students/{id}/dashboard:
 *   get:
 *     summary: Get student dashboard data
 *     tags:
 *       - Students
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Dashboard data
 */
router.get("/:id/dashboard", requireAuth, getStudentDashboard);

export default router;
