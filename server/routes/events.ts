import { readFileSync } from "fs";
import { resolve } from "path";

export default defineEventHandler((event) => {
	try {
		const filePath = resolve(process.cwd(), "public/index.ttl");
		const content = readFileSync(filePath, "utf-8");

		setHeader(event, "Content-Type", "text/turtle; charset=utf-8");
		return content;
	} catch (error) {
		console.error("Error loading events:", error);
		throw createError({
			statusCode: 500,
			statusMessage: "Failed to load events",
		});
	}
});

