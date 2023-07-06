//types
import type { Project, Directory } from 'ts-morph';

type Location = Project|Directory;

const code = `//hooks
import { useState } from 'react';
//others
import axios from 'axios';

export type APIResponse<T = any> = {
  error: boolean,
  code?: number,
  message?: string, 
  errors?: Record<string, any>,
  results?: T,
  total?: number
};
export type APIFetchCall<T = any> = (
  options: FetchCallConfig
) => Promise<APIResponse<T>>;
export type FetchStatuses = 'pending'|'fetching'|'complete';
export type FetchRouteParams = {
  args: (string|number)[],
  params: Record<string, string|number>
};
export type FetchCallConfig = {
  args?: (string|number)[],
  params?: Record<string, string|number>
  query?: Record<string, string|number>,
  data?: Record<string, any>
}

function route(path: string, route: FetchRouteParams) {
  for (const arg of route.args) {
    path = path.replace('*', String(arg));
  }

  for (const param in route.params) {
    path = path
      .replace(\`:\${param}\`, String(route.params[param]))
      .replace(\`[\${param}]\`, String(route.params[param]));
  }

  return path;
}

export default function useFetch<Model = any>(
  method: string, 
  url: string, 
  options: Record<string, any> = {}
) {
  //variables
  options.validateStatus = (status: number) => status < 500;
  //hooks
  const [ status, setStatus ] = useState<FetchStatuses>('pending');
  const [ response, set ] = useState<APIResponse<Model>>();
  //callbacks
  const reset = () => {
    set(undefined);
    setStatus('pending');
  };
  const call: APIFetchCall<Model> = async (options: FetchCallConfig) => {
    const config: Record<string, any> = { ...options, method };
    if (options.query) {
      config.params = options.query;
    }
    if (options.data) {
      config.data = options.data;
    }

    const args = options.args || [];
    const params = options.params || {};
    const path = route(url, { args, params });

    setStatus('fetching');
    const response = await axios(path, config).catch(e => ({
      data: {
        error: true,
        message: e.message || e
      }
    }));
    setStatus('complete');
    set(response.data);
    return response.data as APIResponse<Model>;
  };

  return { call, set, reset, status, response };
};`;

export default function generate(project: Location) {
  project.createSourceFile(`hooks/useFetch.ts`, code, { overwrite: true });
};