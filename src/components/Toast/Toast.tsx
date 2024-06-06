import React, { useState, forwardRef, useImperativeHandle } from 'react';
import classNames from 'classnames';
import { useLayerContext } from '../../hooks/useLayerContext';

export interface ToastProps {
  id?: string;
  content: string;
  duration?: number;
  isExiting?: boolean
}

const Toast = ({ id, content, isExiting }: ToastProps & { isExiting: boolean }) => (
  <div id={id} className={classNames('Layer__toast', { enter: !isExiting, exit: isExiting })}>
    <p>{content}</p>
  </div>
);

export const ToastsContainer = forwardRef((_props, ref) => {
  const { toasts } = useLayerContext()

  return (
    <div className="Layer__toasts-container">
      {toasts.map((toast) => (
        <Toast {...toast} />
      ))}
    </div>
  );
});
