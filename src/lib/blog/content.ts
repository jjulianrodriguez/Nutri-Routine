import sanitizeHtml, { type IOptions } from "sanitize-html";

const HTML_TAG_PATTERN = /<\/?[a-z][a-z0-9-]*(?:\s[^>]*)?>/i;
const BLOCK_CLASS_NAMES = [
  "blog-align-left",
  "blog-align-center",
  "blog-align-right",
] as const;
const INLINE_CLASS_NAMES = [
  "blog-color-accent",
  "blog-color-charcoal",
  "blog-color-teal",
  "blog-color-warm",
  "blog-highlight",
  "blog-text-large",
  "blog-text-small",
] as const;
const BLOCK_CLASS_SET = new Set<string>(BLOCK_CLASS_NAMES);
const INLINE_CLASS_SET = new Set<string>(INLINE_CLASS_NAMES);

function sanitizeClassAttribute(
  value: unknown,
  allowedClasses: Set<string>,
) {
  if (typeof value !== "string") {
    return undefined;
  }

  const className = value
    .split(/\s+/)
    .filter((item) => allowedClasses.has(item))
    .join(" ");

  return className || undefined;
}

function transformClassedTag(
  tagName: string,
  attributes: Record<string, string>,
  allowedClasses: Set<string>,
) {
  const className = sanitizeClassAttribute(attributes.class, allowedClasses);
  const attribs: Record<string, string> = {};

  if (className) {
    attribs.class = className;
  }

  return {
    attribs,
    tagName,
  };
}

const sanitizerOptions: IOptions = {
  allowedTags: [
    "a",
    "blockquote",
    "br",
    "em",
    "h1",
    "h2",
    "h3",
    "hr",
    "li",
    "ol",
    "p",
    "span",
    "strong",
    "u",
    "ul",
  ],
  allowedAttributes: {
    a: ["href", "rel", "target", "title"],
    h1: ["class"],
    h2: ["class"],
    h3: ["class"],
    p: ["class"],
    span: ["class", "style"],
  },
  allowedStyles: {
    span: {
      color: [/.*/],
      "font-size": [/.*/],
      "background-color": [/.*/],
    },
  },
  allowedClasses: {
    h1: [...BLOCK_CLASS_NAMES],
    h2: [...BLOCK_CLASS_NAMES],
    h3: [...BLOCK_CLASS_NAMES],
    p: [...BLOCK_CLASS_NAMES],
    span: [...INLINE_CLASS_NAMES],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowProtocolRelative: false,
  disallowedTagsMode: "discard",
  nonTextTags: ["script", "style", "textarea", "option", "noscript"],
  transformTags: {
    a: (tagName, attributes) => {
      const href = String(attributes.href ?? "").trim();

      if (!href) {
        return {
          attribs: {},
          tagName,
        };
      }

      const isExternal = /^https?:\/\//i.test(href);
      const isAllowedHref =
        isExternal ||
        /^mailto:/i.test(href) ||
        /^tel:/i.test(href) ||
        (href.startsWith("/") && !href.startsWith("//")) ||
        href.startsWith("#");

      if (!isAllowedHref) {
        return {
          attribs: {},
          tagName,
        };
      }

      const nextAttributes: Record<string, string> = {
        href,
      };

      if (attributes.title) {
        nextAttributes.title = String(attributes.title);
      }

      if (isExternal) {
        nextAttributes.rel = "noopener noreferrer";
        nextAttributes.target = "_blank";
      }

      return {
        attribs: nextAttributes,
        tagName,
      };
    },
    h1: (tagName, attributes) =>
      transformClassedTag(tagName, attributes, BLOCK_CLASS_SET),
    h2: (tagName, attributes) =>
      transformClassedTag(tagName, attributes, BLOCK_CLASS_SET),
    h3: (tagName, attributes) =>
      transformClassedTag(tagName, attributes, BLOCK_CLASS_SET),
    p: (tagName, attributes) =>
      transformClassedTag(tagName, attributes, BLOCK_CLASS_SET),
    span: (tagName, attributes) => {
      const className = sanitizeClassAttribute(attributes.class, INLINE_CLASS_SET);
      const attribs: Record<string, string> = {};

      if (className) {
        attribs.class = className;
      }

      if (attributes.style) {
        attribs.style = attributes.style;
      }

      return {
        attribs,
        tagName,
      };
    },
  },
};

const stripTextOptions: IOptions = {
  allowedAttributes: {},
  allowedTags: [],
  disallowedTagsMode: "discard",
  nonTextTags: ["script", "style", "textarea", "option", "noscript"],
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function plainTextToHtml(content: string) {
  return content
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map(
      (paragraph) => `<p>${escapeHtml(paragraph).replace(/\r?\n/g, "<br>")}</p>`,
    )
    .join("");
}

function decodeTextEntities(value: string) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 10)),
    )
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

export function isRichBlogContent(content: string) {
  return HTML_TAG_PATTERN.test(content);
}

export function getEditableBlogContent(content: string) {
  if (!content.trim()) {
    return "";
  }

  return isRichBlogContent(content)
    ? sanitizeBlogHtml(content)
    : plainTextToHtml(content);
}

export function sanitizeBlogHtml(content: string) {
  const html = isRichBlogContent(content)
    ? content.trim()
    : plainTextToHtml(content);

  return sanitizeHtml(html, sanitizerOptions).trim();
}

export function getBlogTextContent(content: string) {
  const htmlWithBlockSpaces = sanitizeBlogHtml(content).replace(
    /<\/?(?:blockquote|br|h1|h2|h3|hr|li|ol|p|span|ul)\b[^>]*>/gi,
    " ",
  );

  return decodeTextEntities(sanitizeHtml(htmlWithBlockSpaces, stripTextOptions))
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function hasBlogTextContent(content: string) {
  return getBlogTextContent(content).length > 0;
}
