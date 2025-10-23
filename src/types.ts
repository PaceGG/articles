export type Chapter = {
  name: string;
  articles: Article[];
};

export type Article = {
  title: string;
  color: "blue" | "yellow" | "black" | "red" | "green" | "white";
  content: Paragraph[] | string;
};

export type Paragraph = {
  text: string | string[];
  imageSrc?: string;
};
