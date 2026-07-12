type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

type RequestBody = Json | BodyInit;

interface ApiRequestOptions extends Omit<RequestInit, "method" | "body"> {
  method?: HttpMethod;
  params?: Record<string, string | number | boolean | undefined>;
  body?: RequestBody;
}

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined.");
}

function buildUrl(endpoint: string, params?: ApiRequestOptions["params"]) {
  const url = new URL(endpoint, API_URL);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url.toString();
}

async function request<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { params, headers, body, ...rest } = options;

  const isFormData = body instanceof FormData;

  const requestBody =
    body == null
      ? undefined
      : isFormData ||
          typeof body === "string" ||
          body instanceof Blob ||
          body instanceof URLSearchParams ||
          body instanceof ArrayBuffer ||
          body instanceof ReadableStream
        ? body
        : JSON.stringify(body);

  const response = await fetch(buildUrl(endpoint, params), {
    ...rest,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...headers,
    },
    body: requestBody,
  });

  let data: unknown = null;

  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    throw new ApiError(response.status, response.statusText, data);
  }

  return data as T;
}

export const api = {
  get: <T>(url: string, params?: ApiRequestOptions["params"]) =>
    request<T>(url, {
      method: "GET",
      params,
    }),

  post: <T>(url: string, body?: RequestBody) =>
    request<T>(url, {
      method: "POST",
      body,
      headers: {
        "Content-Type": "application/json",
      },
    }),

  postFile: <T>(url: string, formData: FormData) =>
    request<T>(url, {
      method: "POST",
      body: formData,
    }),

  put: <T>(url: string, body?: RequestBody) =>
    request<T>(url, {
      method: "PUT",
      body,
    }),

  patch: <T>(url: string, body?: RequestBody) =>
    request<T>(url, {
      method: "PATCH",
      body,
    }),

  delete: <T>(url: string) =>
    request<T>(url, {
      method: "DELETE",
    }),

  upload: <T>(url: string, formData: FormData) =>
    request<T>(url, {
      method: "POST",
      body: formData,
    }),
};
