import { useEffect, useState } from "react";
import Layout from "../components/Layout.jsx";
import { eventAPI } from "../services/api.js";

const filters = ["live", "upcoming", "trending", "cancelled", "flagged"];

const EventsPage = () => {
  const [filter, setFilter] = useState("live");
  const [events, setEvents] = useState([]);

  useEffect(() => {
    eventAPI.list(filter).then((res) => setEvents(res.data.data));
  }, [filter]);

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Events</h1>
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm ${
                filter === f
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-300"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-4">
        {events.map((event) => (
          <div
            key={event._id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5"
          >
            <div className="flex justify-between">
              <div>
                <p className="text-xs text-slate-500">
                  {event.collegeId?.name}
                </p>
                <h3 className="text-xl font-semibold">{event.title}</h3>
                <p className="text-sm text-slate-400">
                  {new Date(event.startAt).toLocaleString()}
                </p>
              </div>
              <span className="text-xs text-slate-400">{event.status}</span>
            </div>
            <p className="text-sm text-slate-300 mt-3 line-clamp-2">
              {event.description}
            </p>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default EventsPage;
