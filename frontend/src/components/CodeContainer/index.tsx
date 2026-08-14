import { useEffect } from "react";
import { ActionIcon, Box, Button, Loader, Tooltip } from "@mantine/core";
import { Highlight, themes } from "prism-react-renderer";
import {
  IconBraces,
  IconCheck,
  IconCopy,
  IconExternalLink,
  IconFoldDown,
  IconFoldUp,
} from "@tabler/icons-react";
import useMountedState from "@/hooks/useMountedState";
import { useGetFile } from "@/hooks/useGetFile";
import classes from "./CodeContainer.module.css";

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
  /** Commit the index was built from; the link's line numbers only match there. */
  commit?: string;
};

const loadCount = 10;

export function CodeContainer(props: CodeContainerProps) {
  const { context, line_from, line_to, sub_matches, commit } = props;
  const [codeLineFrom, setCodeLineFrom] = useMountedState(line_from);
  const [codeLineTo, setCodeLineTo] = useMountedState(line_to);
  const [code, setCode] = useMountedState(context.snippet);
  const { data, error, loading, getFile } = useGetFile();
  const [inStack, setInStack] = useMountedState<
    "loadUpperCode" | "loadLowerCode" | null
  >(null);
  const [copied, setCopied] = useMountedState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const loadUpperCode = () => {
    if (!data) {
      getFile(context.file_path);
      setInStack("loadUpperCode");
      return;
    }
    // /api/file answers with an empty result for a path it has no record of,
    // so result[0] is not guaranteed even once data has loaded.
    const fileLines = data.result[0]?.code;
    if (!fileLines) return;
    const upperCode = fileLines
      .slice(Math.max(codeLineFrom - loadCount - 1, 0), codeLineFrom - 1)
      .join("");
    setCodeLineFrom((line) => (line - loadCount - 1 > 0 ? line - loadCount : 1));
    setCode(`${upperCode}${code}`);
  };

  const loadLowerCode = () => {
    if (!data) {
      getFile(context.file_path);
      setInStack("loadLowerCode");
      return;
    }
    const fileLines = data.result[0]?.code;
    if (!fileLines) return;
    const lowerCode = fileLines.slice(codeLineTo, codeLineTo + loadCount).join("");
    setCodeLineTo((line) => line + loadCount);
    setCode(`${code}${lowerCode}`);
  };

  useEffect(() => {
    if (!data || !inStack) return;
    if (inStack === "loadUpperCode") loadUpperCode();
    if (inStack === "loadLowerCode") loadLowerCode();
    setInStack(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const isMatchedLine = (index: number) =>
    sub_matches?.some(
      (subMatch) =>
        subMatch.overlap_from <= codeLineFrom + index &&
        subMatch.overlap_to >= codeLineFrom + index
    );

  const fileEndLine = data?.result?.[0]?.endline;

  return (
    <Box className={classes.wrapper} id={context.file_path}>
      <Box className={classes.header}>
        <span className={classes.fileIcon}>
          <IconBraces size={14} stroke={2} />
        </span>
        <Button
          component="a"
          variant="transparent"
          // Pinned to the indexed commit, not a branch: the line anchors were
          // computed at index time and stop matching as soon as the file
          // changes upstream. Falls back to master when the API doesn't say.
          href={`https://github.com/qdrant/qdrant/blob/${commit || "master"}/${context.file_path}#L${line_from}-L${line_to}`}
          target="_blank"
          rel="noopener noreferrer"
          rightSection={<IconExternalLink size={14} />}
          className={classes.filename}
        >
          {context.file_path}
        </Button>
        <Box className={classes.headerActions}>
          <span className={classes.lineRange}>
            L{line_from}–{line_to}
          </span>
          <span className={classes.langTag}>Rust</span>
          <Tooltip label={copied ? "Copied" : "Copy Snippet"} withArrow>
            <ActionIcon
              variant="subtle"
              size="md"
              aria-label="Copy snippet"
              className={classes.copyBtn}
              onClick={copyCode}
            >
              {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
            </ActionIcon>
          </Tooltip>
        </Box>
      </Box>

      <Highlight
        theme={themes.vsDark}
        code={code}
        language="rust"
        key={`${code} ${line_from} ${line_to}`}
      >
        {({ tokens, getTokenProps }) => (
          <pre className={classes.code}>
            {codeLineFrom > 1 && (
              <div className={classes.expandRow}>
                <Tooltip
                  label={`Load ${Math.max(codeLineFrom - loadCount, 1)} to ${
                    codeLineFrom - 1
                  }`}
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
                    {error ??
                      `@@ 1 - ${codeLineFrom - 1} of ${context.file_name}`}
                  </span>
                </div>
              </div>
            )}
            {tokens.map((line, i) => (
              <div
                key={i}
                className={classes.lineRow}
                data-matched={isMatchedLine(i) || undefined}
              >
                <span className={classes.codeNumber}>{codeLineFrom + i}</span>
                <div className={classes.codeLine}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              </div>
            ))}
            {!(fileEndLine && codeLineTo >= fileEndLine) && (
              <div className={classes.expandRow}>
                <Tooltip
                  label={`Load ${codeLineTo + 2} to ${
                    fileEndLine && fileEndLine < codeLineTo + loadCount + 2
                      ? fileEndLine + 1
                      : codeLineTo + loadCount + 2
                  } of file`}
                  withArrow
                >
                  <span className={classes.codeLoad} onClick={loadLowerCode}>
                    {loading && inStack === "loadLowerCode" ? (
                      <Loader type="oval" size="xs" />
                    ) : (
                      <IconFoldDown />
                    )}
                  </span>
                </Tooltip>
                <div className={classes.codeLine}>
                  <span className={classes.codeNumber}>
                    {error ??
                      `@@ ${codeLineTo + 2} - ${
                        fileEndLine ? fileEndLine + 1 : "end"
                      } of ${context.file_name}`}
                  </span>
                </div>
              </div>
            )}
          </pre>
        )}
      </Highlight>
    </Box>
  );
}
