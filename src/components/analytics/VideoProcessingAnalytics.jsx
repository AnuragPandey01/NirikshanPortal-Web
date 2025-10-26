import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const VideoProcessingAnalytics = ({ data }) => {
  return (
    <section className="space-y-6 mt-8">
      <h2 className="text-2xl font-bold">Video Processing Analytics</h2>
      <Card className="p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Video ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Processing Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Accuracy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Frames
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((video) => (
                <tr key={video.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {video.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {video.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {video.processingTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {video.accuracy}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {video.framesAnalyzed.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        video.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {video.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Video Processing Accuracy</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="id" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Bar
              dataKey="accuracy"
              fill="#0088FE"
              label={{ position: "top" }}
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </section>
  );
};

export default VideoProcessingAnalytics;