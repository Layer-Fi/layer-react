import React, { useContext, useEffect, useState } from "react";
import { TasksContext } from "../../contexts/TasksContext";
import AlertCircle from "../../icons/AlertCircle";
import Check from "../../icons/Check";
import ChevronDownFill from "../../icons/ChevronDownFill";
import { isComplete, TaskTypes } from "../../types/tasks";
import { Button, ButtonVariant } from "../Button";
import { FileInput } from "../Input";
import { Textarea } from "../Textarea";
import { Text, TextSize } from "../Typography";
import classNames from "classnames";

export const TasksListItem = ({
  task,
  goToNextPageIfAllComplete,
  defaultOpen,
}: {
  task: TaskTypes;
  goToNextPageIfAllComplete: (task: TaskTypes) => void;
  defaultOpen: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [userResponse, setUserResponse] = useState(task.user_response || "");

  const { submitResponseToTask, uploadDocumentsForTask } =
    useContext(TasksContext);

  const taskBodyClassName = classNames(
    "Layer__tasks-list-item__body",
    isOpen && "Layer__tasks-list-item__body--expanded",
    isComplete(task.status) && "Layer__tasks-list-item--completed"
  );

  const taskHeadClassName = classNames(
    "Layer__tasks-list-item__head-info",
    isComplete(task.status)
      ? "Layer__tasks-list-item--completed"
      : "Layer__tasks-list-item--pending"
  );

  const taskItemClassName = classNames(
    "Layer__tasks-list-item",
    isOpen && "Layer__tasks-list-item__expanded"
  );

  useEffect(() => {
    setIsOpen(defaultOpen);
  }, [defaultOpen]);

  return (
    <div className="Layer__tasks-list-item-wrapper">
      <div className={taskItemClassName}>
        <div
          className="Layer__tasks-list-item__head"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className={taskHeadClassName}>
            <div className="Layer__tasks-list-item__head-info__status">
              {isComplete(task.status) ? (
                <Check size={12} />
              ) : (
                <AlertCircle size={12} />
              )}
            </div>
            <Text size={TextSize.md}>{task.title}</Text>
          </div>
          <ChevronDownFill
            size={16}
            className="Layer__tasks__expand-icon"
            style={{
              transform: isOpen ? "rotate(0deg)" : "rotate(-180deg)",
            }}
          />
        </div>
        <div className={taskBodyClassName}>
          <div className="Layer__tasks-list-item__body-info">
            <Text size={TextSize.sm}>{task.question}</Text>
            {task.user_response_type === "FREE_RESPONSE" ? (
              <Textarea
                value={userResponse}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setUserResponse(e.target.value)
                }
              />
            ) : null}
            <div className="Layer__tasks-list-item__actions">
              {task.user_response_type === "UPLOAD_DOCUMENT" ? (
                <FileInput
                  onUpload={(files: File[]) => {
                    uploadDocumentsForTask(task.id, files);
                    setIsOpen(false);
                    goToNextPageIfAllComplete(task);
                  }}
                  text="Upload file(s)"
                  disabled={
                    task.completed_at != null ||
                    task.user_marked_completed_at != null ||
                    task.archived_at != null
                  }
                />
              ) : (
                <Button
                  disabled={
                    userResponse.length === 0 ||
                    userResponse === task.user_response
                  }
                  variant={ButtonVariant.secondary}
                  onClick={() => {
                    submitResponseToTask(task.id, userResponse);
                    setIsOpen(false);
                    goToNextPageIfAllComplete(task);
                  }}
                >
                  {userResponse && userResponse.length === 0
                    ? "Update"
                    : "Save"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
