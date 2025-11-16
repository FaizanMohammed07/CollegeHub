import { useEffect, useState } from "react";
import Layout from "../components/Layout.jsx";
import { reportAPI } from "../services/api.js";

const ReportsPage = () => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    reportAPI.list().then((res) => setReports(res.data.data));
  }, []);

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-6">Reports & Flagged Content</h1>
      <div className="space-y-3">
        {reports.map((report) => (
          <div
            key={report._id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4"
          >
            <div className="flex justify-between text-sm text-slate-400">
              <span>{report.targetType}</span>
              <span>{report.status}</span>
            </div>
            <p className="text-sm text-slate-300 mt-2">{report.description}</p>
            <p className="text-xs text-slate-500 mt-1">
              Reporter: {report.reporterId?.email}
            </p>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default ReportsPage;
