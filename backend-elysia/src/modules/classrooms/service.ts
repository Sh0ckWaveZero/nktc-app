import { prisma } from "@/libs/prisma";
import { classroomInclude } from "./model";
import * as XLSX from "xlsx";

export abstract class ClassroomService {
	static async getAll() {
		return prisma.classroom.findMany({
			include: classroomInclude,
			orderBy: { name: "asc" },
		});
	}

	static async create(data: any) {
		return prisma.classroom.create({
			data,
			include: classroomInclude,
		});
	}

	static async getByTeacher(teacherId: string) {
		const assignments = await prisma.teacherOnClassroom.findMany({
			where: { teacherId },
			select: { classroomId: true },
		});
		const classroomIds = assignments.map((a) => a.classroomId);
		return prisma.classroom.findMany({
			where: { id: { in: classroomIds } },
			include: classroomInclude,
		});
	}

	static async search(params: {
		departmentId?: string;
		programId?: string;
		levelId?: string;
		name?: string;
	}) {
		const { departmentId, programId, levelId, name } = params;
		return prisma.classroom.findMany({
			where: {
				...(departmentId ? { departmentId } : {}),
				...(programId ? { programId } : {}),
				...(levelId ? { levelId } : {}),
				...(name ? { name: { contains: name, mode: "insensitive" } } : {}),
			},
			include: classroomInclude,
			orderBy: { name: "asc" },
		});
	}

	static async delete(id: string) {
		await prisma.classroom.delete({ where: { id } });
	}

	static async importFromXLSX(fileBase64: string, userId: string) {
		const buffer = Buffer.from(fileBase64, "base64");
		const workbook = XLSX.read(buffer, { type: "buffer" });
		const sheet = workbook.Sheets[workbook.SheetNames[0]];
		const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
			raw: false,
		});

		const schema: Record<string, string> = {
			"รหัสห้องเรียน*": "classroomId",
			"ชื่อห้องเรียน*": "name",
			"รหัสสาขา": "programId",
			"รหัสแผนก": "departmentId",
			"รหัสระดับ": "levelId",
		};

		let success = 0;
		const errors: Array<{ row: number; message: string }> = [];

		for (let i = 0; i < rows.length; i++) {
			const row = rows[i];
			try {
				const record: Record<string, unknown> = {};
				for (const [xlsxCol, dbField] of Object.entries(schema)) {
					const value = row[xlsxCol];
					if (value !== undefined && value !== null && value !== "") {
						record[dbField] = value;
					}
				}
				if (!record.name) {
					errors.push({ row: i + 2, message: "Name is required" });
					continue;
				}
				await prisma.classroom.create({
					data: {
						classroomId: record.classroomId as string | undefined,
						name: record.name as string,
						programId: record.programId as string | undefined,
						departmentId: record.departmentId as string | undefined,
						levelId: record.levelId as string | undefined,
						createdBy: userId,
					},
				});
				success++;
			} catch (error) {
				errors.push({
					row: i + 2,
					message: error instanceof Error ? error.message : "Unknown error",
				});
			}
		}
		return { success, errors };
	}

	static generateTemplate(): Buffer {
		const headers = [
			["รหัสห้องเรียน*", "ชื่อห้องเรียน*", "รหัสสาขา", "รหัสแผนก", "รหัสระดับ"],
		];
		const worksheet = XLSX.utils.aoa_to_sheet(headers);
		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, worksheet, "ห้องเรียน");
		return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
	}
}