import { useState } from "react";
import Layout from "../components/Layout.jsx";
import api from "../services/api.js";

const NotificationsPage = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("all");
  const [status, setStatus] = useState(null);

  const handleSend = async (e) => {
    e.preventDefault();
    await api.post("/notifications/send", {
      title,
      message,
      target,
    });
    setStatus("Notification dispatched");
    setTitle("");
    setMessage("");
  };

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-6">Global Notifications</h1>
      <form
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl"
        onSubmit={handleSend}
      >
        <label className="block text-sm text-slate-400">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white"
        />
        <label className="block text-sm text-slate-400 mt-4">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white"
        />
        <label className="block text-sm text-slate-400 mt-4">Target</label>
        <select
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white"
        >
          <option value="all">All users</option>
          <option value="club_admins">Club admins</option>
          <option value="roles">Specific roles</option>
          <option value="colleges">Specific colleges</option>
        </select>
        <button
          type="submit"
          className="mt-6 px-6 py-2 rounded-lg bg-blue-600 text-white"
        >
          Send notification
        </button>
        {status && <p className="text-xs text-emerald-400 mt-3">{status}</p>}
      </form>
    </Layout>
  );
};

export default NotificationsPage;
