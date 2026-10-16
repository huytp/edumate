// navigator.clipboard only exists on secure origins (https or localhost); production is served
// over plain http, so fall back to a hidden textarea + execCommand('copy') there.
export const copyText = (text: string) => {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).catch(() => legacyCopy(text));
    return;
  }
  legacyCopy(text);
};

const legacyCopy = (text: string) => {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
  } finally {
    document.body.removeChild(textarea);
  }
};
