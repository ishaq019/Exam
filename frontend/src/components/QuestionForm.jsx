import React, { useEffect, useState } from "react";
import RichTextEditor from "./RichTextEditor";

const defaultForm = {
  questionText: "",
  questionType: "multipleChoice",
  options: ["", "", "", ""],
  correctOption: 0,
  correctOptions: [0],
  correctAnswer: "",
  acceptedAnswers: [""],
  marks: 1,
  explanation: "",
};

const textQuestionTypes = ["oneWord"];

const normalizeList = (list) => list.map((item) => item.trim()).filter(Boolean);

export default function QuestionForm({ onSave, editingQuestion, onCancel }) {
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (editingQuestion) {
      setForm({
        ...defaultForm,
        ...editingQuestion,
        options: editingQuestion.options?.length ? editingQuestion.options : ["", "", "", ""],
        correctOptions: editingQuestion.correctOptions?.length ? editingQuestion.correctOptions : [0],
        acceptedAnswers: editingQuestion.acceptedAnswers?.length ? editingQuestion.acceptedAnswers : [""],
      });
    } else {
      setForm(defaultForm);
    }
  }, [editingQuestion]);

  const isTextQuestion = textQuestionTypes.includes(form.questionType);
  const showChoiceOptions = form.questionType === "multipleChoice" || form.questionType === "multiSelect";

  const changeOption = (i, value) => {
    const options = [...form.options];
    options[i] = value;
    setForm({ ...form, options });
  };

  const toggleCorrectMulti = (index) => {
    const next = new Set(form.correctOptions || []);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setForm({ ...form, correctOptions: Array.from(next).sort((a, b) => a - b) });
  };

  const changeAcceptedAnswer = (i, value) => {
    const acceptedAnswers = [...form.acceptedAnswers];
    acceptedAnswers[i] = value.toLowerCase();
    setForm({ ...form, acceptedAnswers });
  };

  const addAcceptedAnswer = () => {
    setForm({ ...form, acceptedAnswers: [...form.acceptedAnswers, ""] });
  };

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      options: showChoiceOptions ? normalizeList(form.options) : undefined,
      correctOption: form.questionType === "multipleChoice" ? Number(form.correctOption) : undefined,
      correctOptions: form.questionType === "multiSelect" ? (form.correctOptions || []).map(Number) : undefined,
      correctAnswer: isTextQuestion ? form.correctAnswer.trim().toLowerCase() : undefined,
      acceptedAnswers: isTextQuestion ? normalizeList(form.acceptedAnswers.map((answer) => answer.toLowerCase())) : undefined,
    };

    await onSave(payload);

    if (!editingQuestion) {
      setForm(defaultForm);
    }
  };

  const handleCancel = () => {
    setForm(defaultForm);
    if (onCancel) onCancel();
  };

  return (
    <form className="card form-grid" onSubmit={submit}>
      <h3>{editingQuestion ? "Edit Question" : "Add New Question"}</h3>

      <label className="field-group">
        <span>Question Type</span>
        <select
          value={form.questionType}
          onChange={(e) => setForm({ ...form, questionType: e.target.value })}
        >
          <option value="multipleChoice">Multiple Choice</option>
          <option value="multiSelect">Multi Select</option>
          <option value="oneWord">One Word</option>
        </select>
      </label>

      <div className="field-group field-group-wide">
        <span>Question Text</span>
        <RichTextEditor
          value={form.questionText}
          onChange={(val) => setForm({ ...form, questionText: val })}
          placeholder="Enter the question"
        />
      </div>

      <label className="field-group">
        <span>Marks</span>
        <input
          type="number"
          value={form.marks}
          onChange={(e) => setForm({ ...form, marks: Number(e.target.value) })}
        />
      </label>

      <label className="field-group field-group-wide">
        <span>Explanation</span>
        <textarea
          rows="3"
          placeholder="Optional explanation shown after review"
          value={form.explanation}
          onChange={(e) => setForm({ ...form, explanation: e.target.value })}
        />
      </label>

      {showChoiceOptions && (
        <div className="field-group-wide">
          <span>Options</span>
          {form.options.map((opt, i) => (
            <input
              key={i}
              placeholder={`Option ${i + 1}`}
              value={opt}
              onChange={(e) => changeOption(i, e.target.value)}
            />
          ))}
        </div>
      )}

      {form.questionType === "multipleChoice" && (
        <label className="field-group">
          <span>Correct Answer</span>
          <select
            value={form.correctOption}
            onChange={(e) => setForm({ ...form, correctOption: Number(e.target.value) })}
          >
            {form.options.map((_, i) => (
              <option key={i} value={i}>
                Option {i + 1}
              </option>
            ))}
          </select>
        </label>
      )}

      {form.questionType === "multiSelect" && (
        <div className="field-group-wide">
          <span>Correct Answers</span>
          <p className="muted">Select all correct options.</p>
          {form.options.map((option, index) => (
            <label key={index} className="row">
              <input
                type="checkbox"
                checked={(form.correctOptions || []).includes(index)}
                onChange={() => toggleCorrectMulti(index)}
              />
              {option || `Option ${index + 1}`}
            </label>
          ))}
        </div>
      )}

      {isTextQuestion && (
        <div className="field-group-wide">
          <label className="field-group">
            <span>Primary Correct Answer</span>
            <input
              value={form.correctAnswer}
              placeholder="Accepted answer"
              onChange={(e) => setForm({ ...form, correctAnswer: e.target.value.toLowerCase() })}
            />
          </label>

          <div className="actions" style={{ marginTop: 8 }}>
            <span className="muted">Alternative accepted answers</span>
            <button type="button" className="secondary-button" onClick={addAcceptedAnswer}>
              Add Answer
            </button>
          </div>

          {form.acceptedAnswers.map((answer, index) => (
            <input
              key={index}
              value={answer}
              placeholder={`Accepted answer ${index + 1}`}
              onChange={(e) => changeAcceptedAnswer(index, e.target.value)}
            />
          ))}
        </div>
      )}

      <div className="actions">
        <button type="submit">
          {editingQuestion ? "Update Question" : "Add Question"}
        </button>
        {editingQuestion && (
          <button type="button" className="secondary-button" onClick={handleCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
