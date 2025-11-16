const MetricCard = ({ label, value, accent }) => {
  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <h3 className="text-3xl font-semibold mt-2 text-white">{value}</h3>
      {accent && <p className="text-xs text-slate-500 mt-1">{accent}</p>}
    </div>
  );
};

export default MetricCard;
