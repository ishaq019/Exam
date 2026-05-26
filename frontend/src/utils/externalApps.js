export const SURVEY_APP_URL =
  import.meta.env.VITE_SURVEY_APP_URL || 'http://localhost:5174';

const cleanBaseUrl = (url) => String(url || '').replace(/\/$/, '');

export const buildSurveyAppUrl = (path, token, returnUrl) => {
  const url = new URL(path, cleanBaseUrl(SURVEY_APP_URL));

  if (token) {
    url.searchParams.set('token', token);
  }

  if (returnUrl) {
    url.searchParams.set('returnUrl', returnUrl);
  }

  return url.toString();
};

export const openSurveyApp = (path, token, returnUrl) => {
  window.location.href = buildSurveyAppUrl(path, token, returnUrl);
};
