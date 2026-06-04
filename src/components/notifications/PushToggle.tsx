import { Stack, Switch, Text } from "@chakra-ui/react";
import { useWebPush } from "../../hooks/useWebPush";

export function PushToggle() {
  const {
    isSupported,
    isSubscribed,
    isPending,
    permissionDenied,
    subscribe,
    unsubscribe,
  } = useWebPush();

  if (!isSupported) return null;

  return (
    <Stack gap={1}>
      <Switch.Root
        checked={isSubscribed}
        onCheckedChange={(e) => {
          if (e.checked) subscribe();
          else unsubscribe();
        }}
        disabled={isPending || permissionDenied}
      >
        <Switch.HiddenInput />
        <Switch.Control />
        <Switch.Label>Push notifications</Switch.Label>
      </Switch.Root>
      {permissionDenied ? (
        <Text fontSize="xs" color="red.500">
          Blocked in browser settings. Update your site permissions to enable.
        </Text>
      ) : (
        <Text fontSize="xs" color="muted.400">
          Receive alerts even when the tab is closed.
        </Text>
      )}
    </Stack>
  );
}
