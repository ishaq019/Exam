export const SURVEY_APP_URL = 'https://syedishaq.me/survey-app/';

const cleanBaseUrl = (url) => String(url || '').replace(/\/$/, '');

const normalizeSurveyPath = (path = '/') => {
  const safePath = String(path || '/');
  return safePath.startsWith('/') ? safePath.slice(1) : safePath;
};

export const buildSurveyAppUrl = (path, returnUrl, participantId) => {
  const url = new URL(normalizeSurveyPath(path), `${cleanBaseUrl(SURVEY_APP_URL)}/`);

  if (returnUrl) {
    url.searchParams.set('returnUrl', returnUrl);
  }

  if (participantId) {
    url.searchParams.set('participantId', participantId);
  }

  return url.toString();
};

export const openSurveyApp = (path, returnUrl, participantId) => {
  window.location.href = buildSurveyAppUrl(path, returnUrl, participantId);
};
