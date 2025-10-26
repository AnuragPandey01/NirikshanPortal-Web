// Mock data for analytics components
export const mockSummaryData = {
  totalVideos: 1247,
  totalSuspects: 523,
  matchesFound: 892,
  pendingReviews: 45,
  averageAccuracy: 87.5,
};

export const mockDetectionData = {
  suspectDetections: [
    { name: "Suspect A", detections: 45 },
    { name: "Suspect B", detections: 38 },
    { name: "Suspect C", detections: 32 },
    { name: "Suspect D", detections: 28 },
    { name: "Suspect E", detections: 25 },
    { name: "Suspect F", detections: 22 },
    { name: "Suspect G", detections: 18 },
    { name: "Suspect H", detections: 15 },
    { name: "Suspect I", detections: 12 },
    { name: "Suspect J", detections: 10 },
  ],
  timelineData: Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
    detections: Math.floor(Math.random() * 50) + 10,
  })).reverse(),
  caseTypes: [
    { type: "Missing", value: 45 },
    { type: "Criminal", value: 35 },
    { type: "Unknown", value: 20 },
  ],
};

export const mockVideoData = Array.from({ length: 10 }, (_, i) => ({
  id: `VID${String(i + 1).padStart(3, '0')}`,
  name: `Surveillance_${i + 1}.mp4`,
  processingTime: `${Math.floor(Math.random() * 120) + 30}s`,
  accuracy: Math.floor(Math.random() * 20) + 80,
  framesAnalyzed: Math.floor(Math.random() * 5000) + 1000,
  status: Math.random() > 0.2 ? "Completed" : "Failed",
}));

export const mockSuspectData = Array.from({ length: 5 }, (_, i) => ({
  id: `SUSP${String(i + 1).padStart(3, '0')}`,
  name: `Suspect ${i + 1}`,
  appearances: Array.from({ length: 5 }, (_, j) => ({
    timestamp: new Date(Date.now() - (j * 2 * 60 * 60 * 1000)).toISOString(),
    confidence: Math.floor(Math.random() * 20) + 80,
    videoName: `Camera_${Math.floor(Math.random() * 5) + 1}.mp4`,
    frameNumber: Math.floor(Math.random() * 1000) + 1,
  })),
}));

export const mockPerformanceData = {
  metrics: {
    precision: 0.89,
    recall: 0.85,
    f1Score: 0.87,
  },
  timeline: Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
    accuracy: Math.floor(Math.random() * 10) + 85,
  })).reverse(),
};

export const mockInvestigationData = Array.from({ length: 8 }, (_, i) => ({
  id: `INV${String(i + 1).padStart(3, '0')}`,
  videoName: `Surveillance_${i + 1}.mp4`,
  suspectsDetected: Math.floor(Math.random() * 5) + 1,
  totalDetections: Math.floor(Math.random() * 20) + 5,
  averageConfidence: Math.floor(Math.random() * 15) + 85,
  date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
}));