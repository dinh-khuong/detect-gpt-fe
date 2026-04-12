import { useState } from "react";
import {
  Box,
  Button,
  Center,
  Input,
  Stack,
  Text,
  Field,
  Flex,
  Link,
} from "@chakra-ui/react";
import axios from "axios";
import authApi from "../api/authApi";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(""); // Clear any previous errors

    try {
      // Replace this URL with your actual Python backend endpoint
      await authApi.login({
        username,
        password,
      });
      // console.log(response.data)
      // console.log("Login successful!", response.data);
      
      // Navigate to the dashboard after a successful login
      window.location.href = "/";

    } catch (error) {
      // Handle the Axios error safely
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // The server responded with a bad status code (e.g., 400, 401)
          setErrorMsg(error.response.data.message || "Invalid email or password.");
        } else if (error.request) {
          // The request was made but no response was received (e.g., server offline)
          setErrorMsg("Network error. Please check your connection.");
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
          {/* Header */}
          <Stack gap={2} textAlign="center">
            <Text fontSize="2xl" fontWeight="bold" letterSpacing="tight">
              Welcome back
            </Text>
            <Text color="gray.500" fontSize="sm">
              Please enter your details to sign in.
            </Text>
          </Stack>

          {/* Error Message Display */}
          {errorMsg && (
            <Box p={3} bg="red.50" _dark={{ bg: "red.900/30" }} borderRadius="md" borderWidth="1px" borderColor="red.200" _dark={{ borderColor: "red.800" }}>
              <Text color="red.600" _dark={{ color: "red.400" }} fontSize="sm" textAlign="center">
                {errorMsg}
              </Text>
            </Box>
          )}

          {/* Form */}
          <form onSubmit={handleLogin}>
            <Stack gap={5}>
              <Field.Root required>
                <Field.Label>User Name</Field.Label>
                <Input
                  type="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="name@company.com"
                  variant="outline"
                />
              </Field.Root>

              <Field.Root required>
                <Field.Label>Password</Field.Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  variant="outline"
                />
              </Field.Root>

              <Flex justify="space-between" align="center">
                <Link href="#" color="blue.600" _dark={{ color: "blue.400" }} fontSize="sm" fontWeight="medium">
                  Forgot password?
                </Link>
              </Flex>

              <Button
                type="submit"
                colorPalette="blue"
                size="lg"
                width="full"
                loading={isLoading}
                loadingText="Signing in..."
              >
                Sign in
              </Button>
            </Stack>
          </form>
        </Stack>
      </Box>
    </Center>
  );
}
