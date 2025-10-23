import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

type TitleProps = {
  children: ReactNode;
  onClick?: () => void;
  color?: string;
};

function Title({ children, onClick, color = "#3d6aff" }: TitleProps) {
  // Функция для "красивого" разбиения строки на две строки
  const formatChildren = (text: ReactNode): string | ReactNode => {
    if (typeof text !== "string") return text;

    const words = text.split(" ");
    if (words.length <= 3) return text; // короткие оставляем без изменений

    const mid = Math.floor(words.length / 2); // верхняя часть меньше или равна нижней
    return words.slice(0, mid).join(" ") + "\n" + words.slice(mid).join(" ");
  };

  return (
    <Typography
      variant="h2"
      onClick={onClick}
      sx={{
        p: 1,
        bgcolor: color,
        textAlign: "center",
        textTransform: "uppercase",
        fontWeight: 400,
        fontSize: 45,
        color: color === "#ededed" ? "black" : "white",
        borderRadius: 2,
        cursor: onClick ? "pointer" : "default",
        userSelect: "none",
        whiteSpace: "pre-line", // учитывает переносы \n
      }}
    >
      {formatChildren(children)}
    </Typography>
  );
}

export default Title;
