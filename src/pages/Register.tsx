import { useState } from "react";
import {
  Box,
  Button,
  Center,
  Field,
  Input,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import axios from "axios";
import authApi from "../api/authApi";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      await authApi.register({ email, username, password });
      window.location.href = "/signin";
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data;
        if (data && typeof data === "object") {
          const messages = Object.values(data).flat().filter(Boolean).join("\n");
          setErrorMsg(messages || "Could not create your account.");
        } else {
          setErrorMsg("Could not create your account.");
        }
      } else {
        setErrorMsg("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Center minH="100vh" bg="gray.50" _dark={{ bg: "gray.950" }} p={4}>
      <Box
        w="full"
        maxW="sm"
        p={8}
        bg="white"
        _dark={{ bg: "gray.900" }}
        boxShadow="lg"
        borderRadius="2xl"
        borderWidth="1px"
        borderColor="gray.200"
        _osDark={{ borderColor: "gray.800" }}
      >
        <Stack gap={6}>
          <Stack gap={2} textAlign="center">
            <Text fontSize="2xl" fontWeight="bold" letterSpacing="tight">
              Create account
            </Text>
            <Text color="gray.500" fontSize="sm">
              Set up your account to start using GPT Detector.
            </Text>
          </Stack>

          {errorMsg && (
            <Box
              p={3}
              bg="red.50"
              _dark={{ bg: "red.900/30" }}
              borderRadius="md"
              borderWidth="1px"
              borderColor="red.200"
              _osDark={{ borderColor: "red.800" }}
            >
              <Text color="red.600" _dark={{ color: "red.400" }} fontSize="sm" whiteSpace="pre-line">
                {errorMsg}
              </Text>
            </Box>
          )}

          <form onSubmit={handleRegister}>
            <Stack gap={5}>
              <Field.Root required>
                <Field.Label>Email</Field.Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  variant="outline"
                  autoComplete="email"
                  autoFocus
                />
              </Field.Root>

              <Field.Root required>
                <Field.Label>Username</Field.Label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  variant="outline"
                  autoComplete="username"
                />
              </Field.Root>

              <Field.Root required>
                <Field.Label>Password</Field.Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  variant="outline"
                  autoComplete="new-password"
                />
              </Field.Root>

              <Button
                type="submit"
                colorPalette="blue"
                size="lg"
                width="full"
                loading={isLoading}
                loadingText="Creating account..."
              >
                Create account
              </Button>
            </Stack>
          </form>

          <Text color="gray.500" fontSize="sm" textAlign="center">
            Already have an account?{" "}
            <Link href="/signin" color="blue.600" _dark={{ color: "blue.400" }} fontWeight="medium">
              Sign in
            </Link>
          </Text>
        </Stack>
      </Box>
    </Center>
  );
}
