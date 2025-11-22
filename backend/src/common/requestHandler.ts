import axios, { AxiosRequestConfig } from 'axios';

const activeRequests: Map<string, AbortController> = new Map();

export async function initiateHttpRequest(
  uniqueId: string,
  requestConfig: AxiosRequestConfig,
) {
  const abortController = new AbortController();
  activeRequests.set(uniqueId, abortController);
  console.debug(`Request with ID ${uniqueId} has been initiated.`);
  try {
    const response = await axios({
      ...requestConfig,
      signal: abortController.signal,
    });
    return response.data;
  } finally {
    activeRequests.delete(uniqueId);
    console.debug(`Request with ID ${uniqueId} has been completed.`);
  }
}

export function cancelHttpRequest(uniqueId: string) {
  const abortController = activeRequests.get(uniqueId);
  if (abortController) {
    abortController.abort();
    console.info(`Request with ID ${uniqueId} has been canceled.`);
  } else {
    console.debug(`No active request found with ID ${uniqueId}`);
  }
}
