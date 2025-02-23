interface Project {
  id: string,
  name: string,
}

export async function login(body: {
  email: string,
  password: string,
}): Promise<{ token: string }> {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function authorize(query: {
  responseType: string,
  clientId: string,
  redirectUri: string,
  scope: Array<string>,
}): Promise<void> {
  const qs = new URLSearchParams({
    response_type: query.responseType,
    client_id: query.clientId,
    redirect_uri: query.redirectUri,
    scope: query.scope.join(","),
  });
  await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/oauth2/authorize?${qs}`, {
    headers: {
      authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
}

export async function getProject(id: string): Promise<Project> {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/projects/${id}`);
  return res.json();
}
