import { Box, Button, Text } from "@mantine/core";
import classes from "./DemoSearch.module.css";
import { IconPointerSearch } from "@tabler/icons-react";

type DemoSearchProps = {
    handleDemoSearch: (query: string) => void;
};

export default function DemoSearch({ handleDemoSearch }: DemoSearchProps) {


  return (
    <Box className={classes.wrapper}>
      <Text
      className={classes.demoText}
      >Try this:</Text>
      <Button
        variant="outline"
        leftSection={<IconPointerSearch size={"1.3rem"} />}
        className={classes.demoBtn}
        onClick={() => handleDemoSearch("cardinality of should request")}
      >
        cardinality of should request
      </Button>
      <Button
        variant="outline"
        leftSection={<IconPointerSearch  size={"1.3rem"}/>}
        className={classes.demoBtn}
        onClick={() => handleDemoSearch("geo condition filter")}
      >
        geo condition filter
      </Button>
      <Button
        variant="outline"
        leftSection={<IconPointerSearch  size={"1.3rem"}/>}
        className={classes.demoBtn}
        onClick={() => handleDemoSearch("flush WAL")}
      >
        flush WAL
      </Button>
    </Box>
  );
}
