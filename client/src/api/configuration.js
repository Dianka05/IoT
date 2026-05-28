import { request, unwrapData } from "./request";

export async function getSecurityConfiguration() {
  const payload = await request("/configuration/security");
  const data = unwrapData(payload);

  return data?.item || data || null;
}

export async function updateSecurityConfiguration(body) {
  const payload = await request("/configuration/security", {
    method: "PUT",
    body: JSON.stringify(body),
  });
  const data = unwrapData(payload);

  return data?.item || data || null;
}
