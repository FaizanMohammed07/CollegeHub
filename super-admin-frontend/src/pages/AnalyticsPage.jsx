import { useEffect, useState } from "react";
import Layout from "../components/Layout.jsx";
import { analyticsAPI } from "../services/api.js";

const AnalyticsPage = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    analyticsAPI.platform().then((res) => setData(res.data.data));
  }, []);

  if (!data) {
    return (
      <Layout>
        <p>Loading analytics...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-6">Platform Analytics</h1>
      <section>
        <h2 className="text-lg mb-2">Events hosted per day</h2>
        <div className="flex gap-2">
          {data.eventsPerDay.map((entry) => (
            <div
              key={entry._id}
              className="bg-slate-900 border border-slate-800 rounded-lg p-3"
            >
              <p className="text-xs text-slate-400">{entry._id}</p>
              <p className="text-lg font-semibold">{entry.events}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="mt-8">
        <h2 className="text-lg mb-2">Most active clubs</h2>
        <ul className="space-y-2 text-sm">
          {data.mostActiveClubs.map((club) => (
            <li
              key={club.clubId}
              className="flex justify-between bg-slate-900 border border-slate-800 rounded-lg px-4 py-2"
            >
              <span>{club.name}</span>
              <span>{club.attendees} attendees</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400">Daily Active Users</p>
          <p className="text-3xl font-semibold">{data.users.dau}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400">Weekly Active Users</p>
          <p className="text-3xl font-semibold">{data.users.wau}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400">Monthly Active Users</p>
          <p className="text-3xl font-semibold">{data.users.mau}</p>
        </div>
      </section>
    </Layout>
  );
};

export default AnalyticsPage;
