import {
  mockSummaryData,
  mockDetectionData,
  mockVideoData,
  mockSuspectData,
  mockPerformanceData,
  mockInvestigationData,
} from "../analytics/mockData";
import SummarySection from "../analytics/SummarySection";
import DetectionAnalytics from "../analytics/DetectionAnalytics";
import VideoProcessingAnalytics from "../analytics/VideoProcessingAnalytics";
import SuspectAnalytics from "../analytics/SuspectAnalytics";
import SystemPerformanceAnalytics from "../analytics/SystemPerformanceAnalytics";
import InvestigationReports from "../analytics/InvestigationReports";

const AnalyticsItem = () => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>
      
      <SummarySection data={mockSummaryData} />
      <DetectionAnalytics data={mockDetectionData} />
      <VideoProcessingAnalytics data={mockVideoData} />
      <SuspectAnalytics data={mockSuspectData} />
      <SystemPerformanceAnalytics data={mockPerformanceData} />
      <InvestigationReports data={mockInvestigationData} />
    </div>
  );
};

export default AnalyticsItem;
