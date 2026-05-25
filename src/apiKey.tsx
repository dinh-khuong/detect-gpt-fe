import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { ColorModeProvider } from "./components/ui/color-mode";
import Navbar from "./Navbar.tsx";
import ApiKeyPage from "./pages/ApiKey.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ChakraProvider value={defaultSystem}>
      <ColorModeProvider forcedTheme="dark">
        <Navbar />
        <ApiKeyPage />
      </ColorModeProvider>
    </ChakraProvider>
  </StrictMode>,
);
