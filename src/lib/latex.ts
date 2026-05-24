import katex from 'katex';

export function renderLatex(text: string): string {
  try {
    // Split by block math first
    const parts = text.split(/(\$\$[\s\S]*?\$\$)/g);

    return parts
      .map((part) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const formula = part.slice(2, -2).trim();
          try {
            return katex.renderToString(formula, {
              displayMode: true,
              throwOnError: false,
            });
          } catch {
            return `<span style="color: red;">$$${formula}$$</span>`;
          }
        }

        // Inline math
        const inlineParts = part.split(/(\$[^\$]+\$)/g);
        return inlineParts
          .map((inline) => {
            if (inline.startsWith('$') && inline.endsWith('$')) {
              const formula = inline.slice(1, -1).trim();
              try {
                return katex.renderToString(formula, {
                  displayMode: false,
                  throwOnError: false,
                });
              } catch {
                return `<span style="color: red;">$${formula}$</span>`;
              }
            }
            return escapeHtml(inline);
          })
          .join('');
      })
      .join('');
  } catch {
    return escapeHtml(text);
  }
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
