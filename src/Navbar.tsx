import { 
  Box, 
  Button, 
  Collapsible, 
  Container, 
  Flex, 
  HStack, 
  IconButton, 
  Link, 
  Stack, 
  Text,
  // Note: Button, IconButton, and Collapsible are usually 
  // imported from your local /components/ui folder in v3
} from "@chakra-ui/react"
import { useMemo, useState } from "react"
import { IoMenuOutline, IoCloseOutline } from "react-icons/io5"

type NavLink = {
  name: string,
  link: string,
}

const LINKS: NavLink[] = [
  // {
  //   name: 'Features',
  //   link: '/features'
  // },
  // {
  //   name: 'Solutions',
  //   link: '/solutions',
  // },
  // {
  //   name: 'Pricing',
  //   link: '/pricing'
  // },
  // {
  //   name: 'Resources',
  //   link: '/resources'
  // }
] 

function parseJwt(token: string) {
    if (!token.includes(".")) return null;
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

export default function Navbar() {
  const [open, setOpen] = useState(false)

  const user = useMemo(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return null;
    try {
      return parseJwt(token)
    } catch {
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
      return null
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    window.location.href = "/signin"
  }

  return (
    <Box 
      as="nav" 
      top={0}
      zIndex="sticky"
      backdropFilter="blur(10px)"
      bg="bg.panel/80" // v3 token for translucent background
      borderBottomWidth="1px"
    >
      <Container maxW="extra-large">
        <Flex h="72px" py="2" align="center" justify="space-between">
          
          {/* Logo Section */}
          <HStack gap="2" fontWeight="bold" fontSize="xl" cursor="pointer">
            <Link href="/">
              <Box w="32px" h="32px" bg="orange.400" borderRadius="md" />
              <Text>GPT Detector</Text>
            </Link>
          </HStack>

          {/* Desktop Navigation */}
          <HStack as="nav" gap="8" display={{ base: 'none', md: 'flex' }}>
            {LINKS.map((navItem) => (
              <Link
                key={navItem.name}
                href={navItem.link}
                variant="plain" // v3 Link variant
                fontWeight="medium"
                _hover={{
                  textDecoration: 'none',
                  color: 'orange.400',
                  transform: 'translateY(-1px)',
                }}
                transition="all 0.2s"
              >
                {navItem.name}
              </Link>
            ))}
          </HStack>

          {/* Action Buttons */}
          <HStack gap="4">
            {user ? (
              /* --- LOGGED IN STATE --- */
              <>
                {/* <Link href="/dashboard"> */}
                {/*   <Button variant="ghost" display={{ base: 'none', md: 'inline-flex' }}> */}
                {/*     Dashboard */}
                {/*   </Button> */}
                {/* </Link> */}
                {/* You can replace this with an Avatar or User Menu component */}
                <Link href="/api-key">
                  <Button variant="ghost" display={{ base: 'none', md: 'inline-flex' }}>
                    API Key
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  display={{ base: 'none', md: 'inline-flex' }}
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </>
            ) : (
                /* --- LOGGED OUT STATE (Your original code) --- */
                <>
                  <Link href="/signin">
                    <Button variant="ghost" display={{ base: 'none', md: 'inline-flex' }}>
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button
                      bg="orange.400"
                      color="white"
                      _hover={{ bg: 'orange.500', shadow: 'md' }}
                    >
                      Get Started
                    </Button>
                  </Link>
                </>
              )}

            {/* Mobile Toggle - Kept outside the condition so it shows up for both states */}
            <IconButton
              display={{ base: 'flex', md: 'none' }}
              onClick={() => setOpen(!open)}
              variant="ghost"
              aria-label="Toggle Navigation"
            >
              {open ? <IoCloseOutline /> : <IoMenuOutline />}
            </IconButton>
          </HStack>
        </Flex>
      </Container>

      {/* Mobile Menu using Collapsible Snippet */}
      <Collapsible.Root open={open}>
        <Collapsible.Content>
          <Box pb="4" display={{ md: 'none' }} px="4">
            <Stack as="nav" gap="4">
              {LINKS.map((link) => (
                <Link key={link.link} py="2" fontWeight="semibold" variant="plain">
                  {link.name}
                </Link>
              ))}
              {user ? (
                <>
                  <Link href="/api-key" py="2" fontWeight="semibold" variant="plain">
                    API Key
                  </Link>
                  <Button variant="outline" onClick={handleSignOut}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/signin" py="2" fontWeight="semibold" variant="plain">
                    Sign In
                  </Link>
                  <Link href="/register" py="2" fontWeight="semibold" variant="plain">
                    Get Started
                  </Link>
                </>
              )}
            </Stack>
          </Box>
        </Collapsible.Content>
      </Collapsible.Root>
    </Box>
  )
}
