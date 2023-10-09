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
  id?: string;
  links?: LinksGroupProps[];
}

export function LinksGroup({
  icon: Icon,
  label,
  initiallyOpened,
  links,
}: LinksGroupProps) {
  const [opened, setOpened] = useState(initiallyOpened || false);

  const getFileRoute = () => {
    if (links?.length === 1 && links[0].links) {
      label = `${label}/${links[0].label}`;
      links = links[0].links;
      getFileRoute();
    }
  };

  getFileRoute();

  const items = links?.map((link) => {
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
            onClick={() => {
              const element = document.getElementById(link.id ?? link.label);

              if (element) {
                element.scrollIntoView({ behavior: "smooth"});
              }
            }}
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
        <Group justify="space-between" gap={0} wrap="nowrap">
          <Box style={{ display: "flex", alignItems: "center" }}>
            <ThemeIcon variant="transparent" size={30}>
              <Icon style={{ width: rem(18), height: rem(18) }} />
            </ThemeIcon>
            <Box>{label}</Box>
          </Box>
          {links?.length && (
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
      {links?.length ? <Collapse in={opened}>{items}</Collapse> : null}
    </>
  );
}
