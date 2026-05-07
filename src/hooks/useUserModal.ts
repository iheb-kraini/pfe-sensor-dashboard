import { useState } from "react";

export function useUserModal() {
  const [open, setOpen] = useState(false);

  const openCreate = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  return { open, openCreate, onClose };
}
