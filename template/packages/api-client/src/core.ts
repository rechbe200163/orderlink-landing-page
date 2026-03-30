import { FormState } from '../../../apps/web/lib/fom.types';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: Record<string, string[]>
  ) {
    super(message);
  }
}

type RequestOptions<TBody = unknown> = {
  body?: TBody;
  query?: Record<string, any>;
  headers?: HeadersInit;
};

type ApiClientHooks = {
  /** z.B. Cookie/Session Token holen */
  getAccessToken?: () => Promise<string | undefined> | (string | undefined);
  /** z.B. forbidden(), redirect('/login'), logout(), ... */
  onAuthError?: (status: number) => void | Promise<void>;
};

export class ApiClient {
  constructor(
    private baseUrl: string,
    private hooks: ApiClientHooks = {}
  ) {}

  private async request<TResponse, TBody = unknown>(
    path: string,
    method: string,
    body?: TBody,
    query?: Record<string, any>,
    headers?: HeadersInit
  ): Promise<TResponse> {
    const queryString = this.buildQuery(query);

    const token = await this.hooks.getAccessToken?.();
    const resp = await fetch(`${this.baseUrl}${path}${queryString}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers || {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    });

    if (!resp.ok) {
      let errorBody: any = null;
      try {
        errorBody = await resp.json();
      } catch {
        // ignore
      }

      // Optional: 401/403 Hook (server kann forbidden(), client kann redirect/logout)
      if (resp.status === 401 || resp.status === 403) {
        await this.hooks.onAuthError?.(resp.status);
      }

      const message =
        errorBody?.message ||
        errorBody?.error ||
        `HTTP ${resp.status} (${resp.statusText})`;

      const errors: Record<string, string[]> | undefined =
        errorBody?.errors ?? undefined;

      throw new ApiError(message, resp.status, errors);
    }

    if (resp.status === 204) {
      return undefined as TResponse;
    }

    const contentType = resp.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      return undefined as TResponse;
    }

    return (await resp.json()) as TResponse;
  }

  private buildQuery(query?: Record<string, any>): string {
    if (!query) return '';
    const params = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (Array.isArray(value))
        value.forEach((v) => params.append(key, String(v)));
      else params.append(key, String(value));
    });

    const qs = params.toString();
    return qs ? `?${qs}` : '';
  }

  // Raw HTTP
  public get<TResponse>(
    path: string,
    opts?: { query?: Record<string, any>; headers?: HeadersInit }
  ) {
    return this.request<TResponse, void>(
      path,
      'GET',
      undefined,
      opts?.query,
      opts?.headers
    );
  }

  public post<TResponse, TBody>(path: string, opts?: RequestOptions<TBody>) {
    return this.request<TResponse, TBody>(
      path,
      'POST',
      opts?.body,
      opts?.query,
      opts?.headers
    );
  }

  public patch<TResponse, TBody>(
    path: string,
    body: TBody,
    opts?: { headers?: HeadersInit }
  ) {
    return this.request<TResponse, TBody>(
      path,
      'PATCH',
      body,
      undefined,
      opts?.headers
    );
  }

  public delete<TResponse = void>(
    path: string,
    opts?: { headers?: HeadersInit }
  ) {
    return this.request<TResponse, void>(
      path,
      'DELETE',
      undefined,
      undefined,
      opts?.headers
    );
  }

  public async safePost<TResponse extends { id?: string | number }, TBody>(
    path: string,
    opts?: RequestOptions<TBody>
  ): Promise<FormState> {
    try {
      const data = await this.post<TResponse, TBody>(path, opts);

      return {
        success: true,
        message: 'OK',
        data: data?.id,
      };
    } catch (err) {
      return this.mapError(err);
    }
  }

  public async safeGet<TResponse extends { id?: string | number }>(
    path: string,
    opts?: { query?: Record<string, any> }
  ): Promise<FormState> {
    try {
      const data = await this.get<TResponse>(path, opts);

      return {
        success: true,
        message: 'OK',
        data: data?.id,
      };
    } catch (err) {
      return this.mapError(err);
    }
  }

  public async safePatch<TResponse extends { id?: string | number }, TBody>(
    path: string,
    body: TBody
  ): Promise<FormState> {
    try {
      const data = await this.patch<TResponse, TBody>(path, body);

      return {
        success: true,
        message: 'OK',
        data: data?.id,
      };
    } catch (err) {
      return this.mapError(err);
    }
  }

  public async safeDelete(path: string): Promise<FormState> {
    try {
      await this.delete(path);

      return {
        success: true,
        message: 'OK',
      };
    } catch (err) {
      return this.mapError(err);
    }
  }

  // ---------------------------
  // Fehler-Mapping → immer FormState
  // ---------------------------
  private mapError(err: any): FormState {
    if (err instanceof ApiError) {
      return {
        success: false,
        message: err.message,
        errors: err.errors,
      };
    }

    // technische Fehler (Network, Timeout, etc.)
    return {
      success: false,
      message: 'Interner Fehler – bitte später erneut versuchen.' + err,
    };
  }
}
