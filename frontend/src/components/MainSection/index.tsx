import {
  Button,
  Container,
  TextInput,
  Grid,
  ScrollArea,
  Box,
  Image,
  Title,
  Text,
  Loader,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import useMountedState from "@/hooks/useMountedState";
import { useGetSearchResult } from "@/hooks/useGetSearchResult";
import { getHotkeyHandler } from "@mantine/hooks";
import { FileTree } from "../FIleTree";
import { CodeContainer } from "../CodeContainer";
import classes from "./Main.module.css";

export function Main() {
  const [query, setQuery] = useMountedState("");
  const { data, getSearch, loading, error, resetData } = useGetSearchResult();

  const handleSubmit = () => {
    resetData();
    if (query) {
      getSearch(query);
    }
  };

  return (
    <Container size="lg">
      <TextInput
        radius={10}
        size="md"
        leftSection={<IconSearch color="#102252" />}
        placeholder="Enter a query"
        rightSection={
          <Button
            radius={10}
            w={"100%"}
            size={"md"}
            variant="filled"
            color="Primary.2"
            onClick={handleSubmit}
          >
            Search
          </Button>
        }
        rightSectionWidth={"6rem"}
        value={query}
        pt={"1rem"}
        required
        onChange={(event) => setQuery(event.currentTarget.value)}
        onKeyDown={getHotkeyHandler([["Enter", handleSubmit]])}
        classNames={{ input: classes.input }}
      />
      {data && (
        <Grid>
          <Grid.Col span={3}>
            <FileTree data={data} />
          </Grid.Col>
          <Grid.Col span={9}>
            <ScrollArea className={classes.codeDisplayArea}>
              {data?.result.map((item) => (
                <CodeContainer
                  {...item}
                  key={`${item.context.snippet} ${item.line_from} ${item.line_to}`}
                />
              ))}
            </ScrollArea>
          </Grid.Col>
        </Grid>
      )}
      {!data && !loading && (
        <Box>
          <Image
            src="/landing.gif"
            alt="Qdrant Landing"
            h={400}
            fit="contain"
          />
          <Title order={3} className={classes.heading}>
            Qdrant <span className={classes.headingHighlight}>Code Search</span>{" "}
            Unleashing Semantic Power
          </Title>
          <Text className={classes.subHeading}>
            Qdrant Code Explorer: Empowering Semantic Searching in Qdrant
            Repository with Advanced Code Analysis
          </Text>
        </Box>
      )}
      {error && <Text>Something went wrong</Text>}
      {loading && (
        <Box className={classes.loader}>
          <Loader type="bars" />
        </Box>
      )}
      {error && (
        <Box>
          <Image src="/error.gif" alt="Error" h={400} fit="contain" />

          <Text className={classes.subHeading}>{error}</Text>
        </Box>
      )}
    </Container>
  );
}
