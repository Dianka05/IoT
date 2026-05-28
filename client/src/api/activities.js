import { request, unwrapData } from "./request";

export async function getActivities({
  limit = 50,
  type,
  entityId,
  activityType,
} = {}) {
  const query = new URLSearchParams();
  query.set("limit", String(limit));

  if (type) query.set("type", type);
  if (entityId) query.set("entityId", entityId);
  if (activityType) query.set("activityType", activityType);

  const payload = await request(`/activities?${query.toString()}`);
  const data = unwrapData(payload);

  return data?.items || [];
}
