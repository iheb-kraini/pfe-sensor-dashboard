import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Text,
  TooltipArrow,
  TooltipContent,
  TooltipPositioner,
  TooltipRoot,
  TooltipTrigger,
} from "@chakra-ui/react";
import { useState } from "react";
import { LuCopy, LuPower, LuRefreshCw } from "react-icons/lu";
import type { Device } from "../../types/device.types";

interface Props {
  device: Device;
  isActivating: boolean;
  isDeactivating: boolean;
  isRefreshing: boolean;
  onToggleActive: () => void;
  onRefreshKey: () => void;
}

export function DeviceInfoCard({
  device,
  isActivating,
  isDeactivating,
  isRefreshing,
  onToggleActive,
  onRefreshKey,
}: Props) {
  const [copied, setCopied] = useState(false);
  console.log(device);

  const handleCopyKey = () => {
    if (!device.apiKey) return;
    navigator.clipboard.writeText(device.apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box
      bg="white"
      rounded="xl"
      shadow="sm"
      border="1px solid"
      borderColor="gray.100"
      p={5}
    >
      <Flex justify="space-between" align="flex-start" gap={4} wrap="wrap">
        <Box flex={1} minW="200px">
          <Text fontSize="lg" fontWeight="bold" color="muted.900" mb={2}>
            {device.name}
          </Text>
          <HStack gap={4} fontSize="sm" color="muted.500" mb={1}>
            <Badge
              colorPalette={device.isActive ? "green" : "red"}
              size="sm"
              variant="outline"
            >
              {device.isActive ? "Active" : "Inactive"}
            </Badge>
          </HStack>
          <Text fontSize="xs" color="muted.400" mb={3}>
            Created by {device.createdBy.firstName} {device.createdBy.lastName}{" "}
            — {new Date(device.createdAt).toLocaleDateString()}
          </Text>
          {device.apiKey && (
            <Flex align="center" gap={2}>
              <Text
                fontSize="xs"
                color="muted.400"
                fontFamily="mono"
                maxW="260px"
                truncate
              >
                API Key: {device.apiKey}
              </Text>
              <TooltipRoot>
                <TooltipTrigger>
                  <Button
                    size="xs"
                    variant="ghost"
                    colorPalette={copied ? "green" : "gray"}
                    onClick={handleCopyKey}
                  >
                    <LuCopy size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipPositioner>
                  <TooltipContent>
                    <TooltipArrow />
                    {copied ? "Copied!" : "Copy API Key"}
                  </TooltipContent>
                </TooltipPositioner>
              </TooltipRoot>
            </Flex>
          )}
        </Box>
        <HStack gap={2}>
          <TooltipRoot>
            <TooltipTrigger>
              <Button
                size="sm"
                variant="ghost"
                colorPalette={device.isActive ? "red" : "green"}
                loading={isActivating || isDeactivating}
                onClick={onToggleActive}
              >
                <LuPower size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipPositioner>
              <TooltipContent>
                <TooltipArrow />
                {device.isActive ? "Deactivate" : "Activate"}
              </TooltipContent>
            </TooltipPositioner>
          </TooltipRoot>
          <TooltipRoot>
            <TooltipTrigger>
              <Button
                size="sm"
                variant="ghost"
                colorPalette="purple"
                loading={isRefreshing}
                onClick={onRefreshKey}
              >
                <LuRefreshCw size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipPositioner>
              <TooltipContent>
                <TooltipArrow />
                Refresh API Key
              </TooltipContent>
            </TooltipPositioner>
          </TooltipRoot>
        </HStack>
      </Flex>
    </Box>
  );
}
