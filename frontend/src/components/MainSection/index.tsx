import { useCallback, useEffect, useRef } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { getHotkeyHandler, useHotkeys } from "@mantine/hooks";
import {
  IconAlertTriangle,
  IconBolt,
  IconFileCode,
  IconMessageSearch,
  IconSearch,
  IconVectorTriangle,
} from "@tabler/icons-react";
import { useSearchParams } from "react-router-dom";
import useMountedState from "@/hooks/useMountedState";
import { useGetSearchResult } from "@/hooks/useGetSearchResult";
import { useTypewriter } from "@/hooks/useTypewriter";
import { CodeContainer } from "../CodeContainer";
import DemoSearch from "../DemoSearch";
import { FileTree } from "../FileTree";
import classes from "./Main.module.css";

const FEATURES = [
  {
    icon: IconVectorTriangle,
    title: "Two Embedding Models",
    text: "MiniLM reads natural language, UniXcoder reads code structure — combined for better matches.",
  },
  {
    icon: IconMessageSearch,
    title: "Search by Description",
    text: "Type what the code does. Function and variable names are optional.",
  },
  {
    icon: IconFileCode,
    title: "Results in Context",
    text: "See matching lines inside the full file, with direct links to GitHub.",
  },
];

// Every figure here should be one we can point at something for. The previous
// "<100ms Search Latency" was not: end-to-end a query spends most of its time
// encoding, and the live demo answers in roughly 0.8-1.5s.
//
// These are counted from the collections the indexing workflow builds, as of
// qdrant/qdrant 74f3e85b: 14,604 of the 17,187 signatures are functions, the
// rest structs and enums, across 1,720 .rs files. They go stale whenever the
// index is rebuilt, so re-check them after a reindex.
const STATS = [
  { value: "14,604", label: "Functions Indexed" },
  { value: "2", label: "Embedding Models" },
  { value: "1,720", label: "Files Indexed" },
];

// Four-digit millisecond counts read badly. Anything under a second stays in
// ms, above that reads as seconds, the way a person would say it.
const formatLatency = (ms: number) =>
  ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;

const PLACEHOLDER_PHRASES = [
  "flush the write-ahead log",
  "cardinality of should request",
  "geo condition filter",
  "merge two hnsw indexes",
];

export default function Main() {
  const [query, setQuery] = useMountedState("");
  const { data, getSearch, loading, error, resetData } = useGetSearchResult();
  const [searchParams, setSearchParams] = useSearchParams();
  const lastSearched = useRef<string | null>(null);

  useHotkeys([
    ["/", () => document.querySelector<HTMLInputElement>("input")?.focus()],
  ]);

  const showHero = !data && !loading && !error;
  const typedPlaceholder = useTypewriter(PLACEHOLDER_PHRASES, showHero && !query);

  // Lock body scroll on the hero (empty) state — the layout is designed to
  // fit the viewport with no scroll indicator. Any other state (results,
  // loading, error) scrolls normally.
  useEffect(() => {
    if (showHero) {
      document.body.setAttribute("data-home", "");
    } else {
      document.body.removeAttribute("data-home");
    }
    return () => document.body.removeAttribute("data-home");
  }, [showHero]);

  const runSearch = useCallback(
    (value: string) => {
      if (!value) return;
      resetData();
      lastSearched.current = value;
      setQuery(value);
      if (searchParams.get("query") !== value) {
        setSearchParams({ query: value });
      }
      getSearch(value);
    },
    [getSearch, resetData, searchParams, setQuery, setSearchParams]
  );

  useEffect(() => {
    const urlQuery = searchParams.get("query");
    if (urlQuery && urlQuery !== lastSearched.current) {
      runSearch(urlQuery);
    }
  }, [searchParams, runSearch]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;
    setQuery(value);
    if (value === "") {
      lastSearched.current = null;
      resetData();
      setSearchParams({}, { replace: true });
    }
  };

  return (
    <Container size="lg">
      <Box className={classes.searchBar} data-idle={showHero || undefined}>
        <TextInput
          size="md"
          leftSection={<IconSearch size={20} />}
          placeholder={
            showHero && !query
              ? `Try: ${typedPlaceholder}`
              : "Describe what you're looking for"
          }
          rightSection={
            <Button size="md" loading={loading} onClick={() => runSearch(query)}>
              Search
            </Button>
          }
          rightSectionWidth="6rem"
          value={query}
          onChange={handleChange}
          onKeyDown={getHotkeyHandler([["Enter", () => runSearch(query)]])}
          classNames={{ input: classes.input }}
          autoFocus
        />
      </Box>
      {data && (
        <>
          <Box className={classes.resultsBar}>
            <Text className={classes.resultsInfo}>
              <span className={classes.resultsCount}>{data.result.length}</span>{" "}
              results for &ldquo;{searchParams.get("query")}&rdquo;
              {/* Measured server-side and shown as reported. The hero used to
                  assert a latency figure instead, which was wrong by an order
                  of magnitude and had no way of noticing. */}
              {typeof data.latency_ms === "number" && (
                <> in <span className={classes.resultsCount}>{formatLatency(data.latency_ms)}</span></>
              )}
            </Text>
            <span
              className={classes.modePill}
              data-mode={data.mode ?? "semantic"}
              title={
                data.mode === "keyword"
                  ? "Keyword ranking (unixcoder embeddings still building)"
                  : "Semantic search via unixcoder + MiniLM"
              }
            >
              <IconBolt size={12} stroke={2.2} />
              {data.mode === "keyword" ? "Warming Up" : "Semantic"}
            </span>
          </Box>
          <Box className={classes.results}>
            <Box className={classes.navbar}>
              <FileTree data={data} />
            </Box>
            <Box className={classes.codeDisplayArea}>
              {data.result.map((item) => (
                <CodeContainer
                  {...item}
                  commit={data.indexed_commit}
                  key={`${item.context.snippet} ${item.line_from} ${item.line_to}`}
                />
              ))}
            </Box>
          </Box>
        </>
      )}
      {showHero && (
        <Box className={classes.hero}>
          <Text className={classes.eyebrow}>Semantic Search Demo</Text>
          <Title order={1} className={classes.heading}>
            Search Code by <span className={classes.headingHighlight}>Meaning</span>,
            <br />
            Not Keywords
          </Title>
          <Text className={classes.subHeading}>
            Describe what code does — find matching functions and snippets
            across the Qdrant codebase, no names required.
          </Text>
          <DemoSearch handleDemoSearch={runSearch} />
          <Box className={classes.stats}>
            {STATS.map((stat, i) => (
              <div key={stat.label} className={classes.stat}>
                <div className={classes.statValue}>{stat.value}</div>
                <div className={classes.statLabel}>{stat.label}</div>
                {i < STATS.length - 1 && <div className={classes.statDivider} />}
              </div>
            ))}
          </Box>
          <div className={classes.sectionEyebrow}>How It Works</div>
          <Box className={classes.features}>
            {FEATURES.map((feature) => (
              <div key={feature.title} className={classes.featureCard}>
                <div className={classes.featureIcon}>
                  <feature.icon size={20} stroke={1.7} />
                </div>
                <Text className={classes.featureTitle}>{feature.title}</Text>
                <Text className={classes.featureText}>{feature.text}</Text>
              </div>
            ))}
          </Box>
        </Box>
      )}
      {loading && (
        <Box className={classes.results} aria-label="Loading results">
          <Box className={classes.navbar}>
            <div className={classes.skeletonSidebar} />
          </Box>
          <Box className={classes.codeDisplayArea}>
            {[0, 1, 2].map((i) => (
              <div key={i} className={classes.skeletonCard} />
            ))}
          </Box>
        </Box>
      )}
      {error && (
        <Alert
          className={classes.errorAlert}
          icon={<IconAlertTriangle />}
          title="Something Went Wrong"
          color="Primary.5"
          variant="light"
        >
          {error}. Check that the search service is running, then try again.
        </Alert>
      )}
    </Container>
  );
}
