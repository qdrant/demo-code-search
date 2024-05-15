import {
  Container,
  Group,
  Button,
  Modal,
  Title,
  Text,
  Image,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import classes from "./CustomHeader.module.css";
import { Logo } from "../Logo";
import { IconBrandGithub } from "@tabler/icons-react";

export function CustomHeader() {
  const [opened, handlers] = useDisclosure(false);

  return (
    <header className={classes.header}>
      <Container size="lg" className={classes.inner}>
        <Logo size={35} />
        <Group gap={5} wrap="nowrap">
          <Button
            color="Neutral.6"
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
            color="Neutral.6"
            variant="subtle"
            className={classes.link}
            onClick={handlers.open}
          >
            About
          </Button>
          <Button
            color="Neutral.6"
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
      <Modal opened={opened} onClose={handlers.close} centered size={"lg"}>
        <Modal.Header
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Title className={classes.modalHeader}>
            How does{" "}
            <Text component="span" className={classes.highlight} inherit>
              Code search
            </Text>{" "}
            work?
          </Title>
          <Text className={classes.subHeading}>
            This demo uses code of qdrant repo to perform a semantic search.
          </Text>
        </Modal.Header>
        <Modal.Body
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Text size="lg" color="dimmed" className={classes.description}>
            When you search a codebase, you might have the following objectives:
            To find code snippets similar to what you're using, or to identify a method
            that does <b>this specific thing</b>. Our code search demo supports
            both cases with multiple embedding models.
          </Text>

          <Image src="/workflow.svg" />
          <Text size="lg" color="dimmed" className={classes.description}>
            Using both embeddings helps us find not only the relevant method but also the
            exact piece of code inside it. Semantic code intelligence in action, in context!
          </Text>
          <Button
            className={classes.modalBtnInner}
            radius={30}
            size={"md"}
            variant="filled"
            color="Primary.2"
            onClick={handlers.close}
          >
            Get started
          </Button>
        </Modal.Body>
      </Modal>
    </header>
  );
}
