import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChevronDown, ChevronUp } from "lucide-react";

const SuspectAnalytics = ({ data }) => {
  const [selectedSuspect, setSelectedSuspect] = useState(null);
  const [expandedSuspect, setExpandedSuspect] = useState(null);

  const toggleSuspect = (suspectId) => {
    if (expandedSuspect === suspectId) {
      setExpandedSuspect(null);
    } else {
      setExpandedSuspect(suspectId);
      setSelectedSuspect(data.find((s) => s.id === suspectId));
    }
  };

  return (
    <section className="space-y-6 mt-8">
      <h2 className="text-2xl font-bold">Suspect-based Analytics</h2>
      <div className="space-y-4">
        {data.map((suspect) => (
          <Card key={suspect.id} className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">{suspect.name}</h3>
                <p className="text-sm text-muted-foreground">{suspect.id}</p>
              </div>
              <Button
                variant="ghost"
                onClick={() => toggleSuspect(suspect.id)}
              >
                {expandedSuspect === suspect.id ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>

            {expandedSuspect === suspect.id && (
              <div className="mt-4 space-y-6">
                <div>
                  <h4 className="text-md font-semibold mb-4">Confidence Trend</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={suspect.appearances}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="timestamp"
                        tickFormatter={(value) =>
                          new Date(value).toLocaleTimeString()
                        }
                      />
                      <YAxis domain={[0, 100]} />
                      <Tooltip
                        labelFormatter={(value) =>
                          new Date(value).toLocaleString()
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="confidence"
                        stroke="#0088FE"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h4 className="text-md font-semibold mb-4">Detections</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Video
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Frame
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Confidence
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Timestamp
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {suspect.appearances.map((appearance, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">
                              {appearance.videoName}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">
                              {appearance.frameNumber}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">
                              {appearance.confidence}%
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">
                              {new Date(
                                appearance.timestamp
                              ).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
};

export default SuspectAnalytics;