import { FC, lazy, useEffect, useState } from "react";
import { Container, Text, Tooltip } from "@mantine/core";
import {
  IconBrandLinkedin,
  IconBrandX,
  IconBrandYoutube,
  IconStarFilled,
} from "@tabler/icons-react";
import { CustomHeader } from "@/components/CustomHeader";
import SuspensePage from "./SuspensePage";
import classes from "./Home.module.css";

const Main = lazy(() => import("@/components/MainSection"));

const MainElement: FC = () => (
  <SuspensePage>
    <Main />
  </SuspensePage>
);

function formatStarCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return String(count);
}

function useGitHubStars(repo: string) {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch(`https://api.github.com/repos/${repo}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data?.stargazers_count != null) {
          setCount(data.stargazers_count);
        }
      })
      .catch(() => {
        /* ignore — button just falls back to "Star" with no count */
      });
    return () => {
      cancelled = true;
    };
  }, [repo]);
  return count;
}

const SOCIALS = [
  {
    label: "Qdrant on X",
    href: "https://x.com/qdrant_engine",
    Icon: IconBrandX,
  },
  {
    label: "Qdrant on YouTube",
    href: "https://www.youtube.com/@qdrant",
    Icon: IconBrandYoutube,
  },
  {
    label: "Qdrant on LinkedIn",
    href: "https://www.linkedin.com/company/qdrant/",
    Icon: IconBrandLinkedin,
  },
];

export default function Home() {
  const stars = useGitHubStars("qdrant/qdrant");

  return (
    <div className={classes.page}>
      <CustomHeader />
      <main className={classes.content}>
        <MainElement />
      </main>
      <footer className={classes.footer}>
        <Container size="lg" className={classes.footerInner}>
          <Text className={classes.footerText}>
            Powered by{" "}
            <a
              href="https://qdrant.tech"
              target="_blank"
              rel="noopener noreferrer"
            >
              Qdrant
            </a>{" "}
            vector search
          </Text>
          <div className={classes.footerActions}>
            <a
              className={classes.starBtn}
              href="https://github.com/qdrant/qdrant"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Star Qdrant on GitHub"
            >
              <IconStarFilled size={13} />
              Star
              {stars != null && (
                <span className={classes.starCount}>{formatStarCount(stars)}</span>
              )}
            </a>
            {SOCIALS.map(({ label, href, Icon }) => (
              <Tooltip key={href} label={label} withArrow>
                <a
                  className={classes.social}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                >
                  <Icon size={16} stroke={1.8} />
                </a>
              </Tooltip>
            ))}
          </div>
        </Container>
      </footer>
    </div>
  );
}
