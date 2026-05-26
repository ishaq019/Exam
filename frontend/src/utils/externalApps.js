export const SURVEY_APP_URL = 'https://ishaq019.github.io/survey-application';

const cleanBaseUrl = (url) => String(url || '').replace(/\/$/, '');

export const buildSurveyAppUrl = (path, returnUrl, participantId) => {
  const url = new URL(path, cleanBaseUrl(SURVEY_APP_URL));

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
