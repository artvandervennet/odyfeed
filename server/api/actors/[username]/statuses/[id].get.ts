import {existsSync, readFileSync} from "fs";
import {resolve} from "path";
import type { ASNote } from "~~/shared/types/activitypub";
import { DATA_PATHS } from "~~/shared/constants";

export default defineEventHandler((event): ASNote => {
  const username = event.context.params?.username;
  const postId = event.context.params?.id;

  const jsonPath = resolve(process.cwd(), `${DATA_PATHS.POSTS}/${username}/${postId}.jsonld`);
  
  if (!existsSync(jsonPath)) {
    throw createError({
      statusCode: 404,
      statusMessage: "Post not found",
    });
  }

  return JSON.parse(readFileSync(jsonPath, 'utf-8')) as ASNote;
});
