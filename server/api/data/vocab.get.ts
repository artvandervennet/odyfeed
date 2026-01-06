import { readFileSync } from "fs";
import { resolve } from "path";
import { DATA_PATHS, DEFAULTS } from "~~/shared/constants";

export default defineEventHandler((event) => {
  const config = useRuntimeConfig();
  const baseUrl = config.public.baseUrl || DEFAULTS.BASE_URL;
  const path = resolve(process.cwd(), DATA_PATHS.VOCAB);
  const raw = readFileSync(path, "utf-8");
  
  // Note: Vocabulary is kept file-based as it's static. Can be migrated to Firestore if needed.
  const jsonld = raw.replace(/\.\//g, baseUrl);

  setResponseHeader(event, "Content-Type", "application/ld+json");
  return JSON.parse(jsonld);
});
