import { getApiBase } from "@/lib/api";

export type Role = "admin" | "user";

export type AuthState = {
  email: string;
  role: Role;
  name?: string;
  clientId?: number;
};

export type RegisterInput = {
  name: string;
  email: string;
  document: string;
  password: string;
};

const STORAGE_KEY = "financas_auth";

type AuthResponse = {
  id: number;
  name: string;
  email: string;
  role: Role;
};

export async function login(email: string, password: string): Promise<AuthState | null> {
  const res = await fetch(`${getApiBase()}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim(), password }),
  });

  if (!res.ok) {
    return null;
  }

  const data = (await res.json()) as AuthResponse;
  const auth: AuthState = { email: data.email, role: data.role, name: data.name };

  if (data.role !== "admin") {
    try {
      const clientRes = await fetch(
        `${getApiBase()}/api/v1/clients/email/${encodeURIComponent(data.email)}`
      );
      if (clientRes.ok) {
        const client = (await clientRes.json()) as { id: number };
        auth.clientId = client.id;
      }
    } catch {
      // ignore lookup errors
    }
  }
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
  }
  return auth;
}

export async function ensureClientId(auth: AuthState | null): Promise<number | null> {
  if (!auth || auth.role === "admin") return null;
  if (auth.clientId) return auth.clientId;
  try {
    const res = await fetch(
      `${getApiBase()}/api/v1/clients/email/${encodeURIComponent(auth.email)}`
    );
    if (!res.ok) return null;
    const client = (await res.json()) as { id: number };
    const updated = { ...auth, clientId: client.id };
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    return client.id;
  } catch {
    return null;
  }
}

export async function registerUser(input: RegisterInput): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(`${getApiBase()}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: input.name,
      email: input.email.trim(),
      document: input.document,
      password: input.password,
    }),
  });

  if (res.ok) {
    return { ok: true };
  }

  const data = await res.json().catch(() => ({}));
  if (typeof data?.detail === "string") {
    return { ok: false, error: data.detail };
  }
  if (Array.isArray(data?.detail)) {
    const message = data.detail
      .map((item: { msg?: string; loc?: (string | number)[] }) => {
        const field = item.loc?.[1];
        if (field === "name") {
          return "Nome precisa ter pelo menos 2 caracteres";
        }
        if (field === "email") {
          return "Email invalido";
        }
        if (field === "document") {
          return "Documento precisa ter pelo menos 5 caracteres";
        }
        if (field === "password") {
          return "Senha precisa ter pelo menos 6 caracteres";
        }
        return item.msg;
      })
      .filter(Boolean)
      .join(", ");
    return { ok: false, error: message || "Falha ao criar usuario" };
  }
  return { ok: false, error: "Falha ao criar usuario" };
}

export function getAuth(): AuthState | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthState;
  } catch {
    return null;
  }
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}
