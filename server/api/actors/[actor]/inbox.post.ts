export default defineEventHandler(async (event) => {
  const actorId = event.context.params?.actor;
  const body = await readBody(event);

  console.log(`Received activity in inbox for actor ${actorId}:`, body);

  return {
    status: "success",
    message: "Activity received"
  };
});
