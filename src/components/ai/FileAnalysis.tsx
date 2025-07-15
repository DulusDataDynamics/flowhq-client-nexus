
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileAnalysisProps {
  onAnalysisComplete: (analysis: any, fileName: string) => void;
}

export const FileAnalysis = ({ onAnalysisComplete }: FileAnalysisProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setAnalyzing(true);
    
    try {
      // Simulate file analysis - in a real app, you'd upload and analyze the file
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockAnalysis = {
        summary: `Analysis of ${file.name} completed successfully.`,
        keyPoints: [
          "Document contains important business information",
          "Structure is well-organized with clear sections",
          "Data appears to be current and relevant"
        ],
        recommendations: [
          "Consider implementing the proposed changes",
          "Review data accuracy periodically",
          "Share with relevant stakeholders"
        ]
      };

      onAnalysisComplete(mockAnalysis, file.name);
      setFile(null);
      
      toast({
        title: "Analysis complete",
        description: `Successfully analyzed ${file.name}`
      });
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "Failed to analyze the file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          File Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="file-upload">Select File for Analysis</Label>
          <Input
            id="file-upload"
            type="file"
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx,.txt,.csv,.xlsx"
          />
        </div>
        
        {file && (
          <div className="flex items-center gap-2 p-2 bg-muted rounded">
            <FileText className="h-4 w-4" />
            <span className="text-sm">{file.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFile(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button 
            onClick={handleAnalyze}
            disabled={!file || analyzing}
          >
            {analyzing ? 'Analyzing...' : 'Analyze File'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
