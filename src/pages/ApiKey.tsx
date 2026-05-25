import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Code,
  Container,
  Flex,
  Heading,
  HStack,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import axios from "axios";
import { IoCopyOutline, IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import userApi, { type ApiKeyResponse, type User } from "../api/userApi";

type ApiKeyPayload = ApiKeyResponse | User | ApiKeyResponse[] | string | null;

function pickApiKey(data: ApiKeyPayload): string {
  if (!data) return "";
  if (typeof data === "string") return data;
  if (Array.isArray(data)) return pickApiKey(data[0] ?? null);

  return (
    data.api_key ||
    data.apiKey ||
    data.current_api_key ||
    data.key ||
    data.token ||
    ("apiKeyValue" in data ? data.apiKeyValue : "") ||
    ("value" in data ? data.value : "") ||
    ("user" in data ? pickApiKey(data.user ?? null) : "") ||
    ("data" in data ? pickApiKey(data.data ?? null) : "") ||
    ("results" in data ? pickApiKey(data.results ?? null) : "") ||
    ""
  );
}

function maskApiKey(value: string) {
  if (!value) return "";
  if (value.length <= 12) return value.replace(/./g, "*");
  return `${value.slice(0, 6)}${"*".repeat(Math.max(value.length - 10, 0))}${value.slice(-4)}`;
}

export default function ApiKeyPage() {
  const [apiKeyData, setApiKeyData] = useState<ApiKeyPayload>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [copyLabel, setCopyLabel] = useState("Copy");
  const [errorMsg, setErrorMsg] = useState("");

  const apiKey = useMemo(() => pickApiKey(apiKeyData), [apiKeyData]);
  const displayedKey = isVisible ? apiKey : maskApiKey(apiKey);

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      window.location.href = "/signin";
      return;
    }

    const loadApiKey = async () => {
      setIsLoading(true);
      setErrorMsg("");
      try {
        const me = await userApi.getMe();
        setApiKeyData(pickApiKey(me.data) ? me.data : accessToken);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const detail = error.response?.data?.detail;
          const message = error.response?.data?.message;
          if (detail || message) {
            setErrorMsg(detail || message);
          } else {
            setApiKeyData(accessToken);
          }
        } else {
          setApiKeyData(accessToken);
        }
      } finally {
        setIsLoading(false);
      }
    };

    void loadApiKey();
  }, []);

  const handleCopy = async () => {
    if (!apiKey) return;

    try {
      await navigator.clipboard.writeText(apiKey);
      setCopyLabel("Copied");
      window.setTimeout(() => setCopyLabel("Copy"), 1800);
    } catch {
      setCopyLabel("Copy failed");
      window.setTimeout(() => setCopyLabel("Copy"), 1800);
    }
  };

  return (
    <Box bg="bg.canvas" minH="calc(100dvh - 72px)" py="10">
      <Container maxW="3xl">
        <Stack gap="6">
          <Stack gap="1">
            <HStack gap="3" align="center">
              <Heading size="2xl">API Key</Heading>
              <Badge colorPalette="orange" variant="subtle">Current</Badge>
            </HStack>
            <Text color="fg.muted">View and copy the key attached to your signed-in account.</Text>
          </Stack>

          <Box bg="bg.panel" borderWidth="1px" borderColor="border" borderRadius="lg" p={{ base: "4", md: "6" }}>
            {isLoading ? (
              <Flex minH="180px" align="center" justify="center" gap="3">
                <Spinner />
                <Text color="fg.muted">Loading API key</Text>
              </Flex>
            ) : errorMsg ? (
              <Stack gap="4">
                <Box
                  p="4"
                  bg="red.50"
                  _dark={{ bg: "red.900/30" }}
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor="red.200"
                  _osDark={{ borderColor: "red.800" }}
                >
                  <Text color="red.600" _dark={{ color: "red.400" }}>{errorMsg}</Text>
                </Box>
                <Button alignSelf="flex-start" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </Stack>
            ) : (
              <Stack gap="5">
                <Stack gap="2">
                  <Text fontWeight="medium">Current key</Text>
                  <Code
                    display="block"
                    w="full"
                    p="4"
                    borderRadius="md"
                    whiteSpace="normal"
                    wordBreak="break-all"
                    fontSize={{ base: "sm", md: "md" }}
                  >
                    {displayedKey || "No API key returned for this account."}
                  </Code>
                </Stack>

                <Flex gap="3" wrap="wrap">
                  <Button
                    variant="outline"
                    onClick={() => setIsVisible((value) => !value)}
                    disabled={!apiKey}
                  >
                    {isVisible ? <IoEyeOffOutline /> : <IoEyeOutline />}
                    {isVisible ? "Hide" : "Show"}
                  </Button>
                  <Button colorPalette="orange" onClick={handleCopy} disabled={!apiKey}>
                    <IoCopyOutline />
                    {copyLabel}
                  </Button>
                </Flex>
              </Stack>
            )}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
