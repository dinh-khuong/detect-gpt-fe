import { useState } from "react";
import {
  Box,
  Button,
  Center,
  Input,
  Stack,
  Text,
  Field,
  Link,
  Flex,
} from "@chakra-ui/react";
import authApi from "../api/authApi";
import axios from "axios";

export default function SignInPage() {
  // Track which step the user is on (1 for Email, 2 for Username/Password)
  const [step, setStep] = useState(1);

  // Form state
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Move to Step 2
  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setStep(2);
    }
  };

  // Final Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authApi.register({ email, username, password })
      window.location.href = "/";
    } catch(error) {
      if (axios.isAxiosError(error)) {
        
        const errD = error?.response?.data || {}
        //@ts-expect-error-ignore
        const errors = Object.values(errD).map((value) => "Error: " + value[0]) ;
        alert(errors.join('\n'))
      } else {
        alert("Unknown error")
      }
    }
    setIsLoading(false);
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
          {/* STEP 1: EMAIL */}
          {step === 1 && (
            <>
              <Stack gap={2} textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" letterSpacing="tight">
                  Sign in
                </Text>
                <Text color="gray.500" fontSize="sm">
                  Enter your email to get started.
                </Text>
              </Stack>

              <form onSubmit={handleContinue}>
                <Stack gap={5}>
                  <Field.Root required>
                    <Field.Label>Email</Field.Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      variant="outline"
                      autoFocus
                    />
                  </Field.Root>

                  <Button type="submit" colorPalette="blue" size="lg" width="full">
                    Continue
                  </Button>
                </Stack>
              </form>
            </>
          )}

          {/* STEP 2: USERNAME & PASSWORD */}
          {step === 2 && (
            <>
              <Stack gap={2}>
                <Text fontSize="2xl" fontWeight="bold" letterSpacing="tight">
                  Welcome back
                </Text>
                <Flex justify="space-between" align="center" bg="gray.100" _dark={{ bg: "gray.800" }} p={2} borderRadius="md">
                  <Text color="gray.600" _dark={{ color: "gray.400" }} fontSize="sm" isTruncated>
                    {email}
                  </Text>
                  <Button variant="ghost" size="xs" onClick={() => setStep(1)}>
                    Edit
                  </Button>
                </Flex>
              </Stack>

              <form onSubmit={handleSubmit}>
                <Stack gap={5}>
                  <Field.Root required>
                    <Field.Label>Username</Field.Label>
                    <Input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      variant="outline"
                      autoFocus
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

                  <Flex justify="flex-end">
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
            </>
          )}
        </Stack>
      </Box>
    </Center>
  );
}
