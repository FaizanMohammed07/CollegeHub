import { useEffect, useState } from "react";
import Layout from "../components/Layout.jsx";
import { collegeAPI } from "../services/api.js";

const CollegesPage = () => {
  const [colleges, setColleges] = useState([]);

  useEffect(() => {
    collegeAPI.list().then((res) => setColleges(res.data.data));
  }, []);

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Colleges</h1>
          <p className="text-sm text-slate-400">
            Manage every campus on the network.
          </p>
        </div>
      </div>
      <div className="grid gap-4">
        {colleges.map((college) => (
          <div
            key={college._id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">{college.name}</h2>
                <p className="text-xs text-slate-400">{college.address}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs ${
                  college.policy?.status === "disabled"
                    ? "bg-red-500/20 text-red-300"
                    : "bg-green-500/20 text-green-300"
                }`}
              >
                {college.policy?.status || "active"}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
              <Metric label="Students" value={college.metrics.students} />
              <Metric
                label="Active events"
                value={college.metrics.activeEvents}
              />
              <Metric label="Clubs" value={college.metrics.clubs} />
              <Metric
                label="Pending verifications"
                value={college.metrics.pendingVerifications}
              />
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
};

const Metric = ({ label, value }) => (
  <div>
    <p className="text-xs uppercase text-slate-500">{label}</p>
    <p className="text-lg font-semibold">{value}</p>
  </div>
);

export default CollegesPage;
