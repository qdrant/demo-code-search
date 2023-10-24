import { Box, Button, Image, ThemeIcon, Tooltip } from "@mantine/core";
import classes from "./CodeContainer.module.css";
import { Highlight, themes } from "prism-react-renderer";
import {
  IconExternalLink,
  IconFoldDown,
  IconFoldUp,
} from "@tabler/icons-react";
import useMountedState from "@/hooks/useMountedState";

type CodeContainerProps = {
  code_type: string;
  context: {
    file_name: string;
    file_path: string;
    module: string;
    snippet: string;
    struct_name: string;
    upper_lines: string;
    lower_lines: string;
  };
  docstring: string | null;
  line: number;
  line_from: number;
  line_to: number;
  name: string;
  signature: string;
  sub_matches?: {
    overlap_from: number;
    overlap_to: number;
  }[];
};

export function CodeContainer(props: CodeContainerProps) {
  const { context, line_from, sub_matches, line_to } = props;
  const [codeLineFrom, setCodeLineFrom] = useMountedState(line_from);
  const [codeLineTo, setCodeLineTo] = useMountedState(line_to);
  const [code, setCode] = useMountedState(props.context.snippet);

  const loadUpperCode = () => {
    setCodeLineFrom(1);
    setCode(`${context.upper_lines}${code}`);
  };

  const loadLowerCode = () => {
    setCodeLineTo(Infinity);
    setCode(`${code}${context.lower_lines}`);
  };

  return (
    <Box
      className={classes.wrapper}
      id={`${context.file_path}`}
      style={{
        scrollMarginTop: "193px",
      }}
    >
      <Box className={classes.header}>
        <Image src={"/logoFavicon.svg"} alt={"logo"} height={25} />
        <Button
          component="a"
          variant="transparent"
          href={`https://github.com/qdrant/qdrant/blob/master/${context.file_path}#L${props.line_from}-L${props.line_to}`}
          target="_blank"
          rightSection={
            <ThemeIcon
              variant="transparent"
              size={30}
              style={{
                cursor: "pointer",
              }}
            >
              <IconExternalLink style={{ width: 18, height: 18 }} />
            </ThemeIcon>
          }
          className={classes.filename}
        >
          {context.file_path}
        </Button>
      </Box>

      <Highlight
        theme={themes.github}
        code={code}
        language="rust"
        key={`${code} ${props.line_from} ${props.line_to}`}
      >
        {({ tokens, style, getTokenProps }) => (
          <pre style={style} className={classes.code}>
            <div
              style={
                codeLineFrom === 1
                  ? { display: "none" }
                  : {
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "flex-start",
                      width: "100%",
                      backgroundColor: "#DCF4FF",
                    }
              }
            >
              <Tooltip label={`Expand all`} withArrow>
                <span className={classes.codeLoad} onClick={loadUpperCode}>
                  <IconFoldUp />
                </span>
              </Tooltip>
              <div className={classes.codeLine}>
                <span className={classes.codeNumber}>
                  @@ {1} - {line_from} of {context.file_name}
                </span>
              </div>
            </div>
            {tokens.map((line, i) => (
              <div
                key={i}
                style={
                  sub_matches?.some(
                    (sub_match) =>
                      sub_match.overlap_from <= codeLineFrom + i &&
                      sub_match.overlap_to >= codeLineFrom + i
                  )
                    ? {
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "flex-start",
                        width: "100%",
                        backgroundColor: "#FEFBDC",
                      }
                    : {
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "flex-start",
                        width: "100%",
                      }
                }
              >
                <span className={classes.codeNumber}>{codeLineFrom + i}</span>
                <div key={i} className={classes.codeLine}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              </div>
            ))}
            <div
              style={
                codeLineTo === Infinity
                  ? { display: "none" }
                  : {
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "flex-start",
                      width: "100%",
                      backgroundColor: "#DCF4FF",
                      borderBottomLeftRadius: ".5rem",
                      borderBottomRightRadius: ".5rem",
                    }
              }
            >
              <Tooltip label={`Expand all`} withArrow>
                <span
                  className={classes.codeLoad}
                  style={{
                    borderBottomLeftRadius: ".5rem",
                  }}
                  onClick={loadLowerCode}
                >
                  <IconFoldDown />
                </span>
              </Tooltip>
              <div className={classes.codeLine}>
                <span className={classes.codeNumber}>
                  @@ {line_to} - {"end of file"} of {context.file_name}
                </span>
              </div>
            </div>
          </pre>
        )}
      </Highlight>
    </Box>
  );
}
