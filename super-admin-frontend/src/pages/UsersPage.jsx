import { useEffect, useState } from "react";
import Layout from "../components/Layout.jsx";
import { userAPI } from "../services/api.js";

const UsersPage = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    userAPI.list().then((res) => setUsers(res.data.data));
  }, []);

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-6">Users</h1>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-400 border-b border-slate-800">
            <th className="py-2">Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>College</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="border-b border-slate-900">
              <td className="py-3">{user.name}</td>
              <td>{user.email}</td>
              <td className="capitalize">{user.role.replace("_", " ")}</td>
              <td>{user.collegeId?.name}</td>
              <td>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    user.blocked
                      ? "bg-red-500/20 text-red-300"
                      : "bg-green-500/20 text-green-300"
                  }`}
                >
                  {user.blocked ? "Banned" : "Active"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
};

export default UsersPage;
