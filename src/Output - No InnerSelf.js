// Your "Output" tab should look like this
const modifier = (text) => {
  try { text = QuestDirectorHooks.output(text); } catch (e) {}
  // Any other output modifier scripts can go here
  return { text };
};
modifier(text);
