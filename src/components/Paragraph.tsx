import type { ReactNode } from "react";
import { Typography, Box } from "@mui/material";

type ParagraphProps = {
  children: ReactNode;
  imageSrc?: string;
  alt?: string;
};

function Paragraph({ children, imageSrc, alt }: ParagraphProps) {
  return (
    <Typography
      variant="body1"
      paragraph
      sx={{
        fontSize: 26,
        textAlign: "justify",
        textIndent: typeof children === "string" ? "2rem" : 0,
        lineHeight: 1.3,
        "&::after": imageSrc
          ? { content: '""', display: "block", clear: "both" }
          : undefined,
      }}
    >
      {imageSrc && (
        <Box
          component="img"
          src={imageSrc.includes(".") ? imageSrc : `${imageSrc}.png`}
          alt={alt}
          sx={{
            width: 328,
            height: 328,
            objectFit: "cover",
            borderRadius: 2,
            float: "left",
            marginRight: 2,
            marginBottom: 1,
            userSelect: "none",
          }}
        />
      )}
      {children}
    </Typography>
  );
}

export default Paragraph;
