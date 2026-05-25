import { request, unwrapData } from "./request";

export async function getOrganizations(limit = 100) {
  const payload = await request(`/organizations?limit=${limit}`);
  const data = unwrapData(payload);

  return data?.items || [];
}

export async function createOrganization(body) {
  const payload = await request("/organizations", {
    method: "POST",
    body: JSON.stringify(body),
  });
  const data = unwrapData(payload);

  return {
    organization: data?.item || payload?.item || null,
    profile: payload?.profile || data?.profile || null,
  };
}

export async function switchCurrentOrganization(organizationId) {
  const payload = await request("/organizations/current", {
    method: "PATCH",
    body: JSON.stringify({ organizationId }),
  });
  const data = unwrapData(payload);

  return data?.item || payload?.item || null;
}
