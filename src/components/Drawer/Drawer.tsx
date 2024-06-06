import React from 'react';

const DrawerBackground = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
  <div className={`Layer__drawer-background ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
);

export const Drawer = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) => {
  return (
    <>
      <DrawerBackground isOpen={isOpen} onClose={onClose} />
      <div className={`Layer__drawer ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </>
  );
};

