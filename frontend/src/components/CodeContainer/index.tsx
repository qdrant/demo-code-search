import { Box, Image, Text, ThemeIcon } from "@mantine/core";
import classes from "./CodeContainer.module.css";
import "@mantine/code-highlight/styles.css";
import { IconExternalLink } from "@tabler/icons-react";

type CodeContainerProps = {
  code_type: string;
  context: {
    file_name: string;
    file_path: string;
    module: string;
    snippet: string;
    struct_name: string;
  };
  docstring: string | null;
  line: number;
  line_from: number;
  line_to: number;
  name: string;
  signature: string;
  sub_matches: {
    overlap_from: number;
    overlap_to: number;
  }[];
};

export function CodeContainer(props: CodeContainerProps) {
  const { context } = props;

  return (
    <Box className={classes.wrapper} id={`${context.file_path}`}>
      <Box className={classes.header}>
        <Image src={"/logoFavicon.svg"} alt={"logo"} height={25} />
        <Text className={classes.filename}>{context.file_path}</Text>
        <ThemeIcon
          variant="transparent"
          size={30}
          style={{ cursor: "pointer" }}
          onClick={() =>
            window.open(
              `https://github.com/qdrant/qdrant/blob/master/${context.file_path}#L${props.line_from}-L${props.line_to}`,
              "_blank"
            )
          }
        >
          <IconExternalLink style={{ width: 18, height: 18 }} />
        </ThemeIcon>
      </Box>
    </Box>
  );
}
