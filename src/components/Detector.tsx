import {
  Alert,
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  NativeSelect,
  Progress,
  ProgressCircle,
  ProgressCircleRoot,
  ProgressCircleValueText,
  Separator,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react"
import { isAxiosError } from "axios"
import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react"
import { IoCloudUploadOutline, IoDocumentTextOutline, IoTrashOutline } from "react-icons/io5"
import userApi, {
  type ChunkResult,
  type DetectMethod,
  type DetectMethodId,
  type DetectResult,
  type DocumentSource,
} from "../api/userApi"

const DEFAULT_METHOD: DetectMethodId = "prob_mean"

// Dùng khi chưa lấy được danh sách từ BE
const FALLBACK_METHODS: DetectMethod[] = [
  {
    id: "prob_mean",
    label: "Prob-Mean (Qwen2.5-1.5B-Instruct)",
    description: "Mean token probability under Qwen2.5-1.5B-Instruct; supports long documents.",
    long_text: true,
    default: true,
    loaded: false,
  },
  {
    id: "fastgpt",
    label: "Fast-DetectGPT (RoBERTa)",
    description: "Legacy method: Fast-DetectGPT on roberta-large-mnli + classifier.",
    long_text: false,
    default: false,
    loaded: false,
  },
]
const FALLBACK_EXTENSIONS = [".txt", ".md", ".pdf", ".docx", ".doc", ".odt", ".rtf", ".html", ".pptx", ".xlsx", ".epub", ".csv", ".json"]

const getVerdict = (score: number) => {
  if (score <= 20) return { label: "Highly Human", color: "green", bg: "green.subtle" };
  if (score <= 45) return { label: "Likely Human", color: "teal", bg: "teal.subtle" };
  if (score <= 65) return { label: "Mixed / Unsure", color: "yellow", bg: "yellow.subtle" };
  if (score <= 85) return { label: "Likely AI", color: "orange", bg: "orange.subtle" };
  return { label: "Highly AI Generated", color: "red", bg: "red.subtle" };
};

const chunkColor = (score: number) => {
  if (score >= 85) return "red.subtle"
  if (score >= 65) return "orange.subtle"
  if (score >= 45) return "yellow.subtle"
  return "transparent"
}

const errorMessage = (error: unknown) => {
  if (isAxiosError(error)) {
    const data = error.response?.data as { error?: string } | undefined
    if (data?.error) return data.error
    return error.message
  }
  return "Unexpected error"
}

export default function DetectionDashboard() {
  const [text, setText] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [method, setMethod] = useState<DetectMethodId>(DEFAULT_METHOD)
  const [methods, setMethods] = useState<DetectMethod[]>(FALLBACK_METHODS)
  const [extensions, setExtensions] = useState<string[]>(FALLBACK_EXTENSIONS)
  const [maxUploadMb, setMaxUploadMb] = useState(20)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isReading, setIsReading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<DetectResult | null>(null)
  const [source, setSource] = useState<DocumentSource | null>(null)
  // văn bản đã được phân tích (để tô màu theo đoạn)
  const [analyzedText, setAnalyzedText] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    userApi.getDetectMethods()
      .then((res) => {
        setMethods(res.data.methods)
        setMethod(res.data.default)
        setExtensions(res.data.supported_files)
        setMaxUploadMb(res.data.max_upload_mb)
      })
      .catch(() => { /* giữ giá trị mặc định */ })
  }, [])

  const score = result?.score ?? 0
  const verdict = getVerdict(score)
  const currentMethod = methods.find((m) => m.id === method)

  // Đọc file ở BE rồi đưa nội dung vào ô nhập để người dùng xem/sửa
  const handleFile = async (f: File | undefined) => {
    if (!f) return
    setError(null)
    if (f.size > maxUploadMb * 1024 * 1024) {
      setError(`File is too large (max ${maxUploadMb}MB).`)
      return
    }
    setIsReading(true)
    try {
      const res = await userApi.extractText(f)
      setFile(f)
      setSource(res.data.source)
      setText(res.data.text)
      setResult(null)
    } catch (e) {
      setError(errorMessage(e))
    }
    setIsReading(false)
  }

  const onFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0])
    e.target.value = ""
  }

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError("Please enter some text or upload a document.")
      return
    }
    setIsAnalyzing(true)
    setError(null)
    try {
      const res = await userApi.detectAI(text, method)
      setResult(res.data)
      setAnalyzedText(text)
    } catch (e) {
      console.log(e)
      setError(errorMessage(e))
    }
    setIsAnalyzing(false)
  }

  const handleClear = () => {
    setText("")
    setFile(null)
    setSource(null)
    setResult(null)
    setAnalyzedText("")
    setError(null)
  }

  const wordCount = text.split(/\s+/).filter(Boolean).length

  return (
    <Box bg="bg.canvas" minH="100dvh" py="10">
      <Container maxW="keyword.xl">
        <VStack gap="8" align="stretch">

          {/* Header Area */}
          <HStack justify="space-between" wrap="wrap" gap="4">
            <VStack align="start" gap="0">
              <Heading size="2xl" fontWeight="bold">AI Content Detector</Heading>
              <Text color="fg.muted">Verify the authenticity of your text or documents in seconds.</Text>
            </VStack>
            <Box minW="280px">
              <Text fontSize="xs" fontWeight="bold" color="fg.muted" mb="1">Detection method</Text>
              <NativeSelect.Root size="sm">
                <NativeSelect.Field
                  value={method}
                  onChange={(e) => {
                    setMethod(e.currentTarget.value as DetectMethodId)
                    setResult(null)
                  }}
                >
                  {methods.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}{m.default ? " (default)" : ""}
                    </option>
                  ))}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
              {currentMethod && (
                <Text fontSize="xs" color="fg.subtle" mt="1" maxW="320px">{currentMethod.description}</Text>
              )}
            </Box>
          </HStack>

          <SimpleGrid columns={{ base: 1, lg: 3 }} gap="8">

            {/* LEFT: Input Section (Takes up 2 columns) */}
            <Box gridColumn={{ base: "auto", lg: "span 2" }}>
              <Stack gap="4">
                <Box
                  bg="bg.panel" p="6" borderRadius="xl" shadow="sm" border="1px solid"
                  borderColor={isDragging ? "orange.400" : "border"}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={onDrop}
                >
                  {/* File upload */}
                  <HStack justify="space-between" mb="4" wrap="wrap" gap="3">
                    <HStack gap="3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        hidden
                        accept={extensions.join(",")}
                        onChange={onFileInput}
                      />
                      <Button size="sm" variant="outline" loading={isReading} onClick={() => fileInputRef.current?.click()}>
                        <IoCloudUploadOutline /> Upload document
                      </Button>
                      {file && source && (
                        <Badge colorPalette="blue" size="md">
                          <IoDocumentTextOutline />
                          {source.filename}
                          {source.n_pages ? ` · ${source.n_pages} pages` : ""}
                          {source.n_slides ? ` · ${source.n_slides} slides` : ""}
                        </Badge>
                      )}
                    </HStack>
                    <Text fontSize="xs" color="fg.subtle">
                      {extensions.join(" ")} · max {maxUploadMb}MB · or drag &amp; drop
                    </Text>
                  </HStack>

                  <Textarea
                    placeholder="Paste your content here or upload a document (minimum 50 words for best accuracy)..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    minH="450px"
                    fontSize="lg"
                    resize="vertical"
                  />
                  <HStack justify="flex-end" mt="4" color="fg.subtle" fontSize="sm">
                    <Text>{text.length.toLocaleString()} characters</Text>
                    <Separator orientation="vertical" h="4" />
                    <Text>{wordCount.toLocaleString()} words</Text>
                  </HStack>

                  {currentMethod && !currentMethod.long_text && wordCount > 400 && (
                    <Text fontSize="sm" color="orange.fg" mt="2">
                      This method is not designed for long text. Switch to Prob-Mean for long documents.
                    </Text>
                  )}

                  <HStack gap="3" justifyContent="center" mt="2">
                    <Button colorPalette="orange" loading={isAnalyzing} loadingText="Analyzing..." onClick={handleAnalyze}>
                      Analyze Text
                    </Button>
                    <Button variant="ghost" onClick={handleClear}>
                      <IoTrashOutline /> Clear
                    </Button>
                  </HStack>
                </Box>

                {error && (
                  <Alert.Root status="error">
                    <Alert.Indicator />
                    <Alert.Title>{error}</Alert.Title>
                  </Alert.Root>
                )}

                {result?.method === "prob_mean" && result.chunks.length > 0 && (
                  <SegmentView text={analyzedText} chunks={result.chunks} />
                )}
              </Stack>
            </Box>

            {/* RIGHT: Results Section (Takes up 1 column) */}
            <Stack gap="6">

              {/* Score Card */}
              <Box bg={result ? verdict.bg : "bg.panel"} p="8" borderRadius="2xl" textAlign="center" border="1px solid" borderColor="border">
                <VStack gap="6">
                  <Heading size="md">Final Verdict</Heading>

                  <ProgressCircleRoot colorPalette={verdict.color}>
                    <ProgressCircleValueText fontSize="3xl" fontWeight="black">
                      {score.toFixed(2)}%
                    </ProgressCircleValueText>
                    <ProgressCircle.Circle width="15px" />
                  </ProgressCircleRoot>

                  <Text fontWeight="semibold" fontSize="lg">
                    {result ? verdict.label : "No analysis yet"}
                  </Text>
                  {result && (
                    <Text fontSize="xs" color="fg.muted">
                      Probability the text is AI-generated
                    </Text>
                  )}
                </VStack>
              </Box>

              {result?.method === "prob_mean" && result.warnings.length > 0 && (
                <Alert.Root status="warning">
                  <Alert.Indicator />
                  <Alert.Content>
                    {result.warnings.map((w) => <Alert.Description key={w}>{w}</Alert.Description>)}
                  </Alert.Content>
                </Alert.Root>
              )}

              {/* Detailed Metrics */}
              <Box bg="bg.panel" p="6" borderRadius="xl" border="1px solid" borderColor="border">
                <Heading size="xs" mb="6" textTransform="uppercase" letterSpacing="widest" color="fg.muted">
                  Detailed Breakdown
                </Heading>
                {!result && <Text fontSize="sm" color="fg.subtle">Run an analysis to see details.</Text>}

                {result?.method === "prob_mean" && (
                  <VStack gap="4" align="stretch">
                    <Metric label="Mean token probability (prob_mean)">
                      {result.prob_mean.toFixed(4)}
                    </Metric>
                    <Metric label="AI threshold">{result.threshold.toFixed(3)}</Metric>
                    <Metric label="Tokens analyzed">{result.n_tokens.toLocaleString()}</Metric>
                    <Metric label="Segments">{result.n_chunks}</Metric>
                    <Box>
                      <Metric label="Text flagged as AI">{(result.ai_fraction * 100).toFixed(1)}%</Metric>
                      <Progress.Root value={result.ai_fraction * 100} size="sm" colorPalette="red" mt="1">
                        <Progress.Track>
                          <Progress.Range />
                        </Progress.Track>
                      </Progress.Root>
                    </Box>
                    <Text fontSize="xs" color="fg.subtle">Model: {result.model}</Text>
                  </VStack>
                )}

                {result?.method === "fastgpt" && (
                  <VStack gap="6" align="stretch">
                    <Metric label="Polarity">{result.polarity.toFixed(2)}</Metric>
                    <Metric label="Subjectivity">{result.subjectivity.toFixed(2)}</Metric>
                    <Metric label="Sentence length standard deviation">{result.sentence_std.toFixed(2)}</Metric>
                  </VStack>
                )}
              </Box>

            </Stack>
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  )
}

const Metric = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <Flex justify="space-between" gap="2">
    <Text fontSize="xs" fontWeight="bold">{label}</Text>
    <Text fontSize="xs" fontFamily="mono">{children}</Text>
  </Flex>
)

// Hiển thị văn bản theo từng đoạn, tô màu đoạn có khả năng là AI
const SegmentView = ({ text, chunks }: { text: string, chunks: ChunkResult[] }) => {
  // BE tính offset trên văn bản đã strip() -> bù phần khoảng trắng đầu
  const offset = text.length - text.trimStart().length
  const body = text.trim()

  return (
    <Box bg="bg.panel" p="6" borderRadius="xl" border="1px solid" borderColor="border">
      <HStack justify="space-between" mb="4" wrap="wrap" gap="2">
        <Heading size="sm">Segment analysis</Heading>
        <HStack gap="2" fontSize="xs">
          <Badge colorPalette="red">≥ 85% AI</Badge>
          <Badge colorPalette="orange">65–85%</Badge>
          <Badge colorPalette="yellow">45–65%</Badge>
          <Badge>Human</Badge>
        </HStack>
      </HStack>
      <Box maxH="500px" overflowY="auto" whiteSpace="pre-wrap" lineHeight="tall" fontSize="sm" textAlign="left">
        {chunks.map((c, i) => {
          const start = i === 0 ? 0 : c.start
          const end = i === chunks.length - 1 ? body.length : chunks[i + 1].start
          return (
            <Box
              as="span"
              key={c.index}
              bg={chunkColor(c.score)}
              borderRadius="sm"
              title={`Segment ${c.index + 1}: ${c.score.toFixed(1)}% AI · prob_mean ${c.prob_mean.toFixed(4)} · ${c.n_tokens} tokens`}
            >
              {text.slice(offset + start, offset + end)}
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
