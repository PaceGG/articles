import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  IconButton,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Stack,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Tooltip,
  Collapse,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  Image as ImageIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  DragIndicator as DragIndicatorIcon,
  Article as ArticleIcon,
  MenuBook as MenuBookIcon,
  TextFields as TextFieldsIcon,
} from "@mui/icons-material";
import {
  DragDropContext,
  Droppable,
  Draggable,
  // DropResult,
} from "@hello-pangea/dnd";

// Типы
export type Paragraph = {
  id: string;
  text: string | string[];
  imageSrc?: string;
  type: "text" | "image" | "list";
};

export type Article = {
  id: string;
  title: string;
  color: "blue" | "yellow" | "black" | "red" | "green" | "white";
  content: Paragraph[] | string;
  order: number;
};

export type Chapter = {
  id: string;
  name: string;
  articles: Article[];
  order: number;
};

// Интерфейсы пропсов
interface ContentManagerProps {
  initialChapter?: Chapter;
  onSave: (chapter: Chapter) => void;
  onCancel?: () => void;
  mode: "create" | "edit";
}

interface ArticleFormProps {
  article?: Article;
  onSave: (article: Article) => void;
  onCancel: () => void;
  mode: "create" | "edit";
}

interface ParagraphFormProps {
  paragraph?: Paragraph;
  onSave: (paragraph: Paragraph) => void;
  onCancel: () => void;
  mode: "create" | "edit";
}

// Константы
const colorOptions: Article["color"][] = [
  "blue",
  "yellow",
  "black",
  "red",
  "green",
  "white",
];
const colorMap = {
  blue: "#2196F3",
  yellow: "#FFEB3B",
  black: "#000000",
  red: "#F44336",
  green: "#4CAF50",
  white: "#FFFFFF",
};

// Компонент для редактирования Paragraph
const ParagraphForm: React.FC<ParagraphFormProps> = ({
  paragraph,
  onSave,
  onCancel,
  mode,
}) => {
  const [type, setType] = useState<Paragraph["type"]>(
    paragraph?.type || "text"
  );
  const [text, setText] = useState<string>(() => {
    if (paragraph?.text) {
      return Array.isArray(paragraph.text)
        ? paragraph.text.join("\n")
        : paragraph.text;
    }
    return "";
  });
  const [imageSrc, setImageSrc] = useState<string>(paragraph?.imageSrc || "");

  const handleSubmit = () => {
    const formattedText =
      type === "list" ? text.split("\n").filter((line) => line.trim()) : text;
    const newParagraph: Paragraph = {
      id: paragraph?.id || `para-${Date.now()}`,
      type,
      text: formattedText,
      imageSrc: type === "image" ? imageSrc : undefined,
    };
    onSave(newParagraph);
  };

  return (
    <Paper sx={{ p: 3, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        {mode === "create" ? "Новый параграф" : "Редактировать параграф"}
      </Typography>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Тип контента</InputLabel>
        <Select
          value={type}
          label="Тип контента"
          onChange={(e) => setType(e.target.value as Paragraph["type"])}
        >
          <MenuItem value="text">Текст</MenuItem>
          <MenuItem value="list">Список</MenuItem>
          <MenuItem value="image">Изображение</MenuItem>
        </Select>
      </FormControl>

      {type === "text" && (
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Текст"
          value={text}
          onChange={(e) => setText(e.target.value)}
          sx={{ mb: 2 }}
        />
      )}

      {type === "list" && (
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Список (каждая строка - новый элемент)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          sx={{ mb: 2 }}
          helperText="Каждая новая строка будет отдельным элементом списка"
        />
      )}

      {type === "image" && (
        <TextField
          fullWidth
          label="URL изображения"
          value={imageSrc}
          onChange={(e) => setImageSrc(e.target.value)}
          sx={{ mb: 2 }}
          helperText="Введите URL изображения"
        />
      )}

      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button onClick={onCancel} variant="outlined">
          Отмена
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Сохранить
        </Button>
      </Stack>
    </Paper>
  );
};

// Компонент для редактирования Article
const ArticleForm: React.FC<ArticleFormProps> = ({
  article,
  onSave,
  onCancel,
  mode,
}) => {
  const [title, setTitle] = useState<string>(article?.title || "");
  const [color, setColor] = useState<Article["color"]>(
    article?.color || "blue"
  );
  const [contentType, setContentType] = useState<"paragraphs" | "simple">(
    Array.isArray(article?.content) ? "paragraphs" : "simple"
  );
  const [simpleContent, setSimpleContent] = useState<string>(
    typeof article?.content === "string" ? article.content : ""
  );
  const [paragraphs, setParagraphs] = useState<Paragraph[]>(
    Array.isArray(article?.content) ? article.content : []
  );
  const [showParagraphForm, setShowParagraphForm] = useState<boolean>(false);
  const [editingParagraph, setEditingParagraph] = useState<
    Paragraph | undefined
  >();
  const [paragraphFormMode, setParagraphFormMode] = useState<"create" | "edit">(
    "create"
  );
  const [tabValue, setTabValue] = useState(0);

  const handleSaveParagraph = (paragraph: Paragraph) => {
    if (paragraphFormMode === "edit" && editingParagraph) {
      const index = paragraphs.findIndex((p) => p.id === editingParagraph.id);
      if (index !== -1) {
        const newParagraphs = [...paragraphs];
        newParagraphs[index] = paragraph;
        setParagraphs(newParagraphs);
      }
    } else {
      setParagraphs([...paragraphs, paragraph]);
    }
    setShowParagraphForm(false);
    setEditingParagraph(undefined);
  };

  const handleEditParagraph = (paragraph: Paragraph) => {
    setEditingParagraph(paragraph);
    setParagraphFormMode("edit");
    setShowParagraphForm(true);
  };

  const handleDeleteParagraph = (id: string) => {
    setParagraphs(paragraphs.filter((p) => p.id !== id));
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(paragraphs);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setParagraphs(items);
  };

  const handleSubmit = () => {
    const content = contentType === "simple" ? simpleContent : paragraphs;
    const newArticle: Article = {
      id: article?.id || `article-${Date.now()}`,
      title,
      color,
      content,
      order: article?.order || 0,
    };
    onSave(newArticle);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {mode === "create" ? "Новая статья" : "Редактировать статью"}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Название статьи"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Цвет</InputLabel>
            <Select
              value={color}
              label="Цвет"
              onChange={(e) => setColor(e.target.value as Article["color"])}
            >
              {colorOptions.map((colorOption) => (
                <MenuItem key={colorOption} value={colorOption}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        backgroundColor: colorMap[colorOption],
                        mr: 1,
                        border: "1px solid #ccc",
                      }}
                    />
                    {colorOption}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
          >
            <Tab label="Содержимое" />
            <Tab label="Предпросмотр" />
          </Tabs>
        </Grid>

        {tabValue === 0 && (
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={contentType === "paragraphs"}
                  onChange={(e) =>
                    setContentType(e.target.checked ? "paragraphs" : "simple")
                  }
                />
              }
              label="Использовать структурированный контент (параграфы)"
            />

            {contentType === "simple" ? (
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Содержимое статьи"
                value={simpleContent}
                onChange={(e) => setSimpleContent(e.target.value)}
                sx={{ mt: 2 }}
              />
            ) : (
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setEditingParagraph(undefined);
                    setParagraphFormMode("create");
                    setShowParagraphForm(true);
                  }}
                  sx={{ mb: 2 }}
                >
                  Добавить параграф
                </Button>

                {showParagraphForm && (
                  <ParagraphForm
                    paragraph={editingParagraph}
                    onSave={handleSaveParagraph}
                    onCancel={() => {
                      setShowParagraphForm(false);
                      setEditingParagraph(undefined);
                    }}
                    mode={paragraphFormMode}
                  />
                )}

                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="paragraphs">
                    {(provided) => (
                      <List
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                      >
                        {paragraphs.map((paragraph, index) => (
                          <Draggable
                            key={paragraph.id}
                            draggableId={paragraph.id}
                            index={index}
                          >
                            {(provided) => (
                              <Paper
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                sx={{ mb: 2, p: 2 }}
                              >
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  spacing={1}
                                >
                                  <Box {...provided.dragHandleProps}>
                                    <DragIndicatorIcon />
                                  </Box>
                                  <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="subtitle2">
                                      {paragraph.type === "text" && "Текст"}
                                      {paragraph.type === "list" && "Список"}
                                      {paragraph.type === "image" &&
                                        "Изображение"}
                                    </Typography>
                                    {paragraph.type === "image" &&
                                      paragraph.imageSrc && (
                                        <Typography
                                          variant="body2"
                                          color="text.secondary"
                                        >
                                          {paragraph.imageSrc}
                                        </Typography>
                                      )}
                                    {paragraph.type !== "image" && (
                                      <Typography variant="body2" noWrap>
                                        {Array.isArray(paragraph.text)
                                          ? paragraph.text.join(", ")
                                          : paragraph.text}
                                      </Typography>
                                    )}
                                  </Box>
                                  <IconButton
                                    onClick={() =>
                                      handleEditParagraph(paragraph)
                                    }
                                  >
                                    <EditIcon />
                                  </IconButton>
                                  <IconButton
                                    onClick={() =>
                                      handleDeleteParagraph(paragraph.id)
                                    }
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Stack>
                              </Paper>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </List>
                    )}
                  </Droppable>
                </DragDropContext>
              </Box>
            )}
          </Grid>
        )}

        {tabValue === 1 && (
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 3,
                bgcolor: colorMap[color] + "10",
                border: `2px solid ${colorMap[color]}`,
              }}
            >
              <Typography variant="h5" gutterBottom>
                {title}
              </Typography>
              {contentType === "simple" ? (
                <Typography>{simpleContent}</Typography>
              ) : (
                paragraphs.map((para) => (
                  <Box key={para.id} sx={{ mb: 2 }}>
                    {para.type === "text" && (
                      <Typography>{para.text}</Typography>
                    )}
                    {para.type === "list" && Array.isArray(para.text) && (
                      <ul>
                        {para.text.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    )}
                    {para.type === "image" && para.imageSrc && (
                      <Box sx={{ textAlign: "center" }}>
                        <img
                          src={para.imageSrc}
                          alt="Paragraph"
                          style={{ maxWidth: "100%", maxHeight: 300 }}
                        />
                      </Box>
                    )}
                  </Box>
                ))
              )}
            </Paper>
          </Grid>
        )}
      </Grid>

      <Stack
        direction="row"
        spacing={2}
        justifyContent="flex-end"
        sx={{ mt: 3 }}
      >
        <Button onClick={onCancel} variant="outlined">
          Отмена
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Сохранить статью
        </Button>
      </Stack>
    </Paper>
  );
};

// Основной компонент ContentManager
const ContentManager: React.FC<ContentManagerProps> = ({
  initialChapter,
  onSave,
  onCancel,
  mode,
}) => {
  const [chapterName, setChapterName] = useState<string>(
    initialChapter?.name || ""
  );
  const [articles, setArticles] = useState<Article[]>(
    initialChapter?.articles || []
  );
  const [showArticleForm, setShowArticleForm] = useState<boolean>(false);
  const [editingArticle, setEditingArticle] = useState<Article | undefined>();
  const [articleFormMode, setArticleFormMode] = useState<"create" | "edit">(
    "create"
  );
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const handleSaveArticle = (article: Article) => {
    if (articleFormMode === "edit" && editingArticle) {
      const index = articles.findIndex((a) => a.id === editingArticle.id);
      if (index !== -1) {
        const newArticles = [...articles];
        newArticles[index] = { ...article, order: index };
        setArticles(newArticles);
      }
    } else {
      setArticles([...articles, { ...article, order: articles.length }]);
    }
    setShowArticleForm(false);
    setEditingArticle(undefined);
    setSnackbar({
      open: true,
      message:
        articleFormMode === "edit" ? "Статья обновлена" : "Статья добавлена",
      severity: "success",
    });
  };

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article);
    setArticleFormMode("edit");
    setShowArticleForm(true);
    setActiveTab(1);
  };

  const handleDeleteArticle = (id: string) => {
    setArticles(articles.filter((a) => a.id !== id));
    setSnackbar({
      open: true,
      message: "Статья удалена",
      severity: "success",
    });
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(articles);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Обновляем порядок
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    setArticles(updatedItems);
  };

  const handleSubmit = () => {
    if (!chapterName.trim()) {
      setSnackbar({
        open: true,
        message: "Введите название главы",
        severity: "error",
      });
      return;
    }

    const chapter: Chapter = {
      id: initialChapter?.id || `chapter-${Date.now()}`,
      name: chapterName,
      articles: articles,
      order: initialChapter?.order || 0,
    };

    onSave(chapter);
    setSnackbar({
      open: true,
      message: mode === "create" ? "Глава создана" : "Глава обновлена",
      severity: "success",
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {mode === "create" ? "Создание главы" : "Редактирование главы"}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Название главы"
            value={chapterName}
            onChange={(e) => setChapterName(e.target.value)}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
          >
            <Tab label="Список статей" />
            <Tab
              label={
                showArticleForm
                  ? articleFormMode === "create"
                    ? "Новая статья"
                    : "Редактирование"
                  : "Добавить статью"
              }
              icon={!showArticleForm ? <AddIcon /> : undefined}
            />
          </Tabs>

          <Box sx={{ mt: 3 }}>
            {activeTab === 0 && (
              <Paper sx={{ p: 2 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
                  <Typography variant="h6">
                    Статьи в главе ({articles.length})
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setEditingArticle(undefined);
                      setArticleFormMode("create");
                      setShowArticleForm(true);
                      setActiveTab(1);
                    }}
                  >
                    Добавить статью
                  </Button>
                </Stack>

                {articles.length === 0 ? (
                  <Alert severity="info">
                    В этой главе пока нет статей. Добавьте первую статью.
                  </Alert>
                ) : (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="articles">
                      {(provided) => (
                        <List
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          {articles
                            .sort((a, b) => a.order - b.order)
                            .map((article, index) => (
                              <Draggable
                                key={article.id}
                                draggableId={article.id}
                                index={index}
                              >
                                {(provided) => (
                                  <Paper
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    sx={{
                                      mb: 2,
                                      p: 2,
                                      borderLeft: `4px solid ${
                                        colorMap[article.color]
                                      }`,
                                    }}
                                  >
                                    <Stack
                                      direction="row"
                                      alignItems="center"
                                      spacing={2}
                                    >
                                      <Box {...provided.dragHandleProps}>
                                        <DragIndicatorIcon />
                                      </Box>
                                      <Box sx={{ flexGrow: 1 }}>
                                        <Stack
                                          direction="row"
                                          alignItems="center"
                                          spacing={1}
                                        >
                                          <Box
                                            sx={{
                                              width: 16,
                                              height: 16,
                                              backgroundColor:
                                                colorMap[article.color],
                                              borderRadius: "50%",
                                            }}
                                          />
                                          <Typography variant="h6">
                                            {article.title}
                                          </Typography>
                                        </Stack>
                                        <Typography
                                          variant="body2"
                                          color="text.secondary"
                                        >
                                          {Array.isArray(article.content)
                                            ? `${article.content.length} параграфов`
                                            : "Простой текст"}
                                        </Typography>
                                      </Box>
                                      <IconButton
                                        onClick={() =>
                                          handleEditArticle(article)
                                        }
                                      >
                                        <EditIcon />
                                      </IconButton>
                                      <IconButton
                                        onClick={() =>
                                          handleDeleteArticle(article.id)
                                        }
                                      >
                                        <DeleteIcon />
                                      </IconButton>
                                    </Stack>
                                  </Paper>
                                )}
                              </Draggable>
                            ))}
                          {provided.placeholder}
                        </List>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
              </Paper>
            )}

            {activeTab === 1 && (
              <Box>
                {showArticleForm ? (
                  <ArticleForm
                    article={editingArticle}
                    onSave={handleSaveArticle}
                    onCancel={() => {
                      setShowArticleForm(false);
                      setEditingArticle(undefined);
                      setActiveTab(0);
                    }}
                    mode={articleFormMode}
                  />
                ) : (
                  <Paper sx={{ p: 4, textAlign: "center" }}>
                    <ArticleIcon
                      sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
                    />
                    <Typography variant="h6" gutterBottom>
                      Создайте новую статью или выберите существующую для
                      редактирования
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        setEditingArticle(undefined);
                        setArticleFormMode("create");
                        setShowArticleForm(true);
                      }}
                      sx={{ mt: 2 }}
                    >
                      Создать статью
                    </Button>
                  </Paper>
                )}
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>

      <Stack
        direction="row"
        spacing={2}
        justifyContent="flex-end"
        sx={{ mt: 4 }}
      >
        {onCancel && (
          <Button onClick={onCancel} variant="outlined">
            Отмена
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          size="large"
        >
          {mode === "create" ? "Создать главу" : "Сохранить изменения"}
        </Button>
      </Stack>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ContentManager;
