import { Card } from "@/components/ui/card";
import {
  Video,
  Users,
  CheckCircle,
  Clock,
  BarChart2,
} from "lucide-react";

const MetricCard = ({ icon: Icon, title, value, suffix = "" }) => (
  <Card className="p-4">
    <div className="flex items-start justify-between">
      <div className="flex items-center">
        <div className="p-2 rounded-full bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </div>
    <h3 className="mt-4 text-2xl font-semibold">{value}{suffix}</h3>
    <p className="text-sm text-muted-foreground">{title}</p>
  </Card>
);

const SummarySection = ({ data }) => {
  const metrics = [
    {
      icon: Video,
      title: "Total Videos Analyzed",
      value: data.totalVideos,
    },
    {
      icon: Users,
      title: "Total Suspects",
      value: data.totalSuspects,
    },
    {
      icon: CheckCircle,
      title: "Matches Found",
      value: data.matchesFound,
    },
    {
      icon: Clock,
      title: "Pending Reviews",
      value: data.pendingReviews,
    },
    {
      icon: BarChart2,
      title: "Average Accuracy",
      value: data.averageAccuracy,
      suffix: "%",
    },
  ];

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Summary Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>
    </section>
  );
};

export default SummarySection;