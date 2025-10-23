import { useState, useRef, useEffect, useCallback, useMemo, memo } from "react";
import Article from "./Article";
import Title from "./Title";
import Paragraph from "./Paragraph";
import {
  Collapse,
  Box,
  Avatar,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  TextField,
  Divider,
  Typography,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { chapters } from "../articles";

const colors = {
  blue: "#3d6aff",
  yellow: "#f8c82aff",
  black: "#292929ff",
  red: "#ff3d3dff",
  green: "#4cd663ff",
  white: "#ededed",
};

const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

type ArticleType = {
  title: string;
  color: keyof typeof colors;
  content: Paragraph[] | string;
};

type Paragraph = {
  text: string | string[];
  imageSrc?: string;
};

// Компонент статьи
type ArticleItemProps = {
  chapterIndex: number;
  articleIndex: number;
  article: ArticleType;
  isOpen: boolean;
  toggleArticle: (chapterIndex: number, articleIndex: number) => void;
  refCallback: (
    el: HTMLDivElement | null,
    chapterIndex: number,
    articleIndex: number
  ) => void;
};

const ArticleItem = memo(function ArticleItem({
  chapterIndex,
  articleIndex,
  article,
  isOpen,
  toggleArticle,
  refCallback,
}: ArticleItemProps) {
  const color = colors[article.color];
  const textColor = color === colors.white ? "black" : "white";

  return (
    <div
      ref={(el) => refCallback(el, chapterIndex, articleIndex)}
      style={{ position: "relative", marginBottom: 40 }}
    >
      <Avatar
        sx={{
          position: "absolute",
          bgcolor: "white",
          color,
          width: 50,
          height: 50,
        }}
      >
        {articleIndex + 1}
      </Avatar>
      <Article>
        <Title
          onClick={() => toggleArticle(chapterIndex, articleIndex)}
          color={color}
        >
          {article.title}
        </Title>
        <Collapse in={isOpen} timeout={600}>
          <Box
            sx={{
              transformOrigin: "top",
              transition: "all 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
              opacity: isOpen ? 1 : 0,
              transform: isOpen ? "translateY(0px)" : "translateY(-10px)",
              mt: 2,
              "::selection": {
                backgroundColor: color,
                color: textColor,
              },
            }}
          >
            {typeof article.content === "string" ? (
              <Paragraph>
                <p>{article.content}</p>
              </Paragraph>
            ) : (
              article.content.map((p, i) => (
                <Paragraph key={i} imageSrc={p.imageSrc}>
                  {Array.isArray(p.text)
                    ? p.text.map((line, idx) => (
                        <span key={idx}>
                          {line}
                          <br />
                        </span>
                      ))
                    : p.text}
                </Paragraph>
              ))
            )}
          </Box>
        </Collapse>
      </Article>
    </div>
  );
});

export default function ArticlesPage() {
  const [openIndexes, setOpenIndexes] = useState<[number, number][]>([]);
  const [openChapters, setOpenChapters] = useState<number[]>(
    () => chapters.map((_, i) => i) // по умолчанию все главы открыты
  );
  const articleRefs = useRef<(HTMLDivElement | null)[][]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [inputValue, setInputValue] = useState("");

  // Дебаунс поиска
  useEffect(() => {
    const handler = setTimeout(() => setSearchQuery(inputValue), 300);
    return () => clearTimeout(handler);
  }, [inputValue]);

  const toggleArticle = useCallback(
    (chapterIndex: number, articleIndex: number) => {
      setOpenIndexes((prev) =>
        prev.some(([ci, ai]) => ci === chapterIndex && ai === articleIndex)
          ? prev.filter(
              ([ci, ai]) => !(ci === chapterIndex && ai === articleIndex)
            )
          : [...prev, [chapterIndex, articleIndex]]
      );
    },
    []
  );

  const toggleChapter = useCallback((chapterIndex: number) => {
    setOpenChapters((prev) =>
      prev.includes(chapterIndex)
        ? prev.filter((i) => i !== chapterIndex)
        : [...prev, chapterIndex]
    );
  }, []);

  const scrollToArticle = useCallback(
    (chapterIndex: number, articleIndex: number) => {
      articleRefs.current[chapterIndex]?.[articleIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    },
    []
  );

  const setRef = useCallback(
    (el: HTMLDivElement | null, chapterIndex: number, articleIndex: number) => {
      if (!articleRefs.current[chapterIndex]) {
        articleRefs.current[chapterIndex] = [];
      }
      articleRefs.current[chapterIndex][articleIndex] = el;
    },
    []
  );

  // Фильтрация по всем главам и статьям
  const filteredChapters = useMemo(() => {
    if (!searchQuery.trim()) return chapters;
    const lower = searchQuery.toLowerCase();

    return chapters
      .map((ch) => ({
        ...ch,
        articles: ch.articles.filter(
          (a) =>
            a.title.toLowerCase().includes(lower) ||
            (typeof a.content === "string"
              ? a.content.toLowerCase().includes(lower)
              : a.content.some((p) =>
                  Array.isArray(p.text)
                    ? p.text.some((line) => line.toLowerCase().includes(lower))
                    : p.text.toLowerCase().includes(lower)
                ))
        ),
      }))
      .filter((ch) => ch.articles.length > 0);
  }, [searchQuery]);

  return (
    <>
      {/* Панель поиска и списка */}
      <Paper
        sx={{
          py: 1,
          position: "fixed",
          top: 20,
          left: 20,
          zIndex: 999,
          width: 400,
          maxHeight: "calc(100vh - 40px - 16px)",
          bgcolor: "white",
          overflow: "auto",
          borderRadius: 2,
        }}
        elevation={3}
      >
        <TextField
          placeholder="Поиск"
          variant="standard"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          sx={{
            width: "calc(100% - 24px)",
            ml: 2,
            height: 40,
          }}
        />

        <List dense>
          {filteredChapters.map((chapter, ci) => (
            <Box key={ci}>
              <ListItemButton onClick={() => toggleChapter(ci)}>
                <ListItemText
                  primary={
                    <Typography sx={{ fontWeight: "bold" }}>
                      {chapter.name}
                    </Typography>
                  }
                />
                {openChapters.includes(ci) ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse
                in={openChapters.includes(ci)}
                timeout="auto"
                unmountOnExit
              >
                {chapter.articles.map((article, ai) => (
                  <ListItemButton
                    key={ai}
                    onClick={() => scrollToArticle(ci, ai)}
                    sx={{ pl: 4 }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: colors[article.color],
                        width: 30,
                        height: 30,
                        mr: 1,
                        fontSize: 16,
                        color:
                          colors[article.color] === colors.white
                            ? "black"
                            : "white",
                      }}
                    >
                      {ai + 1}
                    </Avatar>
                    <ListItemText primary={article.title} />
                  </ListItemButton>
                ))}
              </Collapse>
              <Divider />
            </Box>
          ))}
        </List>
      </Paper>

      {/* Основной контент */}
      {filteredChapters.map((chapter, ci) => (
        <Box key={ci} sx={{ mb: 6 }}>
          <Typography variant="h4" sx={{ mb: 2 }}>
            Глава {roman[ci]}. {chapter.name}
          </Typography>
          {chapter.articles.map((article, ai) => (
            <ArticleItem
              key={ai}
              chapterIndex={ci}
              articleIndex={ai}
              article={article}
              isOpen={openIndexes.some(([c, a]) => c === ci && a === ai)}
              toggleArticle={toggleArticle}
              refCallback={setRef}
            />
          ))}
        </Box>
      ))}
    </>
  );
}
