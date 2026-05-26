import {
  Badge,
  Box,
  Button,
  CloseButton,
  Drawer,
  Flex,
  Grid,
  Heading,
  HStack,
  Portal,
  Separator,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import type {
  Notification,
  NotificationState,
} from "../../types/notification.types";

const SEVERITY_PALETTE: Record<string, string> = {
  low: "blue",
  medium: "yellow",
  high: "orange",
  critical: "red",
};

const STATE_PALETTE: Record<string, string> = {
  unread: "gray",
  in_investigation: "purple",
  resolved: "green",
  dismissed: "red",
};

const STATE_LABEL: Record<string, string> = {
  unread: "Unread",
  in_investigation: "In Investigation",
  resolved: "Resolved",
  dismissed: "Dismissed",
};

const NEXT_STATES: Record<NotificationState, NotificationState[]> = {
  unread: ["in_investigation", "dismissed"],
  in_investigation: ["resolved", "dismissed"],
  resolved: [],
  dismissed: [],
};

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Grid templateColumns="140px 1fr" gap={2} alignItems="start">
      <Text fontSize="sm" color="muted.500" fontWeight="medium">
        {label}
      </Text>
      <Box fontSize="sm" color="muted.900">
        {children}
      </Box>
    </Grid>
  );
}

interface Props {
  notification: Notification | null;
  onClose: () => void;
  onChangeState: (id: number, state: NotificationState) => Promise<void>;
}

export function NotificationDrawer({
  notification,
  onClose,
  onChangeState,
}: Props) {
  const navigate = useNavigate();
  const n = notification;
  const nextStates = n ? NEXT_STATES[n.state] : [];

  return (
    <Drawer.Root
      open={!!notification}
      onOpenChange={({ open }) => !open && onClose()}
      placement="end"
      size="md"
    >
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header borderBottomWidth="1px" borderColor="muted.100">
              <Flex justify="space-between" align="center" w="full">
                <HStack gap={3}>
                  <Heading size="md" color="muted.900">Alert Detail</Heading>
                  {n && (
                    <Badge
                      colorPalette={SEVERITY_PALETTE[n.severity]}
                      textTransform="capitalize"
                    >
                      {n.severity}
                    </Badge>
                  )}
                </HStack>
                <CloseButton onClick={onClose} />
              </Flex>
            </Drawer.Header>

            <Drawer.Body py={6}>
              {!n ? (
                <Flex justify="center" align="center" h="full">
                  <Spinner />
                </Flex>
              ) : (
                <Stack gap={6}>
                  <Box
                    bg={`${SEVERITY_PALETTE[n.severity]}.50`}
                    borderLeftWidth="4px"
                    borderLeftColor={`${SEVERITY_PALETTE[n.severity]}.400`}
                    px={4}
                    py={3}
                    rounded="md"
                  >
                    <Text fontSize="sm" fontWeight="medium" color="muted.900">
                      {n.message}
                    </Text>
                  </Box>

                  <Stack gap={3}>
                    <Text
                      fontSize="xs"
                      fontWeight="semibold"
                      color="muted.400"
                      textTransform="uppercase"
                      letterSpacing="wider"
                    >
                      Details
                    </Text>
                    <DetailRow label="State">
                      <Badge colorPalette={STATE_PALETTE[n.state]}>
                        {STATE_LABEL[n.state]}
                      </Badge>
                    </DetailRow>
                    <DetailRow label="Device">
                      {n.device?.name ?? `Device #${n.deviceId}`}
                    </DetailRow>
                    <DetailRow label="Created At">
                      {new Date(n.createdAt).toLocaleString()}
                    </DetailRow>
                    {n.resolvedAt && (
                      <DetailRow label="Resolved At">
                        {new Date(n.resolvedAt).toLocaleString()}
                      </DetailRow>
                    )}
                    {n.sensorWindowId && (
                      <DetailRow label="Sensor Window">
                        #{n.sensorWindowId}
                      </DetailRow>
                    )}
                  </Stack>

                  {n.sensorSnapshot &&
                    Object.keys(n.sensorSnapshot).length > 0 && (
                      <>
                        <Separator />
                        <Stack gap={3}>
                          <Text
                            fontSize="xs"
                            fontWeight="semibold"
                            color="muted.400"
                            textTransform="uppercase"
                            letterSpacing="wider"
                          >
                            Sensor Snapshot
                          </Text>
                          <Box
                            bg="muted.50"
                            rounded="md"
                            p={3}
                            fontSize="xs"
                            fontFamily="mono"
                            color="muted.700"
                            whiteSpace="pre-wrap"
                            wordBreak="break-all"
                          >
                            {JSON.stringify(n.sensorSnapshot, null, 2)}
                          </Box>
                        </Stack>
                      </>
                    )}

                  {nextStates.length > 0 && (
                    <>
                      <Separator />
                      <Stack gap={3}>
                        <Text
                          fontSize="xs"
                          fontWeight="semibold"
                          color="muted.400"
                          textTransform="uppercase"
                          letterSpacing="wider"
                        >
                          Change State
                        </Text>
                        <HStack gap={2} flexWrap="wrap">
                          {nextStates.map((next) => (
                            <Button
                              key={next}
                              size="sm"
                              variant="outline"
                              colorPalette={STATE_PALETTE[next]}
                              onClick={() =>
                                onChangeState(n.id, next).then(onClose)
                              }
                            >
                              → {STATE_LABEL[next]}
                            </Button>
                          ))}
                        </HStack>
                      </Stack>
                    </>
                  )}

                  {n.sensorWindowId && (
                    <>
                      <Separator />
                      <Button
                        variant="outline"
                        colorPalette="blue"
                        size="sm"
                        alignSelf="start"
                        onClick={() => {
                          onClose();
                          navigate(`/sensor-windows/${n.sensorWindowId}`);
                        }}
                      >
                        View Sensor Window →
                      </Button>
                    </>
                  )}
                </Stack>
              )}
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}
