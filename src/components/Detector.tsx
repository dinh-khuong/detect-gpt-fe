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
import userApi, { type DetechAI } from "../api/userApi";

const getVerdict = (score: number) => {
  if (score <= 20) return { label: "Highly Human", color: "green", bg: "green.subtle" };
  if (score <= 45) return { label: "Likely Human", color: "teal", bg: "teal.subtle" };
  if (score <= 65) return { label: "Mixed / Unsure", color: "yellow", bg: "yellow.subtle" };
  if (score <= 85) return { label: "Likely AI", color: "orange", bg: "orange.subtle" };
  return { label: "Highly AI Generated", color: "red", bg: "red.subtle" };
};

const INIT_SCORE: DetechAI = { fast_gpt: 0, subjectivity: 0, polarity: 0, sentence_std: 0 }

export default function DetectionDashboard() {
  const [text, setText] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [score, setScore] = useState<DetechAI>(INIT_SCORE)
  const verdict = getVerdict(score.fast_gpt)

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    // Simulate API call to your Python backend
    // setTimeout(() => {
    //   setScore(Math.floor(Math.random() * 100))
    //   setIsAnalyzing(false)
    // }, 30)

    try {
      const res = await userApi.detectAI(text);
      // const a = res.data["fast-gpt"]
      console.log(res)
      setScore(res.data)
    } catch (error) {
      console.log(error)
      alert("Have error")
    }
    setIsAnalyzing(false)
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
                  <Button variant="ghost" onClick={() => {
                    setText("")
                    setScore(INIT_SCORE)
                  }}>
                    <IoTrashOutline /> Clear
                  </Button>
                </HStack>
              </Box>
            </Box>

            {/* RIGHT: Results Section (Takes up 1 column) */}
            <Stack gap="6">

              {/* Score Card */}
              <Box bg={verdict.bg} p="8" borderRadius="2xl" textAlign="center" border="1px solid" borderColor="orange.200">
                <VStack gap="6">
                  <Heading size="md">Final Verdict</Heading>

                  <ProgressCircleRoot
                    // value={score.fast_gpt}
                    // size="200px" 
                    colorPalette={verdict.color}
                  >
                    <ProgressCircleValueText fontSize="3xl" fontWeight="black">
                      {score.fast_gpt.toFixed(2)}%
                    </ProgressCircleValueText>
                    <ProgressCircle.Circle width="15px" />
                  </ProgressCircleRoot>

                  <Text fontWeight="semibold" fontSize="lg">
                    {verdict.label}
                  </Text>
                </VStack>
              </Box>

              {/* Detailed Metrics */}
              <Box bg="bg.panel" p="6" borderRadius="xl" border="1px solid" borderColor="border">
                <Heading size="xs" mb="6" textTransform="uppercase" letterSpacing="widest" color="fg.muted">
                  Detailed Breakdown
                </Heading>
                <VStack gap="6" align="stretch">
                  <MetricBar label="Polarity" color="orange">
                    {score.polarity.toFixed(2)}
                  </MetricBar>
                  <MetricBar label="Subjectivity" color="blue">
                    {score.subjectivity.toFixed(2)}
                  </MetricBar>
                  <MetricBar label="Sentence length standard deviation" color="blue">
                    {score.sentence_std.toFixed(2)}
                  </MetricBar>
                  {/* <MetricBar label="Burstiness" value={100 - score} color="purple" /> */}
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
const MetricBar = ({ label, children, color }: { label: string, children: React.ReactNode, color: string }) => (
  <ProgressCircle.Root colorPalette={color} size="sm">
    <Flex justify="space-between" mb="1">
      <Text fontSize="xs" fontWeight="bold">{label}:&nbsp;</Text>
      <Text fontSize="xs">{children}</Text>
    </Flex>
    <ProgressCircle.Range borderRadius="full" />
  </ProgressCircle.Root>
)
