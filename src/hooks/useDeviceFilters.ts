import { useState } from "react";
import { useDebounce } from "use-debounce";
import type { DeviceQuery } from "../types/device.types";

export function useDeviceFilters() {
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState<boolean | "">("");

  const [debouncedName] = useDebounce(name, 400);

  const filters: DeviceQuery = {
    ...(debouncedName && { name: debouncedName }),
    ...(isActive !== "" && { isActive }),
  };

  const hasFilters = !!debouncedName || isActive !== "";

  const resetFilters = () => {
    setName("");
    setIsActive("");
  };

  return {
    name,
    isActive,
    filters,
    hasFilters,
    setName,
    setIsActive,
    resetFilters,
  };
}
