import { useState } from "react";
import { Alert, Button, Flex, Text } from "@chakra-ui/react";
import { useWebPush } from "../../hooks/useWebPush";
import { LuBell } from "react-icons/lu";

export function PushSetupPrompt() {
  const { isSupported, isSubscribed, isPending, isChecking, subscribe } =
    useWebPush();
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem("push_prompt_dismissed") === "true",
  );

  if (!isSupported || isSubscribed || dismissed || isChecking) return null;

  return (
    <Alert.Root status="info" borderRadius="none">
      <Flex
        align="center"
        justify="space-between"
        w="full"
        px={4}
        py={2}
        gap={4}
        wrap="wrap"
      >
        <Flex align="center" gap={3}>
          <LuBell size={18} />
          <Text fontSize="sm">
            Enable push notifications to receive alerts even when the tab is
            closed.
          </Text>
        </Flex>
        <Flex gap={2}>
          <Button
            size="sm"
            colorPalette="blue"
            onClick={subscribe}
            loading={isPending}
          >
            Enable
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              localStorage.setItem("push_prompt_dismissed", "true");
              setDismissed(true);
            }}
          >
            Not now
          </Button>
        </Flex>
      </Flex>
    </Alert.Root>
  );
}
