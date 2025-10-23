import { Box, Paper } from "@mui/material";
import type { ReactNode } from "react";

type ArticleProps = {
  children: ReactNode;
};

function Article({ children }: ArticleProps) {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 2,
        backgroundColor: "background.paper",
      }}
    >
      <Box component="article">{children}</Box>
    </Paper>
  );
}

export default Article;
