import { useEffect, useState } from "react";
import Layout from "../components/Layout.jsx";
import { clubAPI } from "../services/api.js";

const ClubsPage = () => {
  const [clubs, setClubs] = useState([]);

  useEffect(() => {
    clubAPI.list().then((res) => setClubs(res.data.data));
  }, []);

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-6">Clubs</h1>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-400 border-b border-slate-800">
            <th className="py-2">Club</th>
            <th>College</th>
            <th>Category</th>
            <th>Members</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {clubs.map((club) => (
            <tr key={club._id} className="border-b border-slate-900">
              <td className="py-3">{club.name}</td>
              <td>{club.collegeId?.name}</td>
              <td>{club.category || "—"}</td>
              <td>{club.membersCount}</td>
              <td>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    club.verified
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-yellow-500/20 text-yellow-300"
                  }`}
                >
                  {club.verified ? "Verified" : "Pending"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
};

export default ClubsPage;
