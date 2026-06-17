export interface BackendClient {
  enabled: boolean
}

export class DisabledBackendClient implements BackendClient {
  enabled = false
}

export const backendClient = new DisabledBackendClient()
