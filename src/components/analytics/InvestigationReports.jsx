import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const InvestigationReports = ({ data }) => {
  const handleExport = (format) => {
    // TODO: Implement export functionality
    console.log(`Exporting as ${format}`);
  };

  return (
    <section className="space-y-6 mt-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Investigation Reports</h2>
        <div className="space-x-2">
          <Button onClick={() => handleExport("pdf")}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport("csv")}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Video Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Suspects Detected
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Detections
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg. Confidence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((report) => (
                <tr key={report.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {report.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {report.videoName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {report.suspectsDetected}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {report.totalDetections}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {report.averageConfidence}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {report.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
};

export default InvestigationReports;