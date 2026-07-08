import { Box, Button, Text } from "@mantine/core";
import { IconPointerSearch } from "@tabler/icons-react";
import classes from "./DemoSearch.module.css";

const DEMO_QUERIES = [
  "cardinality of should request",
  "geo condition filter",
  "flush WAL",
];

type DemoSearchProps = {
  handleDemoSearch: (query: string) => void;
};

export default function DemoSearch({ handleDemoSearch }: DemoSearchProps) {
  return (
    <Box className={classes.wrapper}>
      <Text className={classes.demoText}>Try an example:</Text>
      {DEMO_QUERIES.map((query) => (
        <Button
          key={query}
          variant="outline"
          leftSection={<IconPointerSearch size="1.1rem" />}
          className={classes.demoBtn}
          onClick={() => handleDemoSearch(query)}
        >
          {query}
        </Button>
      ))}
    </Box>
  );
}
