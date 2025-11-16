import { useEffect, useState } from "react";
import Layout from "../components/Layout.jsx";
import { settingsAPI } from "../services/api.js";

const SettingsPage = () => {
  const [settings, setSettings] = useState([]);

  useEffect(() => {
    settingsAPI.list().then((res) => setSettings(res.data.data));
  }, []);

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-6">Platform Settings</h1>
      <div className="grid gap-4">
        {settings.map((setting) => (
          <div
            key={setting._id}
            className="bg-slate-900 border border-slate-800 rounded-lg p-4"
          >
            <p className="text-xs uppercase text-slate-400">
              {setting.category}
            </p>
            <h3 className="text-lg font-semibold">{setting.key}</h3>
            <p className="text-sm text-slate-300">
              {JSON.stringify(setting.value)}
            </p>
            {setting.description && (
              <p className="text-xs text-slate-500 mt-2">
                {setting.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default SettingsPage;
