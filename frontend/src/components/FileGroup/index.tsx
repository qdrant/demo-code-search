import { useState } from "react";
import { Box, Collapse, Group, ThemeIcon, UnstyledButton } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import classes from "./FileGroup.module.css";

type IconComponent = React.ComponentType<{
  style?: React.CSSProperties;
  stroke?: string | number;
}>;

export interface LinkNode {
  label: string;
  icon: IconComponent;
  initiallyOpened?: boolean;
  id?: string;
  links?: LinkNode[];
}

/** Collapse chains of single-child folders into one "a/b/c" label. */
function flattenSingleChildFolders(
  label: string,
  links?: LinkNode[]
): { label: string; links?: LinkNode[] } {
  let flatLabel = label;
  let flatLinks = links;
  while (flatLinks?.length === 1 && flatLinks[0].links) {
    flatLabel = `${flatLabel}/${flatLinks[0].label}`;
    flatLinks = flatLinks[0].links;
  }
  return { label: flatLabel, links: flatLinks };
}

function scrollToResult(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export function LinksGroup(props: LinkNode) {
  const { icon: Icon, initiallyOpened } = props;
  const { label, links } = flattenSingleChildFolders(props.label, props.links);
  const [opened, setOpened] = useState(initiallyOpened ?? false);

  const items = links?.map((link) =>
    link.links ? (
      <Box key={link.label} ml="sm" className={classes.branch}>
        <LinksGroup {...link} />
      </Box>
    ) : (
      <UnstyledButton
        key={link.label}
        className={classes.control}
        onClick={() => scrollToResult(link.id ?? link.label)}
      >
        <Box ml="sm" className={`${classes.item} ${classes.branch}`}>
          <ThemeIcon variant="transparent" size={30}>
            <link.icon style={{ width: 18, height: 18 }} />
          </ThemeIcon>
          <Box>{link.label}</Box>
        </Box>
      </UnstyledButton>
    )
  );

  return (
    <>
      <UnstyledButton
        onClick={() => setOpened((o) => !o)}
        className={classes.control}
      >
        <Group justify="space-between" gap={0} wrap="nowrap">
          <Box className={classes.item}>
            <ThemeIcon variant="transparent" size={30}>
              <Icon style={{ width: 18, height: 18 }} />
            </ThemeIcon>
            <Box>{label}</Box>
          </Box>
          {links?.length && (
            <IconChevronRight
              className={classes.chevron}
              stroke={1.5}
              data-opened={opened || undefined}
            />
          )}
        </Group>
      </UnstyledButton>
      {links?.length ? <Collapse in={opened}>{items}</Collapse> : null}
    </>
  );
}
