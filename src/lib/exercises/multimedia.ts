function isSafeExternalUrl(value: string) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();

    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      !url.username &&
      !url.password &&
      hostname !== "localhost" &&
      hostname !== "127.0.0.1" &&
      hostname !== "::1" &&
      !hostname.endsWith(".local")
    );
  } catch {
    return false;
  }
}

export type ExternalResourcePresentation = {
  domain: string;
  label: string;
  type: "document" | "external" | "image" | "video";
};

function getCleanDomain(hostname: string) {
  return hostname.toLowerCase().replace(/^www\./, "");
}

export function getExternalResourcePresentation(
  value: string,
): ExternalResourcePresentation {
  try {
    const url = new URL(value);
    const domain = getCleanDomain(url.hostname);
    const pathname = url.pathname.toLowerCase();
    const isVideoFile = /\.(mp4|mov|m4v|webm)$/.test(pathname);
    const isImageFile = /\.(avif|gif|jpe?g|png|svg|webp)$/.test(pathname);
    const isDocumentFile = /\.(docx?|pdf|pptx?|xlsx?)$/.test(pathname);

    if (domain.includes("youtube.com") || domain === "youtu.be") {
      return {
        domain,
        label: "YouTube",
        type: "video",
      };
    }

    if (domain.includes("instagram.com")) {
      return {
        domain,
        label: "Video de Instagram",
        type: "video",
      };
    }

    if (domain.includes("vimeo.com") || isVideoFile) {
      return {
        domain,
        label: "Video",
        type: "video",
      };
    }

    if (isImageFile) {
      return {
        domain,
        label: "Imagen de referencia",
        type: "image",
      };
    }

    if (isDocumentFile) {
      return {
        domain,
        label: "Guia externa",
        type: "document",
      };
    }

    return {
      domain,
      label: domain || "Recurso externo",
      type: "external",
    };
  } catch {
    return {
      domain: "Recurso externo",
      label: "Recurso externo",
      type: "external",
    };
  }
}

export function normalizeExerciseMultimediaUrls(
  multimediaUrls: string[] | null | undefined,
  multimediaUrl: string | null | undefined,
) {
  const candidates =
    multimediaUrls && multimediaUrls.length > 0
      ? multimediaUrls
      : multimediaUrl
        ? [multimediaUrl]
        : [];
  const uniqueUrls = new Map<string, string>();

  candidates.forEach((value) => {
    const trimmedValue = value.trim();
    const normalizedValue = trimmedValue.toLocaleLowerCase("en");

    if (
      trimmedValue &&
      isSafeExternalUrl(trimmedValue) &&
      !uniqueUrls.has(normalizedValue)
    ) {
      uniqueUrls.set(normalizedValue, trimmedValue);
    }
  });

  return [...uniqueUrls.values()].slice(0, 3);
}
