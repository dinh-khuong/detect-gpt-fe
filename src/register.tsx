import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
// This is the key: the ColorModeProvider snippet
import { ColorModeProvider } from './components/ui/color-mode' 
import Navbar from './Navbar.tsx';
import SignInPage from './pages/SignIn.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChakraProvider value={defaultSystem}>
      {/* Wrapping App in ColorModeProvider enables the theme logic.
         Set 'forcedTheme="dark"' if you want it to ALWAYS be dark.
      */}
      <ColorModeProvider forcedTheme="dark">
        <Navbar />
        <SignInPage />
      </ColorModeProvider>
    </ChakraProvider>
  </StrictMode>,
)
