'use client';

import React, { useEffect, useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import DashboardLayout from '@/components/DashboardLayout';
import { Icon } from '@/components/Icons';
import SiteAnalysisPDF from '@/components/SiteAnalysisPDF';
import { useRouter } from 'next/navigation';

interface AnalysisReport {
  analysis: string;
  images: {
    siteContext: string | null;
    environmental: string | null;
    designRecommendation: string | null;
  };
}

export default function ReportPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPdfReady, setIsPdfReady] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const loadingSteps = [
    { message: "Traveling to your site", icon: "/icons/travel-icon.svg" },
    { message: "Taking site photos", icon: "/icons/camera-icon.svg" },
    { message: "Taking some measurements", icon: "/icons/measure-icon.svg" },
    { message: "Finalizing recommendations", icon: "/icons/finalize-icon.svg" }
  ];

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isLoading && loadingStep < loadingSteps.length - 1) {
      // Calculate base progress for current step
      const baseProgress = (loadingStep / loadingSteps.length) * 100;
      setProgress(Math.round(baseProgress));
      
      timeout = setTimeout(() => {
        setLoadingStep(prev => prev + 1);
      }, 3000); // Change message every 3 seconds
    }
    return () => clearTimeout(timeout);
  }, [isLoading, loadingStep]);

  useEffect(() => {
    const analysisData = sessionStorage.getItem('analysisData');
    if (!analysisData) {
      setError('No analysis data found');
      setIsLoading(false);
      return;
    }

    const generateReport = async () => {
      try {
        console.log('Generating report with data:', analysisData);
        const parsedData = JSON.parse(analysisData);
        
        const response = await fetch('/api/site-analysis/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(parsedData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate report');
        }

        // Start reading the response as a stream
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let partialData = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // Update progress based on the response chunks
            partialData += decoder.decode(value, { stream: true });
            // Calculate progress including both steps and API progress
            const apiProgress = (loadingStep + 1) / loadingSteps.length * 100;
            setProgress(Math.round(apiProgress));
          }
        }

        const data = JSON.parse(partialData);
        console.log('Report generated:', data);
        setReport(data);
        setIsPdfReady(true);
        setProgress(100);
      } catch (err) {
        console.error('Error generating report:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate report');
      } finally {
        setIsLoading(false);
      }
    };

    generateReport();
  }, []);

  return (
    <DashboardLayout currentPage="Site Analysis Report">
      <div className="px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-[#1B1464]">Site Analysis Report</h1>
            {report && isPdfReady && (
              <PDFDownloadLink
                document={<SiteAnalysisPDF analysis={report.analysis} images={report.images} />}
                fileName="site-analysis-report.pdf"
                className="px-4 py-2 bg-[#844BDC] text-white rounded-lg flex items-center gap-2 hover:bg-[#6E3BBC] transition-colors"
                style={{
                  textDecoration: 'none',
                }}
              >
                {({ blob, url, loading, error: pdfError }) => {
                  if (pdfError) {
                    console.error('PDF generation error:', pdfError);
                    return (
                      <>
                        <Icon name="alert-triangle" className="w-5 h-5" />
                        Error creating PDF
                      </>
                    );
                  }
                  return (
                    <>
                      <Icon name="download" className="w-5 h-5" />
                      {loading ? 'Preparing PDF...' : 'Export as PDF'}
                    </>
                  );
                }}
              </PDFDownloadLink>
            )}
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E0DAF3]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-6">
                <div className="w-full max-w-md">
                  <div className="h-2 bg-[#E0DAF3] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#844BDC] transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm text-[#4D4D4D]">
                    <span>{progress}% complete</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[#4D4D4D]">
                  <div className="w-10 h-10 flex items-center justify-center bg-[#F6F8FA] rounded-full">
                    <img 
                      src={loadingSteps[loadingStep].icon}
                      alt=""
                      className="w-6 h-6 animate-bounce"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {loadingSteps[loadingStep].message}
                    </span>
                    <span className="text-xs text-[#6B7280]">Please wait while we process your request...</span>
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => router.push('/generate/site-analysis')}
                  className="text-[#844BDC] hover:underline flex items-center gap-2 mx-auto"
                >
                  <Icon name="arrow-left" className="w-4 h-4" />
                  Back to Site Analysis
                </button>
              </div>
            ) : report ? (
              <div className="prose max-w-none">
                {report.analysis.split('\n\n').map((paragraph, index) => {
                  // Check if it's a numbered section (e.g., "1. Executive Summary")
                  const isNumberedSection = /^\d+\.\s+[A-Z]/.test(paragraph);
                  // Check if it's a subsection
                  const isSubsection = paragraph.startsWith('•') || /^[A-Z][a-z]+:/.test(paragraph);

                  if (isNumberedSection) {
                    return (
                      <React.Fragment key={index}>
                        <h2 className="text-2xl font-bold text-[#1B1464] mt-8 mb-6 pb-2 border-b-2 border-[#E0DAF3]">
                          {paragraph}
                        </h2>
                        {/* Site Context Image */}
                        {parseInt(paragraph.split('.')[0]) === 2 && report.images.siteContext && (
                          <div className="my-6">
                            <img
                              src={report.images.siteContext}
                              alt="Site Context Analysis"
                              className="w-full rounded-lg shadow-lg"
                            />
                            <p className="text-sm text-gray-500 mt-2 text-center">
                              Site Context Analysis
                            </p>
                          </div>
                        )}
                        {/* Environmental Analysis Image */}
                        {parseInt(paragraph.split('.')[0]) === 4 && report.images.environmental && (
                          <div className="my-6">
                            <img
                              src={report.images.environmental}
                              alt="Environmental Analysis"
                              className="w-full rounded-lg shadow-lg"
                            />
                            <p className="text-sm text-gray-500 mt-2 text-center">
                              Environmental Analysis
                            </p>
                          </div>
                        )}
                        {/* Design Recommendations Image */}
                        {parseInt(paragraph.split('.')[0]) === 8 && report.images.designRecommendation && (
                          <div className="my-6">
                            <img
                              src={report.images.designRecommendation}
                              alt="Design Recommendations"
                              className="w-full rounded-lg shadow-lg"
                            />
                            <p className="text-sm text-gray-500 mt-2 text-center">
                              Design Recommendations
                            </p>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  } else if (isSubsection) {
                    return (
                      <h3 key={index} className="text-lg font-semibold text-[#2D3748] mt-6 mb-3">
                        {paragraph.replace(/^[•]\s+/, '')}
                      </h3>
                    );
                  } else {
                    return (
                      <p key={index} className="text-[#4D4D4D] text-base leading-relaxed mb-4">
                        {paragraph}
                      </p>
                    );
                  }
                })}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 