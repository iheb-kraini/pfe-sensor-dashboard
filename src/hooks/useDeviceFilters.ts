import { useState } from "react";
import { useDebounce } from "use-debounce";
import type { DeviceQuery, DeviceStatus } from "../types/device.types";

export function useDeviceFilters() {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<DeviceStatus | "">("");
  const [isActive, setIsActive] = useState<boolean | "">("");

  const [debouncedName] = useDebounce(name, 400);

  const filters: DeviceQuery = {
    ...(debouncedName && { name: debouncedName }),
    ...(status && { status }),
    ...(isActive !== "" && { isActive }),
  };

  const hasFilters = !!debouncedName || !!status || isActive !== "";

  const resetFilters = () => {
    setName("");
    setStatus("");
    setIsActive("");
  };

  return {
    name,
    status,
    isActive,
    filters,
    hasFilters,
    setName,
    setStatus,
    setIsActive,
    resetFilters,
  };
}
