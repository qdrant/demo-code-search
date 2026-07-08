import { Box } from "@mantine/core";
import { IconFile, IconFolderFilled } from "@tabler/icons-react";
import { LinksGroup, type LinkNode } from "../FileGroup";
import { SearchResponse } from "@/hooks/useGetSearchResult";
import classes from "./FileTree.module.css";

function parseCodeElements(data: SearchResponse): LinkNode[] {
  const parsedData: LinkNode[] = [];

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
        const newFolder: LinkNode = {
          label: component,
          icon: IconFolderFilled,
          initiallyOpened: true,
          links: [],
        };
        currentLevel.push(newFolder);
        currentLevel = newFolder.links ?? [];
      }

      // The last path component is the file itself.
      if (index === filePathComponents.length - 1) {
        currentLevel.push({
          label: element.context.file_name,
          id: element.context.file_path,
          icon: IconFile,
        });
      }
    });
  });

  return parsedData;
}

export function FileTree({ data }: { data: SearchResponse | null }) {
  const parsedData = parseCodeElements(data ?? { result: [] });

  return (
    <nav className={classes.navbar}>
      <div className={classes.treeLabel}>Files</div>
      <Box className={classes.links}>
        <div className={classes.linksInner}>
          {parsedData.map((link) => (
            <LinksGroup key={link.label} {...link} />
          ))}
        </div>
      </Box>
    </nav>
  );
}
