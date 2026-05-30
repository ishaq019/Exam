import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import Loader from "../../components/Loader";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { buildSurveyAppUrl } from "../../utils/externalApps";
<<<<<<< HEAD
import { getAppAbsoluteUrl } from "../../utils/appUrl";
=======
import { buildAppUrl } from "../../utils/appPaths";
>>>>>>> 1f0654a052122a3098ced2a5273f94eeceb25b52

export default function AssignedExams() {
  const { token, user } = useContext(AuthContext);
  const [exams, setExams] = useState(null);

  useEffect(() => {
    if (!token) return;
    api
      .get("/student/exams")
      .then((res) => setExams(Array.isArray(res.data) ? res.data : []))
      .catch((error) => {
        toast.error(error.response?.data?.message || "Failed to load assigned exams");
        setExams([]);
      });
  }, [token]);

  if (exams === null) return <Loader />;

  return (
    <div className="form-wide">
      <div className="page-header">
        <div>
          <p className="eyebrow">Student Portal</p>
          <h2>Assigned Exams</h2>
          <p className="muted">
            View exams assigned to you and start the exam process.
          </p>
        </div>
      </div>

      {exams.length ? (
        <div className="grid">
          {exams.map((exam) => {
            const examId = exam._id || exam.examId;

            return (
              <div className="card" key={examId}>
                <h3>{exam.title}</h3>

                <p className="muted">
                  {exam.description || "No description available"}
                </p>

                <p>
                  <strong>Duration:</strong> {exam.duration} minutes
                </p>

                {exam.maxAttempts ? (
                  <p className="muted">
                    Attempts: {exam.attemptsUsed || 0} / {exam.maxAttempts} &middot;
                    Remaining: {exam.remainingAttempts ?? 0}
                  </p>
                ) : null}

                {(exam.remainingAttempts ?? 1) > 0 ? (
                  exam.surveyConfig?.preExamEnabled ? (
                    <a
                      className="button-link"
                      href={buildSurveyAppUrl(
                        `/student/exams/${examId}/before-survey`,
<<<<<<< HEAD
                        token,
                        getAppAbsoluteUrl(`/student/exams/${examId}/attempt`)
=======
                        buildAppUrl(`/student/exams/${examId}/attempt`),
                        user?._id || user?.id
>>>>>>> 1f0654a052122a3098ced2a5273f94eeceb25b52
                      )}
                    >
                      {(exam.attemptsUsed || 0) > 0 ? "Retake Exam" : "Start Exam"}
                    </a>
                  ) : (
                    <Link className="button-link" to={`/student/exams/${examId}/attempt`}>
                      {(exam.attemptsUsed || 0) > 0 ? "Retake Exam" : "Start Exam"}
                    </Link>
                  )
                ) : (
                  <button className="button-link" disabled style={{ opacity: 0.5, cursor: "not-allowed" }}>
                    No Attempts Remaining
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card">
          <p className="muted">No exams assigned yet.</p>
        </div>
      )}
    </div>
  );
}