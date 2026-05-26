import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";
import AppLogo from "../../components/AppLogo";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", form);
      toast.success("Registered successfully");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Register failed");
    }
  };

  return (
    <div className="auth-page">
      <form className="card form auth-form" onSubmit={submit}>
        <div className="form-heading">
          <div className="auth-logo-wrap">
            <AppLogo size={52} />
          </div>
          <p className="eyebrow">Create account</p>
          <h2>Register</h2>
          <p className="muted">Choose the account type that fits your role.</p>
        </div>

        <label className="field-group">
          <span>Name</span>
          <input
            value={form.name}
            placeholder="Your full name"
            autoComplete="name"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>

        <label className="field-group">
          <span>Email</span>
          <input
            value={form.email}
            placeholder="name@example.com"
            autoComplete="email"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>

        <label className="field-group">
          <span>Password</span>
          <input
            value={form.password}
            placeholder="Create a password"
            type="password"
            autoComplete="new-password"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </label>

        <label className="field-group">
          <span>Role</span>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
        </label>

        <button>Register</button>

        <p className="auth-footer">
          Already have account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}
