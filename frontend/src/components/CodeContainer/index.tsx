import { Box, Button, Image, Loader, ThemeIcon, Tooltip } from "@mantine/core";
import classes from "./CodeContainer.module.css";
import { Highlight, themes } from "prism-react-renderer";
import {
  IconExternalLink,
  IconFoldDown,
  IconFoldUp,
} from "@tabler/icons-react";
import useMountedState from "@/hooks/useMountedState";
import { useGetFile } from "@/hooks/useGetFile";
import { useEffect } from "react";

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
  sub_matches?: {
    overlap_from: number;
    overlap_to: number;
  }[];
};
const loadCount = 10;

export function CodeContainer(props: CodeContainerProps) {
  const { context, line_from, sub_matches, line_to } = props;
  const [codeLineFrom, setCodeLineFrom] = useMountedState(line_from);
  const [codeLineTo, setCodeLineTo] = useMountedState(line_to);
  const [code, setCode] = useMountedState(props.context.snippet);
  const { data, error, loading, getFile } = useGetFile();
  const [inStack, setInStack] = useMountedState<
    "loadUpperCode" | "loadLowerCode" | null
  >(null);

  const loadUpperCode = () => {
    if (!data) {
      getFile(context.file_path);
      setInStack("loadUpperCode");
    }
    if (data) {
      const upperCodeArray = data.result[0].code;
      const upperCode = upperCodeArray
        .slice(
          codeLineFrom - loadCount - 1 > 0 ? codeLineFrom - loadCount - 1 : 0,
          codeLineFrom - 1 // Array start from 0.
        )
        .join("");
      setCodeLineFrom((number) => {
        return number - loadCount - 1 > 0 ? number - loadCount : 1;
      });
      setCode(`${upperCode}${code}`);
    }
  };

  const loadLowerCode = () => {
    if (!data) {
      getFile(context.file_path);
      setInStack("loadLowerCode");
    }
    if (data) {
      const lowerCodeArray = data.result[0].code;
      const lowerCode = lowerCodeArray
        .slice(codeLineTo, codeLineTo + loadCount)
        .join("");
      setCodeLineTo((number) => {
        return number + loadCount;
      });
      setCode(`${code}${lowerCode}`);
    }
  };

  useEffect(() => {
    if (inStack === "loadUpperCode" && data) {
      loadUpperCode();
      setInStack(null);
    }
    if (inStack === "loadLowerCode" && data) {
      loadLowerCode();
      setInStack(null);
    }
  }, [data]);

  return (
    <Box
      className={classes.wrapper}
      id={`${context.file_path}`}
      style={{
        scrollMarginTop: "130px",
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
              <Tooltip
                label={`Load ${
                  codeLineFrom - loadCount > 0 ? codeLineFrom - loadCount : 1
                } to ${codeLineFrom - 1} `}
                withArrow
              >
                <span className={classes.codeLoad} onClick={loadUpperCode}>
                  {loading && inStack === "loadUpperCode" ? (
                    <Loader type="oval" size="xs" />
                  ) : (
                    <IconFoldUp />
                  )}
                </span>
              </Tooltip>
              <div className={classes.codeLine}>
                <span className={classes.codeNumber}>
                  {error
                    ? error
                    : `@@ 1 - ${codeLineFrom - 1} of ${context.file_name}`}
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
                data?.result[0].endline && codeLineTo >= data?.result[0].endline
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
              <Tooltip
                label={`Load ${codeLineTo + 2} to ${
                  data?.result[0].endline &&
                  data?.result[0].endline < codeLineTo + loadCount + 2
                    ? data?.result[0].endline + 1
                    : codeLineTo + loadCount + 2
                } of file`}
                withArrow
              >
                <span
                  className={classes.codeLoad}
                  style={{
                    borderBottomLeftRadius: ".5rem",
                  }}
                  onClick={loadLowerCode}
                >
                  {loading && inStack === "loadLowerCode" ? (
                    <Loader type="oval" size="xs" />
                  ) : (
                    <IconFoldDown />
                  )}
                </span>
              </Tooltip>
              <div className={classes.codeLine}>
                <span className={classes.codeNumber}>
                  {error
                    ? error
                    : `@@ ${codeLineTo + 2} - ${
                        data?.result[0].endline
                          ? data?.result[0].endline + 1
                          : "end"
                      } of ${context.file_name}`}
                </span>
              </div>
            </div>
          </pre>
        )}
      </Highlight>
    </Box>
  );
}
