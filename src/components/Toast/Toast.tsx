import React, { useState, forwardRef, useImperativeHandle } from 'react';
import classNames from 'classnames';

export interface ToastProps {
  id?: string;
  content: string;
  duration?: number;
}

const Toast = ({ id, content, isExiting }: ToastProps & { isExiting: boolean }) => (
  <div id={id} className={classNames('Layer__toast', { enter: !isExiting, exit: isExiting })}>
    <p>{content}</p>
  </div>
);

export const ToastsContainer = forwardRef((props, ref) => {
  const [toasts, setToasts] = useState<(ToastProps & { isExiting: boolean })[]>([]);

  useImperativeHandle(ref, () => ({
    addToast(toast: ToastProps) {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prevToasts) => [...prevToasts, { ...toast, id, isExiting: false }]);

      setTimeout(() => {
        setToasts((prevToasts) => prevToasts.map(t => t.id === id ? { ...t, isExiting: true } : t));
        setTimeout(() => {
          setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
        }, 1000);
      }, (toast.duration || 2000));
    },
  }));

  return (
    <div className="Layer__toasts-container">
      {toasts.map((toast) => (
        <Toast {...toast} />
      ))}
    </div>
  );
});
