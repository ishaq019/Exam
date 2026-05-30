import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { buildSurveyAppUrl } from "../../utils/externalApps";
import { getAppAbsoluteUrl } from "../../utils/appUrl";

export default function CreateExam() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [form, setForm] = useState({
    title: "",
    description: "",
    duration: 30,
    startTime: "",
    endTime: "",
    surveyConfig: {
      preExamEnabled: true,
      postExamEnabled: true,
    },
  });

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data: exam } = await api.post("/exams", form);

      if (form.surveyConfig.preExamEnabled || form.surveyConfig.postExamEnabled) {
        toast.success("Exam created. Opening survey template setup.");
        window.location.href = buildSurveyAppUrl(
          `/admin/exams/${exam._id}/survey-templates?autoCreate=true&preExamEnabled=${form.surveyConfig.preExamEnabled}&postExamEnabled=${form.surveyConfig.postExamEnabled}`,
          token,
          getAppAbsoluteUrl("/admin/exams")
        );
        return;
      }

      toast.success("Exam created");
      navigate("/admin/exams");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create exam");
    }
  };

  return (
    <form className="card form form-wide" onSubmit={submit}>
      <div className="page-header">
        <div>
          <p className="eyebrow">Administration</p>
          <h2>Create Exam</h2>
          <p className="muted">Set the exam window before adding questions.</p>
        </div>
        <Link className="text-link" to="/admin/exams">Back to exams</Link>
      </div>

      <div className="form-grid">
        <label className="field-group">
          <span>Title</span>
          <input
            value={form.title}
            placeholder="Midterm Assessment"
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </label>

        <label className="field-group field-group-wide">
          <span>Description</span>
          <textarea
            value={form.description}
            placeholder="Short instructions for students"
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows="4"
          />
        </label>

        <label className="field-group">
          <span>Duration (minutes)</span>
          <input
            type="number"
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
          />
        </label>

        <label className="field-group">
          <span>Start date and time</span>
          <input
            type="datetime-local"
            value={form.startTime}
            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
          />
        </label>

        <label className="field-group">
          <span>End date and time</span>
          <input
            type="datetime-local"
            value={form.endTime}
            onChange={(e) => setForm({ ...form, endTime: e.target.value })}
          />
        </label>

        <div className="field-group field-group-wide survey-toggle-grid">
          <span>Survey setup</span>
          <label className="row survey-toggle-row">
            <input
              type="checkbox"
              checked={form.surveyConfig.preExamEnabled}
              onChange={(e) =>
                setForm({
                  ...form,
                  surveyConfig: {
                    ...form.surveyConfig,
                    preExamEnabled: e.target.checked,
                  },
                })
              }
            />
            Create pre-exam survey
          </label>

          <label className="row survey-toggle-row">
            <input
              type="checkbox"
              checked={form.surveyConfig.postExamEnabled}
              onChange={(e) =>
                setForm({
                  ...form,
                  surveyConfig: {
                    ...form.surveyConfig,
                    postExamEnabled: e.target.checked,
                  },
                })
              }
            />
            Create post-exam survey
          </label>
        </div>
      </div>

      <button type="submit">Create Exam</button>
    </form>
  );
}
