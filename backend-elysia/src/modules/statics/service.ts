import { storage } from "@/libs/storage";

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
		return storage.getFile(objectName);
	}

	static getContentType(filename: string): string {
		const ext = filename.split(".").pop()?.toLowerCase();
		return contentTypes[ext || ""] || "application/octet-stream";
	}
}