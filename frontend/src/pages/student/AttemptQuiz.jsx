import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import stripHtml from "../../utils/stripHtml";
import { buildSurveyAppUrl } from "../../utils/externalApps";
import { getAppAbsoluteUrl } from "../../utils/appUrl";

const formatTime = (seconds = 0) => {
  const safeSeconds = Math.max(0, seconds);
  const hrs = Math.floor(safeSeconds / 3600);
  const mins = Math.floor((safeSeconds % 3600) / 60);
  const secs = safeSeconds % 60;

  return [hrs, mins, secs]
    .filter((value, index) => index > 0 || value > 0)
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
};

export default function AttemptQuiz() {
  const { examId } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [responses, setResponses] = useState({});
  const [remainingSeconds, setRemainingSeconds] = useState(null);

  const responsesRef = useRef({});
  const submittingRef = useRef(false);

  useEffect(() => {
    responsesRef.current = responses;
  }, [responses]);

  useEffect(() => {
    api
      .get(`/student/exams/${examId}/start`)
      .then((res) => {
        setData(res.data);
        setRemainingSeconds(Number(res.data.remainingSeconds) || 0);
      })
      .catch((err) => {
        const msg = err.response?.data?.message || "Cannot start exam";
        toast.error(msg);
        setLoadError(msg);
      });
  }, [examId, token]);

  const updateResponse = (questionId, patch) => {
    setResponses((old) => ({
      ...old,
      [questionId]: {
        selectedOption: null,
        selectedOptions: [],
        textAnswer: "",
        isMarkedForReview: false,
        workArea: "",
        ...(old[questionId] || {}),
        ...patch,
      },
    }));
  };

  const buildAnswers = useCallback(() => {
    if (!data?.questions) return [];

    return data.questions.map((question) => {
      const response = responsesRef.current[question._id] || {};

      return {
        questionId: question._id,
        selectedOption:
          response.selectedOption === undefined
            ? null
            : response.selectedOption,
        selectedOptions: Array.isArray(response.selectedOptions) ? response.selectedOptions : [],
        textAnswer:
          typeof response.textAnswer === "string"
            ? response.textAnswer.trim().toLowerCase()
            : "",
        isMarkedForReview: Boolean(response.isMarkedForReview),
        workArea: response.workArea || "",
      };
    });
  }, [data]);

  const submit = useCallback(
    async (autoSubmitted = false) => {
      if (submittingRef.current || !data) return;

      submittingRef.current = true;

      try {
        const res = await api.post(`/student/exams/${examId}/submit`, {
          answers: buildAnswers(),
          autoSubmitted,
        });

        toast.success(
          autoSubmitted
            ? "Time is over. Exam submitted automatically."
            : "Exam submitted"
        );


        const postSurveyRequired =
          res.data?.nextStep?.postSurveyRequired ??
          res.data?.exam?.surveyConfig?.postExamEnabled ??
          data?.exam?.surveyConfig?.postExamEnabled;

        if (postSurveyRequired) {
          const resultKey = `exam-result-${examId}-${Date.now()}`;
          sessionStorage.setItem(resultKey, JSON.stringify(res.data));

          window.location.href = buildSurveyAppUrl(
            `/student/exams/${examId}/after-survey`,
            token,
            getAppAbsoluteUrl(`/result?resultKey=${encodeURIComponent(resultKey)}`)
          );
        } else {
          navigate(`/result`, { state: res.data });
        }
      } catch (err) {
        submittingRef.current = false;
        toast.error(err.response?.data?.message || "Submit failed");
      }
    },
    [buildAnswers, data, examId, navigate, token]
  );

  useEffect(() => {
    if (remainingSeconds === null || submittingRef.current) return undefined;

    if (remainingSeconds <= 0) {
      submit(true);
      return undefined;
    }

    const timer = setInterval(() => {
      setRemainingSeconds((old) => Math.max((old || 0) - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingSeconds, submit]);

  if (!data && loadError) {
    return (
      <div className="card">
        <h3>Unable to start exam</h3>
        <p className="muted">{loadError}</p>
        <button onClick={() => navigate("/student/exams")}>Back to Exams</button>
      </div>
    );
  }

  if (!data) return <Loader />;

  const answeredCount = data.questions.filter(
    (question) => {
      const response = responses[question._id] || {};
      if (question.questionType === "multiSelect") {
        return Array.isArray(response.selectedOptions) && response.selectedOptions.length > 0;
      }
      if (question.questionType === "fillInTheBlank" || question.questionType === "oneWord") {
        return typeof response.textAnswer === "string" && response.textAnswer.trim().length > 0;
      }
      return response.selectedOption !== undefined && response.selectedOption !== null;
    }
  ).length;

  const markedCount = data.questions.filter(
    (question) => responses[question._id]?.isMarkedForReview
  ).length;

  const timerDanger = remainingSeconds !== null && remainingSeconds <= 60;

  return (
    <div className="exam-attempt-layout">
      <div className="exam-sticky-header card">
        <div>
          <p className="eyebrow">Student exam</p>
          <h2>{data.exam.title}</h2>
          <p className="muted">
            Answered {answeredCount}/{data.questions.length} · Marked for review{" "}
            {markedCount}
          </p>
        </div>

        <div className={`timer-pill ${timerDanger ? "timer-danger" : ""}`}>
          Time left: {formatTime(remainingSeconds || 0)}
        </div>
      </div>

      <div className="question-status-grid card">
        {data.questions.map((question, index) => {
          const response = responses[question._id] || {};
          const isAnswered =
            (question.questionType === "multiSelect" && Array.isArray(response.selectedOptions) && response.selectedOptions.length > 0) ||
            ((question.questionType === "fillInTheBlank" || question.questionType === "oneWord") && typeof response.textAnswer === "string" && response.textAnswer.trim().length > 0) ||
            (response.selectedOption !== undefined && response.selectedOption !== null);

          const isMarked = response.isMarkedForReview;

          return (
            <a
              href={`#question-${question._id}`}
              key={question._id}
              className={`question-status-chip ${
                isAnswered ? "answered" : ""
              } ${isMarked ? "marked" : ""}`}
            >
              Q{index + 1}
            </a>
          );
        })}
      </div>

      {data.questions.map((question, index) => {
        const response = responses[question._id] || {};

        return (
          <div
            className="card question-card"
            id={`question-${question._id}`}
            key={question._id}
          >
            <div className="question-card-header">
              <h3>
                {index + 1}. {stripHtml(question.questionText)}
              </h3>

              <button
                type="button"
                className={`secondary-button ${
                  response.isMarkedForReview ? "review-active" : ""
                }`}
                onClick={() =>
                  updateResponse(question._id, {
                    isMarkedForReview: !response.isMarkedForReview,
                  })
                }
              >
                {response.isMarkedForReview
                  ? "Marked for Review"
                  : "Mark as Review"}
              </button>
            </div>

            {Array.isArray(question.options) && question.options.length > 0 && question.options.map((option, optionIndex) => (
              question.questionType === "multiSelect" ? (
                <label key={optionIndex} className="row option-row">
                  <input
                    type="checkbox"
                    name={`${question._id}-${optionIndex}`}
                    checked={Array.isArray(response.selectedOptions) && response.selectedOptions.includes(optionIndex)}
                    onChange={() => {
                      const selectedOptions = Array.isArray(response.selectedOptions) ? response.selectedOptions : [];
                      const next = selectedOptions.includes(optionIndex)
                        ? selectedOptions.filter((item) => item !== optionIndex)
                        : [...selectedOptions, optionIndex];
                      updateResponse(question._id, { selectedOptions: next });
                    }}
                  />
                  {option}
                </label>
              ) : (
                <label key={optionIndex} className="row option-row">
                  <input
                    type="radio"
                    name={question._id}
                    checked={response.selectedOption === optionIndex}
                    onChange={() =>
                      updateResponse(question._id, {
                        selectedOption: optionIndex,
                      })
                    }
                  />
                  {option}
                </label>
              )
            ))}

            {(question.questionType === "fillInTheBlank" || question.questionType === "oneWord") && (
              <label className="work-area-label">
                Answer
                <input
                  type="text"
                  value={response.textAnswer || ""}
                  placeholder="Type your answer"
                  onChange={(event) =>
                    updateResponse(question._id, {
                      textAnswer: event.target.value.trim().toLowerCase(),
                    })
                  }
                />
              </label>
            )}

            <label className="work-area-label">
              Work area / rough notes
              <textarea
                value={response.workArea || ""}
                placeholder="Use this area for rough work. It will be saved with your attempt but not evaluated."
                rows="4"
                onChange={(event) =>
                  updateResponse(question._id, {
                    workArea: event.target.value,
                  })
                }
              />
            </label>
          </div>
        );
      })}

      <div className="submit-bar card">
        <div>
          <strong>Ready to submit?</strong>
          <p className="muted">
            Your selected answers, review marks, and work area notes will be
            saved.
          </p>
        </div>

        <button onClick={() => submit(false)}>Submit Exam</button>
      </div>
    </div>
  );
}