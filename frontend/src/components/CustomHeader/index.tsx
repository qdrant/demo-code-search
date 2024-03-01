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
            href="https://github.com/qdrant/demo-code-search/blob/master/README.md"
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
            On the search interface, it's possible for users to initiate searches
            for code snippets by employing either natural language queries or
            more code-like examples. The system processes the input by transforming
            it into vector representations through the use of twp neural encoders.
            These vectors play a crucial role in semantically searching a database
            filled with code snippets, ensuring the retrieval of code that aligns
            closely with the intended meaning and/or functionality.
          </Text>

          <Image src="/workflow.svg" />
          <Text size="lg" color="dimmed" className={classes.description}>
            The outcome of this search presents users with code snippets that closely
            match their query, organized in order of their relevance to the entered
            text. This allows users to explore and evaluate the found code snippets
            to identify the one that meets their requirements best. By utilizing
            natural language processing and machine learning techniques, this code
            search method enhances the precision and efficiency in locating pertinent
            code. Moreover, it facilitates the exploration of unfamiliar codebases
            even without the necessity of prior knowledge in the programming language,
            overcoming the limitations of traditional keyword-based searches which
            falter without knowledge of specific variable or class names. Thus, semantic
            code search significantly improves the search experience.
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
