
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUploadArea } from '@/components/files/FileUploadArea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart3, FileText, TrendingUp, AlertCircle } from 'lucide-react';

interface AnalysisResult {
  summary: string;
  keyPoints: string[];
  recommendations: string[];
  dataInsights?: {
    totalRecords: number;
    categories: { name: string; count: number }[];
    trends: string[];
  };
}

interface FileAnalysisProps {
  onAnalysisComplete: (analysis: AnalysisResult, fileName: string) => void;
}

export const FileAnalysis = ({ onAnalysisComplete }: FileAnalysisProps) => {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleFilesSelected = async (files: File[]) => {
    if (!user) return;

    const file = files[0];
    if (!file) return;

    setUploading(true);
    try {
      // Upload file to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('user-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Analyze the file
      setAnalyzing(true);
      const analysisResult = await analyzeFile(file);
      
      onAnalysisComplete(analysisResult, file.name);
      
      toast({
        title: "File analyzed successfully",
        description: `Analysis complete for ${file.name}`
      });

    } catch (error) {
      console.error('Error uploading/analyzing file:', error);
      toast({
        title: "Error",
        description: "Failed to analyze file",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const analyzeFile = async (file: File): Promise<AnalysisResult> => {
    // Mock analysis - in a real app, this would call an AI service
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    if (fileType.includes('csv') || fileName.includes('excel') || fileType.includes('spreadsheet')) {
      return {
        summary: "This spreadsheet contains structured data with multiple columns and rows. The data appears to be well-organized with clear headers and consistent formatting.",
        keyPoints: [
          "Contains 1,250 rows of data",
          "15 columns with mixed data types",
          "No missing critical values detected",
          "Data spans from 2023 to 2024"
        ],
        recommendations: [
          "Consider creating pivot tables for better data visualization",
          "Add data validation rules for future entries",
          "Implement regular backup procedures"
        ],
        dataInsights: {
          totalRecords: 1250,
          categories: [
            { name: "Sales", count: 450 },
            { name: "Marketing", count: 320 },
            { name: "Support", count: 280 },
            { name: "Operations", count: 200 }
          ],
          trends: [
            "Sales data shows 23% increase over last quarter",
            "Support tickets decreased by 15%",
            "Marketing leads conversion improved by 8%"
          ]
        }
      };
    } else if (fileType.includes('pdf') || fileType.includes('document')) {
      return {
        summary: "This document contains detailed text content with structured sections. The writing style is professional and the content appears to be business-related.",
        keyPoints: [
          "Document contains 2,340 words",
          "15 pages with 8 sections",
          "Professional business language detected",
          "Contains charts and tables"
        ],
        recommendations: [
          "Consider creating an executive summary",
          "Add table of contents for better navigation",
          "Include more visual elements for engagement"
        ]
      };
    } else {
      return {
        summary: "File uploaded successfully. This appears to be a media or binary file that would benefit from specialized analysis tools.",
        keyPoints: [
          `File size: ${(file.size / 1024 / 1024).toFixed(2)} MB`,
          `File type: ${file.type || 'Unknown'}`,
          "Binary content detected"
        ],
        recommendations: [
          "Use appropriate software for this file type",
          "Consider file compression if size is large",
          "Ensure proper backup and version control"
        ]
      };
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          File Analysis
        </CardTitle>
        <CardDescription>
          Upload files for AI-powered analysis and insights
        </CardDescription>
      </CardHeader>
      <CardContent>
        {analyzing ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Analyzing your file...</p>
          </div>
        ) : (
          <FileUploadArea 
            onFilesSelected={handleFilesSelected}
            uploading={uploading}
          />
        )}
      </CardContent>
    </Card>
  );
};
