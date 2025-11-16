import { useEffect, useState } from "react";
import Layout from "../components/Layout.jsx";
import MetricCard from "../components/MetricCard.jsx";
import { dashboardAPI } from "../services/api.js";

const DashboardPage = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    dashboardAPI.overview().then((res) => setData(res.data.data));
  }, []);

  if (!data) {
    return (
      <Layout>
        <p>Loading overview...</p>
      </Layout>
    );
  }

  const cards = [
    { label: "Total Colleges", value: data.cards.totalColleges },
    { label: "Total Clubs", value: data.cards.totalClubs },
    { label: "Verified Clubs", value: data.cards.verifiedClubs },
    {
      label: "Pending Club Admin Requests",
      value: data.cards.pendingClubAdminRequests,
    },
    { label: "Total Events", value: data.cards.totalEvents },
    { label: "Live Events", value: data.cards.liveEvents },
    { label: "Total Users", value: data.cards.totalUsers },
    { label: "Daily Active Users", value: data.cards.dailyActiveUsers },
    { label: "Reports Pending", value: data.cards.pendingReports },
  ];

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-6">Global Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card) => (
          <MetricCard key={card.label} label={card.label} value={card.value} />
        ))}
      </div>
      <section className="mt-10">
        <h2 className="text-xl mb-4">Events per day (last 2 weeks)</h2>
        <div className="flex gap-2 overflow-x-auto">
          {data.charts.eventsPerDay.map((item) => (
            <div
              key={item._id}
              className="bg-slate-900 border border-slate-800 rounded-lg p-3"
            >
              <p className="text-xs text-slate-400">{item._id}</p>
              <p className="text-lg font-semibold">{item.count}</p>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default DashboardPage;
