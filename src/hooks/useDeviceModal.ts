import { useState } from "react";
import type { Device } from "../types/device.types";

export function useDeviceModal() {
  const [open, setOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | undefined>();

  const openCreate = () => {
    setSelectedDevice(undefined);
    setOpen(true);
  };

  const openEdit = (device: Device) => {
    setSelectedDevice(device);
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
    setSelectedDevice(undefined);
  };

  return { open, selectedDevice, openCreate, openEdit, onClose };
}
