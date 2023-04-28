import MarkdownIt from "markdown-it";

export const md = new MarkdownIt({
  linkify: true,
  typographer: true,
})
  .use(require("markdown-it-emoji"))
  .use(require("markdown-it-sub"))
  .use(require("markdown-it-sup"))
  .use(require("markdown-it-footnote"))
  .use(require("markdown-it-deflist"))
  .use(require("markdown-it-abbr"))
  .use(require("markdown-it-anchor"))
  .use(require("markdown-it-iframe"))
  .use(require("markdown-it-table-of-contents"), {
    slugify: true,
    containerClass:
      "inline-flex flex-col pr-4 w-auto bg-gray-100 border text-base",
    containerHeaderHtml: `<div class="pl-4 pt-8 text-xl font-bold">Table of contents:</div>`,
  });
