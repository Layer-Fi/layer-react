import { StatusOfSyncFromQuickbooks } from "../../types/quickbooks";
import { get, post } from "./authenticated_http";

export const syncFromQuickbooks = post<
  Record<string, unknown>,
  Record<string, unknown>,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/quickbooks/sync-from`);

export const statusOfSyncFromQuickbooks = get<
  { data: StatusOfSyncFromQuickbooks },
  { businessId: string }
>(
  ({ businessId }) => `/v1/businesses/${businessId}/quickbooks/sync-from/status`
);

export const initQuickbooksOAuth = post<
  {
    data: {
      type: "Quickbooks_Authorization_Params";
      redirect_url: string;
    };
  },
  Record<string, unknown>,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/quickbooks/authorize`);

export const unlinkQuickbooksConnection = post<
  Record<string, unknown>,
  Record<string, unknown>,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/quickbooks/unlink`);

/**
 * Lets user know if there exists an active Quickbooks connection or not
 */
export const statusOfQuickbooksConnection = get<
  {
    data: {
      is_connected: boolean;
    };
  },
  { businessId: string }
>(
  ({ businessId }) =>
    `/v1/businesses/${businessId}/quickbooks/connection-status`
);
