import { storage } from "@/libs/storage";
import { NotFoundError } from "@/libs/errors";

const contentTypes: Record<string, string> = {
	webp: "image/webp",
	jpg: "image/jpeg",
	jpeg: "image/jpeg",
	png: "image/png",
	gif: "image/gif",
	pdf: "application/pdf",
	xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	xls: "application/vnd.ms-excel",
};

export abstract class StaticsService {
	static async getFile(folder: string, filename: string) {
		const objectName = `${folder}/${filename}`;
		try {
			return await storage.getFile(objectName);
		} catch {
			throw new NotFoundError(`File not found: ${filename}`);
		}
	}

	static getContentType(filename: string): string {
		const ext = filename.split(".").pop()?.toLowerCase();
		return contentTypes[ext || ""] || "application/octet-stream";
	}
}