import { CustomHeader } from "@/components/CustomHeader";
import { FC, lazy } from "react";
import SuspensePage from "./SuspensePage";

const Main = lazy(() => import("@/components/MainSection"));
const MainElement: FC = () => {
  return (
    <SuspensePage>
      <Main />
    </SuspensePage>
  );
};

export default function Home() {
  return (
    <>
      <CustomHeader />
      <MainElement />
    </>
  );
}
