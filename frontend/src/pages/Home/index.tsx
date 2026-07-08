import { FC, lazy } from "react";
import { Container, Text } from "@mantine/core";
import { CustomHeader } from "@/components/CustomHeader";
import SuspensePage from "./SuspensePage";
import classes from "./Home.module.css";

const Main = lazy(() => import("@/components/MainSection"));

const MainElement: FC = () => (
  <SuspensePage>
    <Main />
  </SuspensePage>
);

export default function Home() {
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
          <a
            className={classes.footerLink}
            href="https://github.com/qdrant/demo-code-search"
            target="_blank"
            rel="noopener noreferrer"
          >
            Star on GitHub
          </a>
        </Container>
      </footer>
    </div>
  );
}
