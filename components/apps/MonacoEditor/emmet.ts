import type * as Monaco from "monaco-editor/esm/vs/editor/editor.api";

type EmmetSnippet = {
  detail: string;
  insertText: string;
  label: string;
};

// Emmet-like snippets for HTML, CSS, and JavaScript
const emmetSnippets: Record<string, EmmetSnippet[]> = {
  css: [
    {
      detail: "Margin property",
      insertText: "margin: $1;",
      label: "margin: 0;",
    },
    {
      detail: "Padding property",
      insertText: "padding: $1;",
      label: "padding: 0;",
    },
    {
      detail: "Flexbox display",
      insertText:
        "display: flex;\n\talign-items: center;\n\tjustify-content: center;",
      label: "display: flex;",
    },
    {
      detail: "Grid display",
      insertText: "display: grid;\n\tgrid-template-columns: $1;",
      label: "display: grid;",
    },
    {
      detail: "Font size",
      insertText: "font-size: $1px;",
      label: "font-size: 16px;",
    },
    {
      detail: "Color property",
      insertText: "color: $1;",
      label: "color: #000;",
    },
    {
      detail: "Background color",
      insertText: "background-color: $1;",
      label: "background-color: #fff;",
    },
    {
      detail: "Border property",
      insertText: "border: $1px solid $2;",
      label: "border: 1px solid #000;",
    },
    {
      detail: "Box shadow",
      insertText: "box-shadow: $1 $2 $3 rgba(0, 0, 0, 0.1);",
      label: "box-shadow:",
    },
    {
      detail: "Media query",
      insertText: "@media (max-width: $1px) {\n\t$2\n}",
      label: "@media",
    },
  ],
  html: [
    {
      detail: "HTML5 boilerplate",
      insertText: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>$1</title>
</head>
<body>
  $2
</body>
</html>`,
      label: "!",
    },
    {
      detail: "HTML structure",
      insertText: "<html>\n\t<body>\n\t\t$1\n\t</body>\n</html>",
      label: "html>body",
    },
    {
      detail: "Div with class",
      insertText: '<div class="$1">$2</div>',
      label: "div.classname",
    },
    {
      detail: "Div with id",
      insertText: '<div id="$1">$2</div>',
      label: "div#id",
    },
    {
      detail: "Paragraph",
      insertText: "<p>$1</p>",
      label: "p",
    },
    {
      detail: "Anchor link",
      insertText: '<a href="$1">$2</a>',
      label: "a",
    },
    {
      detail: "Image",
      insertText: '<img src="$1" alt="$2">',
      label: "img",
    },
    {
      detail: "Table structure",
      insertText: "<table>\n\t<tr>\n\t\t<td>$1</td>\n\t</tr>\n</table>",
      label: "table>tr>td",
    },
    {
      detail: "Unordered list",
      insertText: "<ul>\n\t<li>$1</li>\n</ul>",
      label: "ul>li",
    },
    {
      detail: "Form with input and button",
      insertText:
        '<form>\n\t<input type="text" placeholder="$1">\n\t<button type="submit">$2</button>\n</form>',
      label: "form>input+button",
    },
  ],
  javascript: [
    {
      detail: "Constant declaration",
      insertText: "const $1 = $2;",
      label: "const",
    },
    {
      detail: "Let declaration",
      insertText: "let $1 = $2;",
      label: "let",
    },
    {
      detail: "Function declaration",
      insertText:
        "function $1($2) {\n\t$3\n}\n\nmodule.exports = { $1 };",
      label: "function",
    },
    {
      detail: "Arrow function",
      insertText: "const $1 = ($2) => {\n\t$3\n};",
      label: "arrow function",
    },
    {
      detail: "If statement",
      insertText: "if ($1) {\n\t$2\n}",
      label: "if",
    },
    {
      detail: "For loop",
      insertText: "for (let i = 0; i < $1; i++) {\n\t$2\n}",
      label: "for loop",
    },
    {
      detail: "While loop",
      insertText: "while ($1) {\n\t$2\n}",
      label: "while",
    },
    {
      detail: "Try-catch block",
      insertText: "try {\n\t$1\n} catch (error) {\n\t$2\n}",
      label: "try-catch",
    },
    {
      detail: "Timeout function",
      insertText: "setTimeout(() => {\n\t$1\n}, $2);",
      label: "setTimeout",
    },
    {
      detail: "Async function with await",
      insertText:
        "async function $1($2) {\n\ttry {\n\t\tconst result = await $3;\n\t\treturn result;\n\t} catch (error) {\n\t\tconsole.error(error);\n\t}\n}",
      label: "async/await",
    },
  ],
};

export const registerEmmetSnippets = (monaco: typeof Monaco): void => {
  const languages = ["css", "html", "javascript", "typescript"];

  languages.forEach((language) => {
    const snippets = emmetSnippets[language] || [];

    monaco.languages.registerCompletionItemProvider(language, {
      provideCompletionItems(model, position) {
        const textUntilPosition = model.getValueInRange({
          endColumn: position.column,
          endLineNumber: position.lineNumber,
          startColumn: 1,
          startLineNumber: position.lineNumber,
        });

        const word = textUntilPosition.split(/\s/).pop() || "";

        const suggestions: Monaco.languages.CompletionItem[] = snippets.map(
          (snippet) => ({
            detail: snippet.detail,
            insertText: snippet.insertText,
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            kind: monaco.languages.CompletionItemKind.Snippet,
            label: snippet.label,
            range: {
              endColumn: position.column,
              endLineNumber: position.lineNumber,
              startColumn: position.column - word.length,
              startLineNumber: position.lineNumber,
            },
          })
        );

        return { suggestions };
      },
    });
  });
};
