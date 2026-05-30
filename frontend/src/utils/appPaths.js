const normalizeBasePath = (value) => {
  const raw = String(value || "/exam").trim();

  if (!raw || raw === "/") {
    return "/";
  }

  return `/${raw.replace(/^\/+|\/+$/g, "")}`;
};

const getRuntimeBasePath = () => {
  if (typeof window === "undefined") {
    return "/";
  }

  const { pathname } = window.location;

  if (pathname.startsWith("/exam")) {
    return "/exam";
  }

  if (pathname.startsWith("/survey")) {
    return "/survey";
  }

  return "/";
};

export const APP_BASE_PATH = normalizeBasePath(getRuntimeBasePath());

export const buildAppPath = (path = "") => {
  const normalizedPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";

  if (APP_BASE_PATH === "/") {
    return normalizedPath || "/";
  }

  if (!normalizedPath) {
    return APP_BASE_PATH;
  }

  return `${APP_BASE_PATH}${normalizedPath}`;
};

export const buildAppUrl = (path = "") => {
  if (typeof window === "undefined") {
    return buildAppPath(path);
  }

  return new URL(buildAppPath(path), window.location.origin).toString();
};