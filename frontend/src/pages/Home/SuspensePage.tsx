import { Box, Loader } from "@mantine/core";
import type { FC, ReactNode } from "react";
import { Suspense } from "react";

interface SuspensePageProps {
  children?: ReactNode;
}

const SuspensePage: FC<SuspensePageProps> = ({ children }) => {
  return (
    <Suspense
      fallback={
        <Box
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <Loader type="bars" />
        </Box>
      }
    >
      {children}
    </Suspense>
  );
};

export default SuspensePage;
