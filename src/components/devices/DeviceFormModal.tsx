import {
  Button,
  Dialog,
  Field,
  Input,
  Portal,
  Stack,
  NativeSelect,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Device } from "../../types/device.types";
import {
  createDeviceSchema,
  updateDeviceSchema,
  type CreateDeviceFormValues,
  type UpdateDeviceFormValues,
} from "../../schemas/device.schema";
import { useCreateDevice, useUpdateDevice } from "../../hooks/useDevices";

interface Props {
  open: boolean;
  onClose: () => void;
  device?: Device; // if provided → edit mode
}

export function DeviceFormModal({ open, onClose, device }: Props) {
  const isEdit = !!device;
  const { mutate: create, isPending: isCreating } = useCreateDevice();
  const { mutate: update, isPending: isUpdating } = useUpdateDevice(
    device?.id ?? 0,
  );
  const isPending = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateDeviceFormValues | UpdateDeviceFormValues>({
    resolver: zodResolver(isEdit ? updateDeviceSchema : createDeviceSchema),
    defaultValues: device
      ? {
          name: device.name,
          serialNumber: device.serialNumber,
          status: device.status,
          isActive: device.isActive,
        }
      : {},
  });

  // reset form when modal opens with new device
  useEffect(() => {
    if (open) {
      reset(
        device
          ? {
              name: device.name,
              serialNumber: device.serialNumber,
              status: device.status,
              isActive: device.isActive,
            }
          : {},
      );
    }
  }, [open, device, reset]);

  const onSubmit = (
    values: CreateDeviceFormValues | UpdateDeviceFormValues,
  ) => {
    if (isEdit) {
      update(values as UpdateDeviceFormValues, { onSuccess: onClose });
    } else {
      create(values as CreateDeviceFormValues, { onSuccess: onClose });
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={({ open }) => !open && onClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>
                {isEdit ? "Edit Device" : "Create Device"}
              </Dialog.Title>
            </Dialog.Header>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Dialog.Body>
                <Stack gap={4}>
                  <Field.Root invalid={!!errors.name}>
                    <Field.Label>Name</Field.Label>
                    <Input placeholder="Box-01" {...register("name")} />
                    <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
                  </Field.Root>

                  <Field.Root invalid={!!errors.serialNumber}>
                    <Field.Label>Serial Number</Field.Label>
                    <Input
                      placeholder="2356698"
                      {...register("serialNumber")}
                      disabled={isEdit} // serial number shouldn't change
                    />
                    <Field.ErrorText>
                      {errors.serialNumber?.message}
                    </Field.ErrorText>
                  </Field.Root>

                  <Field.Root invalid={!!errors.status}>
                    <Field.Label>Status</Field.Label>
                    <NativeSelect.Root>
                      <NativeSelect.Field {...register("status")}>
                        <option value="offline">Offline</option>
                        <option value="online">Online</option>
                        <option value="maintenance">Maintenance</option>
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                    <Field.ErrorText>{errors.status?.message}</Field.ErrorText>
                  </Field.Root>
                </Stack>
              </Dialog.Body>

              <Dialog.Footer>
                <Button variant="ghost" onClick={onClose} disabled={isPending}>
                  Cancel
                </Button>
                <Button type="submit" colorPalette="blue" loading={isPending}>
                  {isEdit ? "Save changes" : "Create"}
                </Button>
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
