InnerSelf("output");
const modifier = (text) => {
  text = QuestDirectorHooks.output(text);
  return { text };
};
modifier(text);
