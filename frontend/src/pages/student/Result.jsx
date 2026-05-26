import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const getStoredResult = (resultKey) => {
  if (!resultKey) return null;

  try {
    const raw = sessionStorage.getItem(resultKey);
    return raw ? JSON.parse(raw) : null;
  } catch (_error) {
    return null;
  }
};

export default function Result() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const resultKey = params.get('resultKey');
  const state = location.state || getStoredResult(resultKey);

  if (!state) {
    return (
      <div className="card">
        <h3>No result found</h3>
        <p className="muted">Please complete an exam to see your result.</p>
        <Link to="/student/exams">Go to Assigned Exams</Link>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Result</h2>
      <p>Score: {state.score}</p>
      <p>Total Marks: {state.totalMarks}</p>
      <Link to="/student">Back to Dashboard</Link>
    </div>
  );
}
