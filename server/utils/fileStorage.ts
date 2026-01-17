import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "fs";
import { resolve, dirname } from "path";
import { logError } from "./logger";

export interface FileStorageConfig {
	basePath: string;
}

export class FileStorage {
	private basePath: string;

	constructor(config: FileStorageConfig) {
		this.basePath = config.basePath;
	}

	read<T extends Record<string, any>>(relativePath: string): T {
		const fullPath = resolve(this.basePath, relativePath);

		if (!existsSync(fullPath)) {
			return {} as T;
		}

		try {
			const content = readFileSync(fullPath, "utf-8");
			return JSON.parse(content) as T;
		} catch (error) {
			logError(`Error reading file ${fullPath}`, error);
			return {} as T;
		}
	}

	write<T extends Record<string, any>>(
		relativePath: string,
		data: T,
		options?: { pretty?: boolean }
	): void {
		const fullPath = resolve(this.basePath, relativePath);
		const directory = dirname(fullPath);

		if (!existsSync(directory)) {
			mkdirSync(directory, { recursive: true });
		}

		const content = options?.pretty
			? JSON.stringify(data, null, 2)
			: JSON.stringify(data);

		writeFileSync(fullPath, content, "utf-8");
	}

	exists(relativePath: string): boolean {
		const fullPath = resolve(this.basePath, relativePath);
		return existsSync(fullPath);
	}

	listFiles(
		relativePath: string,
		extension?: string
	): string[] {
		const fullPath = resolve(this.basePath, relativePath);

		if (!existsSync(fullPath)) {
			return [];
		}

		try {
			let files = readdirSync(fullPath);
			if (extension) {
				files = files.filter((f: string) => f.endsWith(extension));
			}
			return files;
		} catch (error) {
			logError(`Error listing directory ${fullPath}`, error);
			return [];
		}
	}
}

export function createDataStorage(): FileStorage {
	return new FileStorage({
		basePath: resolve(process.cwd(), "data"),
	});
}

