import {
  createStyles,
  Header as MantineHeader,
  Group,
  Container,
  rem,
  Button,
  Modal,
  Text,
  Title,
  Image,
} from "@mantine/core";
import { IconBrandGithub } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { Logo } from "../Logo";

const useStyles = createStyles((theme) => ({
  inner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: rem(56),

    [theme.fn.smallerThan("sm")]: {
      justifyContent: "flex-start",
    },
  },

  links: {
    width: rem(260),
    [theme.fn.smallerThan("sm")]: {
      width: "auto",
      marginLeft: "auto",
    },
  },
  link: {
    transition: "transform .3s ease-in-out",
    "&:hover ": {
      transform: "scale(1.1)",
    },
  },
  description: {
    ":not(:first-child)": {
      paddingTop: "1rem",
    },
    paddingBottom: "1rem",
    textAlign: "center",
    color: theme.colors.Neutral[6],
    fontSize: theme.other.paragraph.sizes.P14.fontSize,
    lineHeight: theme.other.paragraph.sizes.P14.lineHeight,
    fontWeight: theme.other.paragraph.sizes.P14.fontWeight,
  },
  modalHeader: {
    color: theme.colors.Neutral[8],
    fontSize: "2rem",
    fontWeight: 700,
    lineHeight: "2.5rem",
    letterSpacing: "0em",
    textAlign: "center",
    width: "100%",
  },
  highlight: {
    color: theme.colors[theme.primaryColor][2],
  },
  subHeading: {
    fontSize: "1.125rem",
    fontWeight: 600,
    lineHeight: "1.6875rem",
    letterSpacing: "0em",
    textAlign: "center",
    width: "100%",
    paddingTop: "1rem",
    color: theme.colors.Neutral[8],
  },
  modalBtnInner: {
    width: "200px",
    marginTop: "2rem",
  },
}));

export function CustomHeader() {
  const { classes } = useStyles();
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <MantineHeader
      height={56}
      bg={"Neutral.0"}
      fixed
      sx={{
        zIndex: 100,
      }}
    >
      <Container className={classes.inner} size={"lg"}>
        <Logo size={35} />

        <Group spacing={10} className={classes.links} position="right" noWrap>
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
            onClick={open}
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
            leftIcon={<IconBrandGithub size={20} />}
          >
            GitHub
          </Button>
        </Group>
      </Container>
      <Modal opened={opened} onClose={close} centered size={"lg"}>
        <Modal.Header
          sx={{
            flexDirection: "column",
          }}
        >
          <Title className={classes.modalHeader}>
            How does{" "}
            <Text component="span" className={classes.highlight} inherit>
              Semantic search
            </Text>{" "}
            work?
          </Title>
          <Text className={classes.subHeading}>
            This demo uses code of qdrant repo to perform a semantic search.
          </Text>
        </Modal.Header>
        <Modal.Body
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Text size="lg" color="dimmed" className={classes.description}>
            The search page will allow users to search for code snippets using
            natural language. The text input will be converted into a vector
            representation using advanced machine learning techniques. This
            vector will then be used to semantically search a code snippet
            database, retrieving similar code based on its meaning and
            functionality.
          </Text>

          <Image src="/workflow.svg" />
          <Text size="lg" color="dimmed" className={classes.description}>
            The search results will display code snippets that are most relevant
            to the user's query, ranked by their similarity to the input text.
            Users can view and compare the retrieved code snippets to find the
            one that best suits their needs. This approach to code search aims
            to improve the efficiency and accuracy of finding relevant code by
            leveraging advanced natural language processing and machine learning
            algorithms.
          </Text>
          <Button
            className={classes.modalBtnInner}
            radius={30}
            size={"md"}
            variant="filled"
            color="Primary.2"
            onClick={close}
          >
            Get started
          </Button>
        </Modal.Body>
      </Modal>
    </MantineHeader>
  );
}
