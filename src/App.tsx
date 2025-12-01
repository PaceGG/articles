// App.tsx
import React, { useState } from "react";
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Paper,
} from "@mui/material";
import ContentManager, { type Chapter } from "./components/ContentManager";

const initialChapter: Chapter = {
  id: "chapter-1",
  name: "Введение в React",
  order: 1,
  articles: [
    {
      id: "article-1",
      title: "Основы React",
      color: "blue",
      order: 1,
      content: [
        {
          id: "para-1",
          type: "text",
          text: "React - это JavaScript-библиотека для создания пользовательских интерфейсов.",
        },
        {
          id: "para-2",
          type: "list",
          text: ["Компоненты", "JSX", "Состояние", "Props"],
        },
      ],
    },
  ],
};

const App: React.FC = () => {
  const [mode, setMode] = useState<"create" | "edit">("edit");
  const [currentChapter, setCurrentChapter] = useState<Chapter | undefined>(
    initialChapter
  );

  const handleSaveChapter = (chapter: Chapter) => {
    console.log("Сохраненная глава:", chapter);
    setCurrentChapter(chapter);
    alert(mode === "create" ? "Глава создана!" : "Глава обновлена!");
  };

  const handleCreateNew = () => {
    setMode("create");
    setCurrentChapter(undefined);
  };

  return (
    <Paper>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Редактор контента
          </Typography>
          <Button color="inherit" onClick={handleCreateNew} sx={{ mr: 2 }}>
            Новая глава
          </Button>
          <Button
            color="inherit"
            onClick={() => {
              setMode("edit");
              setCurrentChapter(initialChapter);
            }}
          >
            Загрузить пример
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <ContentManager
          initialChapter={currentChapter}
          onSave={handleSaveChapter}
          onCancel={() => console.log("Отмена")}
          mode={mode}
        />
      </Container>
    </Paper>
  );
};

export default App;
