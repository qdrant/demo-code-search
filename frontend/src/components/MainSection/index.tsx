import { Button, Container, TextInput, Grid } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import useMountedState from "@/hooks/useMountedState";
import { useGetSearchResult } from "@/hooks/useGetSearchResult";
import { getHotkeyHandler } from "@mantine/hooks";
import { FileTree } from "../FIleTree";

export function Main() {
  const [query, setQuery] = useMountedState("");
  const { data, getSearch } = useGetSearchResult();

  const handleSubmit = () => {
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
      />

      <Grid>
        <Grid.Col span={12}>
          <FileTree data={data} />
        </Grid.Col>
        <Grid.Col span={12}></Grid.Col>
      </Grid>
    </Container>
  );
}
