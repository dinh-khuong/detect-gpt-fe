import {
  Box,
  Container,
  Flex,
  Heading,
  SimpleGrid,
  Stack,
  Text,
  VStack,
  HStack,
  Separator,
  Button,
  Textarea,
  ProgressCircleRoot,
  ProgressCircleValueText,
  ProgressCircle
} from "@chakra-ui/react"
import { useState } from "react"
import { IoTrashOutline } from "react-icons/io5"

// v3 Snippets

export default function DetectionDashboard() {
  const [text, setText] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [score, setScore] = useState(80)

  const handleAnalyze = () => {
    setIsAnalyzing(true)
    // Simulate API call to your Python backend
    setTimeout(() => {
      setScore(Math.floor(Math.random() * 100))
      setIsAnalyzing(false)
    }, 30)
  }

  return (
    <Box bg="bg.canvas" minH="100dvh" py="10">
      <Container maxW="keyword.xl">
        <VStack gap="8" align="stretch">

          {/* Header Area */}
          <HStack justify="space-between">
            <VStack align="start" gap="0">
              <Heading size="2xl" fontWeight="bold">AI Content Detector</Heading>
              <Text color="fg.muted">Verify the authenticity of your text in seconds.</Text>
            </VStack>
          </HStack>

          <SimpleGrid columns={{ base: 1, lg: 3 }} gap="8">

            {/* LEFT: Input Section (Takes up 2 columns) */}
            <Box gridArea="1 / 1 / 1 / 3">
              <Box bg="bg.panel" p="6" borderRadius="xl" shadow="sm" border="1px solid" borderColor="border">
                <Textarea
                  placeholder="Paste your content here (minimum 50 words for best accuracy)..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  minH="450px"
                  fontSize="lg"
                  resize="none"
                />
                <HStack justify="flex-end" mt="4" color="fg.subtle" fontSize="sm">
                  <Text>{text.length} characters</Text>
                  <Separator orientation="vertical" h="4" />
                  <Text>{text.split(/\s+/).filter(Boolean).length} words</Text>
                </HStack>

              <HStack gap="3" justifyContent="center">
                <Button colorPalette="orange" loading={isAnalyzing} onClick={handleAnalyze}>
                  Analyze Text
                </Button>
                <Button variant="ghost" onClick={() => setText("")}>
                  <IoTrashOutline /> Clear
                </Button>
              </HStack>
              </Box>
            </Box>

            {/* RIGHT: Results Section (Takes up 1 column) */}
            <Stack gap="6">

              {/* Score Card */}
              <Box bg={score > 60 ? "red.subtle" : "green.subtle"} p="8" borderRadius="2xl" textAlign="center" border="1px solid" borderColor="orange.200">
                <VStack gap="6">
                  <Heading size="md">Final Verdict</Heading>

                  <ProgressCircleRoot
                    value={score}
                    // size="200px" 
                    colorPalette={score > 60 ? "red" : "green"}
                  >
                    <ProgressCircleValueText fontSize="3xl" fontWeight="black">
                      {score}%
                    </ProgressCircleValueText>
                    <ProgressCircle.Circle width="15px" />
                  </ProgressCircleRoot>

                  <Text fontWeight="semibold" fontSize="lg">
                    {score > 60 ? "Likely AI Generated" : "Likely Human Written"}
                  </Text>
                </VStack>
              </Box>

              {/* Detailed Metrics */}
              <Box bg="bg.panel" p="6" borderRadius="xl" border="1px solid" borderColor="border">
                <Heading size="xs" mb="6" textTransform="uppercase" letterSpacing="widest" color="fg.muted">
                  Detailed Breakdown
                </Heading>
                <VStack gap="6" align="stretch">
                  <MetricBar label="Predictability" value={score + 5} color="orange" />
                  <MetricBar label="Probability" value={score - 2} color="blue" />
                  <MetricBar label="Burstiness" value={100 - score} color="purple" />
                </VStack>
              </Box>

            </Stack>
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  )
}

// Sub-component for individual metric bars
const MetricBar = ({ label, value, color }: { label: string, value: number, color: string }) => (
  <ProgressCircle.Root value={value} colorPalette={color} size="sm">
    <Flex justify="space-between" mb="1">
      <Text fontSize="xs" fontWeight="bold">{label}:&nbsp;</Text>
      <Text fontSize="xs">{value}%</Text>
    </Flex>
    <ProgressCircle.Range borderRadius="full" />
  </ProgressCircle.Root>
)
