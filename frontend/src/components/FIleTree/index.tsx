import { Box } from "@mantine/core";

import classes from "./FileTree.module.css";
import { LinksGroup } from "../FileGroup";
import { searchResponse } from "@/hooks/useGetSearchResult";
import { IconFile, IconFolderFilled } from "@tabler/icons-react";

interface CodeElement {
  code_type: string;
  context: {
    file_name: string;
    file_path: string;
    module: string;
    snippet: string;
    struct_name?: string;
  };
  docstring: string | null;
  line: number;
  line_from: number;
  line_to: number;
  name: string;
  signature: string;
}

interface ParsedLink {
  label: string;
  icon: any;
  id?: string;
  initiallyOpened?: boolean;
  links?: ParsedLink[];
}

interface ParsedData {
  label: string;
  icon: any;
  initiallyOpened?: boolean;
  links?: ParsedLink[];
}

function parseCodeElements(data: { result: CodeElement[] }): ParsedData[] {
  const parsedData: ParsedLink[] = [];

  data.result.forEach((element) => {
    const filePathComponents = element.context.file_path.split("/");
    let currentLevel = parsedData;

    filePathComponents.forEach((component, index) => {
      const existingFolder = currentLevel.find(
        (item) => item.label === component
      );
      if (existingFolder) {
        currentLevel = existingFolder.links || [];
      } else if (index < filePathComponents.length - 1) {
        const newFolder: ParsedLink = {
          label: component,
          icon: IconFolderFilled,
          initiallyOpened: true,
          links: [],
        };
        currentLevel.push(newFolder);
        currentLevel = newFolder.links ? newFolder.links : [];
      }

      // If it's the last component, add the file to the current folder
      if (index === filePathComponents.length - 1) {
        const file: ParsedLink = {
          label: element.context.file_name,
          id: element.context.file_path,
          icon: IconFile,
        };
        currentLevel.push(file);
      }
    });
  });

  return parsedData;
}

export function FileTree({ data }: { data: searchResponse | null }) {
  const parsedData = parseCodeElements(data || { result: [] });

  const links = parsedData.map((link) => (
    <LinksGroup
      key={link.label}
      label={link.label}
      icon={link.icon}
      initiallyOpened={link.initiallyOpened}
      links={link.links}
    />
  ));
  return (
    <nav className={classes.navbar}>
      <Box className={classes.links}>
        <div className={classes.linksInner}>{links}</div>
      </Box>
    </nav>
  );
}
