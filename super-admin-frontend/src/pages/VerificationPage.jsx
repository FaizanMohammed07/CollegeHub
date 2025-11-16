import { useEffect, useState } from "react";
import Layout from "../components/Layout.jsx";
import { verificationAPI } from "../services/api.js";

const VerificationPage = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    verificationAPI.list().then((res) => setRequests(res.data.data));
  }, []);

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-6">Club Admin Verification</h1>
      <div className="space-y-4">
        {requests.map((req) => (
          <div
            key={req._id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4"
          >
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-slate-400">{req.collegeId?.name}</p>
                <h3 className="text-lg font-semibold">{req.clubName}</h3>
                <p className="text-xs text-slate-500">
                  Requested by {req.userId?.name}
                </p>
              </div>
              <span className="text-xs text-yellow-300">Pending</span>
            </div>
            {req.description && (
              <p className="text-sm text-slate-300 mt-3">{req.description}</p>
            )}
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default VerificationPage;
