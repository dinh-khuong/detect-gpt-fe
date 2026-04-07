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
import { useState } from "react"
import { IoMenuOutline, IoCloseOutline } from "react-icons/io5"

type NavLink = {
  name: string,
  link: string,
}

const LINKS: NavLink[] = [
  {
    name: 'Features',
    link: './features'
  },
  {
    name: 'Solutions',
    link: './solutions',
  },
  {
    name: 'Pricing',
    link: './pricing'
  },
  {
    name: 'Resources',
    link: './resources'
  }
] 

export default function Navbar() {
  const [open, setOpen] = useState(false)

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
            <Button variant="ghost" display={{ base: 'none', md: 'inline-flex' }}>
              Sign In
            </Button>
            <Button
              bg="orange.400"
              color="white"
              _hover={{ bg: 'orange.500', shadow: 'md' }}
            >
              Get Started
            </Button>
            
            {/* Mobile Toggle */}
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
              {['Features', 'Solutions', 'Pricing', 'Resources'].map((link) => (
                <Link key={link} py="2" fontWeight="semibold" variant="plain">
                  {link}
                </Link>
              ))}
            </Stack>
          </Box>
        </Collapsible.Content>
      </Collapsible.Root>
    </Box>
  )
}
