import {
  Title,
  Text,
  Button,
  Container,
  TextInput,
  Loader,
  Box,
  Grid,
  Image,
  SegmentedControl,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useStyles } from "./style";
import useMountedState from "@/hooks/useMountedState";
import { useGetSearchResult } from "@/hooks/useGetSearchResult";
import { getHotkeyHandler } from "@mantine/hooks";

export function Main() {
  const { classes } = useStyles();
  const [query, setQuery] = useMountedState("");
  const { data, error, loading, getSearch, resetData } = useGetSearchResult();

  const handleSubmit = () => {
    if (query) {
      getSearch(query);
    }
  };

  // const onClickFindSimilar = (data: string) => {
  //   if (data) {
  //     resetData();
  //     setQuery(data);
  //     getSearch(data, isNeural);
  //   }
  // };

  return (
    <Container size="lg" className={classes.wrapper}>
      <TextInput
        radius={10}
        size="md"
        icon={<IconSearch color="#102252" />}
        placeholder="Enter a query"
        rightSection={
          <Button
            className={classes.inputRightSection}
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
        className={classes.inputArea}
        value={query}
        required
        onChange={(event) => setQuery(event.currentTarget.value)}
        onKeyDown={getHotkeyHandler([["Enter", handleSubmit]])}
      />

      <Grid>
        <Grid.Col span={12} md={4}>
          File Tree
        </Grid.Col>
        <Grid.Col span={12} md={8}></Grid.Col>
      </Grid>
    </Container>
  );
}
