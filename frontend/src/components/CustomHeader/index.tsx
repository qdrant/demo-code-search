import { Box, Button, Container, Group, Image, Modal, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconBrandGithub } from "@tabler/icons-react";
import classes from "./CustomHeader.module.css";

export function CustomHeader() {
  const [opened, handlers] = useDisclosure(false);

  return (
    <header className={classes.header}>
      <Container size="lg" className={classes.inner}>
        <a href="/" className={classes.logo}>
          <img src="/qdrant-logo.svg" alt="Qdrant" />
        </a>
        <Group gap={5} wrap="nowrap">
          <Button
            variant="subtle"
            className={classes.link}
            component="a"
            href="https://qdrant.tech/documentation/tutorials/code-search/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Docs
          </Button>
          <Button
            variant="subtle"
            className={classes.link}
            onClick={handlers.open}
          >
            About
          </Button>
          <Button
            variant="subtle"
            className={classes.link}
            component="a"
            href="https://github.com/qdrant/demo-code-search"
            target="_blank"
            rel="noopener noreferrer"
            leftSection={<IconBrandGithub size={20} />}
          >
            GitHub
          </Button>
        </Group>
      </Container>
      <Modal opened={opened} onClose={handlers.close} centered size="lg">
        <Box className={classes.modalContent}>
          <Title order={2} className={classes.modalHeader}>
            How Does{" "}
            <Text component="span" className={classes.highlight} inherit>
              Code Search
            </Text>{" "}
            Work?
          </Title>
          <Text className={classes.subHeading}>
            This demo runs semantic search over the Qdrant codebase.
          </Text>
          <Text className={classes.description}>
            When you search a codebase, you usually want one of two things:
            code that looks like a snippet you already have, or a method that
            does <b>one specific thing</b>. This demo covers both cases with
            two embedding models.
          </Text>
          <Box className={classes.workflow}>
            <Image src="/workflow.svg" alt="Diagram of the two-model search workflow" />
          </Box>
          <Text className={classes.description}>
            MiniLM reads the description, UniXcoder reads the code itself.
            Combining them finds the relevant method and, where both agree, the
            exact lines inside it.
          </Text>
          <Button size="md" className={classes.modalBtn} onClick={handlers.close}>
            Get Started
          </Button>
        </Box>
      </Modal>
    </header>
  );
}
