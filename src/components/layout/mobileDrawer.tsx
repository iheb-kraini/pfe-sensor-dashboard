// components/MobileSidebar.tsx
import { Drawer } from "@chakra-ui/react";
import { useSidebarStore } from "../../store/sidebarStore";
import { Sidebar } from "./Sidebar";

export default function MobileSidebar() {
  const { isOpen, onClose } = useSidebarStore();

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={({ open }) => !open && onClose()}
      placement="start"
      size={"xs"}
    >
      <Drawer.Backdrop />
      <Drawer.Positioner>
        <Drawer.Content
          style={{
            height: "100dvh",
            maxWidth: "240px", // ← matches your sidebar width exactly
          }}
        >
          <Drawer.CloseTrigger />
          <Drawer.Body p={0}>
            <Sidebar />
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Positioner>
    </Drawer.Root>
  );
}
