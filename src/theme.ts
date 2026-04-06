import { extendTheme, type ThemeConfig } from "@chakra-ui/react"

const config: ThemeConfig = {
  initialColorMode: "dark", // or "light"
  useSystemColorMode: false,  // Automatically switches based on OS settings
}

const theme = extendTheme({ config })

export default theme
