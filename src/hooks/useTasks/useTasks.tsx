import { useEffect, useState } from "react";
import { Layer } from "../../api/layer";
import { useLayerContext } from "../../contexts/LayerContext";
import { LoadedStatus } from "../../types/general";
import { DataModel } from "../../types/general";
import { TaskTypes } from "../../types/tasks";
import { mockData } from "./mockData";
import useSWR from "swr";
import { APIError } from "../../models/APIError";

type UseTasks = () => {
  data?: TaskTypes[];
  isLoading?: boolean;
  loadedStatus?: LoadedStatus;
  isValidating?: boolean;
  error?: unknown;
  refetch: () => void;
  submitResponseToTask: (taskId: string, userResponse: string) => void;
  uploadDocumentForTask: (taskId: string, file: File) => void;
};

const DEBUG_MODE = false;

export const useTasks: UseTasks = () => {
  const [loadedStatus, setLoadedStatus] = useState<LoadedStatus>("initial");
  const {
    auth,
    businessId,
    apiUrl,
    read,
    syncTimestamps,
    hasBeenTouched,
    addToast,
  } = useLayerContext();

  const queryKey = businessId && auth?.access_token && `tasks-${businessId}`;

  const { data, isLoading, isValidating, error, mutate } = useSWR(
    queryKey,
    Layer.getTasks(apiUrl, auth?.access_token, {
      params: { businessId },
    })
  );

  useEffect(() => {
    if (isLoading && loadedStatus === "initial") {
      setLoadedStatus("loading");
    } else if (!isLoading && loadedStatus === "loading") {
      setLoadedStatus("complete");
    }
  }, [isLoading]);

  const refetch = () => mutate();

  const uploadDocumentForTask = async (taskId: string, file: File) => {
    const uploadDocument = Layer.completeTaskWithUpload(
      apiUrl,
      auth.access_token
    );
    try {
      await uploadDocument({
        businessId,
        taskId,
        file,
      });
      refetch();
    } catch (e) {
      const apiError = e as APIError;
      addToast({
        content:
          apiError.messages?.length &&
          apiError.messages[0].description &&
          apiError.messages[0].description.includes(
            "not valid for document type"
          )
            ? "Invalid document type "
            : "Unknown error occurred",
        duration: 3000,
      });
      throw e;
    }
  };

  const submitResponseToTask = (taskId: string, userResponse: string) => {
    if (!taskId || !userResponse || userResponse.length === 0) return;

    const data = {
      type: "FreeResponse",
      user_response: userResponse,
    };

    Layer.submitResponseToTask(apiUrl, auth?.access_token, {
      params: { businessId, taskId },
      body: data,
    }).then(() => refetch());
  };

  // Refetch data if related models has been changed since last fetch
  useEffect(() => {
    if (queryKey && (isLoading || isValidating)) {
      read(DataModel.TASKS, queryKey);
    }
  }, [isLoading, isValidating]);

  useEffect(() => {
    if (queryKey && hasBeenTouched(queryKey)) {
      refetch();
    }
  }, [syncTimestamps]);

  return {
    data: DEBUG_MODE ? mockData : data?.data,
    isLoading,
    loadedStatus,
    isValidating,
    error,
    refetch,
    submitResponseToTask,
    uploadDocumentForTask,
  };
};
