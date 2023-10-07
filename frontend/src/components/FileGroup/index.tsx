import { useState } from "react";
import {
  Group,
  Box,
  Collapse,
  ThemeIcon,
  UnstyledButton,
  rem,
} from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import classes from "./FileGroup.module.css";

interface LinksGroupProps {
  label: string;
  icon: any;
  initiallyOpened?: boolean;
  links?: LinksGroupProps[];
}

export function LinksGroup({
  icon: Icon,
  label,
  initiallyOpened,
  links,
}: LinksGroupProps) {
  const hasLinks = Array.isArray(links);
  const [opened, setOpened] = useState(initiallyOpened || false);
  const items = (hasLinks ? links : []).map((link) => {
    if (link.links) {
      return (
        <Box key={link.label} ml="sm" className={classes.lind}>
          <LinksGroup {...link} />
        </Box>
      );
    } else {
      return (
        <UnstyledButton
          key={link.label}
          className={classes.control}
          variant="transparent"
        >
          <Box
            style={{ display: "flex", alignItems: "center" }}
            ml={"sm"}
            className={classes.lind}
          >
            <ThemeIcon variant="transparent" size={30}>
              <link.icon style={{ width: rem(18), height: rem(18) }} />
            </ThemeIcon>
            <Box>{link.label}</Box>
          </Box>
        </UnstyledButton>
      );
    }
  });

  return (
    <>
      <UnstyledButton
        onClick={() => setOpened((o) => !o)}
        className={classes.control}
      >
        <Group justify="space-between" gap={0}>
          <Box style={{ display: "flex", alignItems: "center" }}>
            <ThemeIcon variant="transparent" size={30}>
              <Icon style={{ width: rem(18), height: rem(18) }} />
            </ThemeIcon>
            <Box>{label}</Box>
          </Box>
          {hasLinks && (
            <IconChevronRight
              className={classes.chevron}
              stroke={1.5}
              style={{
                width: rem(16),
                height: rem(16),
                transform: opened ? "rotate(-90deg)" : "none",
              }}
            />
          )}
        </Group>
      </UnstyledButton>
      {hasLinks ? <Collapse in={opened}>{items}</Collapse> : null}
    </>
  );
}
