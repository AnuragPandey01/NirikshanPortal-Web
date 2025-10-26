import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const MetricCard = ({ title, value }) => (
  <Card className="p-4">
    <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
    <p className="text-2xl font-bold mt-2">{(value * 100).toFixed(1)}%</p>
  </Card>
);

const SystemPerformanceAnalytics = ({ data }) => {
  const { metrics, timeline } = data;

  return (
    <section className="space-y-6 mt-8">
      <h2 className="text-2xl font-bold">System Performance Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard title="Precision" value={metrics.precision} />
        <MetricCard title="Recall" value={metrics.recall} />
        <MetricCard title="F1 Score" value={metrics.f1Score} />
      </div>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Performance Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timeline}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[80, 100]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="accuracy"
              stroke="#0088FE"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </section>
  );
};

export default SystemPerformanceAnalytics;