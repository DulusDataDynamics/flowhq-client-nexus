
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Upload, 
  Search, 
  Filter,
  Download,
  FileText,
  Image,
  File,
  Trash2,
  Eye,
  Edit
} from 'lucide-react';

interface FileItem {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  ai_processed: boolean;
  created_at: string;
  file_path: string;
}

export const FilesPage = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FileItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [storageUsed, setStorageUsed] = useState(0);
  const [storageLimit] = useState(1024);
  const [isDragOver, setIsDragOver] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renamingFile, setRenamingFile] = useState<FileItem | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadFiles();
  }, []);

  useEffect(() => {
    const filtered = files.filter(file =>
      file.filename.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFiles(filtered);
  }, [files, searchTerm]);

  // Auto-dismiss toast messages after 5 seconds
  const showToast = useCallback((title: string, description: string, variant?: "default" | "destructive") => {
    toast({
      title,
      description,
      variant,
      duration: 5000
    });
  }, [toast]);

  const loadFiles = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setFiles(data || []);
      
      const totalSize = data?.reduce((sum, file) => sum + (file.file_size || 0), 0) || 0;
      setStorageUsed(Math.round(totalSize / (1024 * 1024)));
    } catch (error) {
      console.error('Error loading files:', error);
      showToast("Error", "Failed to load files", "destructive");
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    uploadFiles(files);
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;
    
    const filesArray = Array.from(selectedFiles);
    uploadFiles(filesArray);
    event.target.value = '';
  };

  const uploadFiles = async (filesArray: File[]) => {
    if (!user) return;

    setUploading(true);

    try {
      for (const file of filesArray) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${file.name}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('user-files')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { error: dbError } = await supabase
          .from('files')
          .insert({
            user_id: user.id,
            filename: file.name,
            file_path: fileName,
            file_type: file.type,
            file_size: file.size
          });

        if (dbError) throw dbError;
      }

      showToast("Success", `${filesArray.length} file(s) uploaded successfully`);
      loadFiles();
    } catch (error) {
      console.error('Error uploading files:', error);
      showToast("Error", "Failed to upload files", "destructive");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string, filePath: string) => {
    try {
      const { error: storageError } = await supabase.storage
        .from('user-files')
        .remove([filePath]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;

      showToast("Success", "File deleted successfully");
      loadFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      showToast("Error", "Failed to delete file", "destructive");
    }
  };

  const handleDownloadFile = async (file: FileItem) => {
    try {
      const { data, error } = await supabase.storage
        .from('user-files')
        .download(file.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast("Success", "File downloaded successfully");
    } catch (error) {
      console.error('Error downloading file:', error);
      showToast("Error", "Failed to download file", "destructive");
    }
  };

  const handleViewFile = async (file: FileItem) => {
    try {
      const { data, error } = await supabase.storage
        .from('user-files')
        .createSignedUrl(file.file_path, 60);

      if (error) throw error;

      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error('Error viewing file:', error);
      showToast("Error", "Failed to view file", "destructive");
    }
  };

  const handleRenameFile = async () => {
    if (!renamingFile || !newFileName) return;

    try {
      const { error } = await supabase
        .from('files')
        .update({ filename: newFileName })
        .eq('id', renamingFile.id);

      if (error) throw error;

      showToast("Success", "File renamed successfully");
      setRenameDialogOpen(false);
      setRenamingFile(null);
      setNewFileName('');
      loadFiles();
    } catch (error) {
      console.error('Error renaming file:', error);
      showToast("Error", "Failed to rename file", "destructive");
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-5 w-5" />;
    if (fileType.includes('pdf') || fileType.includes('document')) return <FileText className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Files</h2>
          <p className="text-muted-foreground">
            Manage and share files with drag & drop support
          </p>
        </div>
        <div className="flex space-x-2">
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <Button 
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={uploading}
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? 'Uploading...' : 'Upload File'}
          </Button>
        </div>
      </div>

      {/* Drag and Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-4 text-lg font-semibold">
          {isDragOver ? 'Drop files here' : 'Drag and drop files here'}
        </p>
        <p className="text-gray-500">
          or click the upload button above. Supports all file types.
        </p>
      </div>

      {/* Storage Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Storage Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Used</span>
              <span>{storageUsed} MB of {storageLimit} MB</span>
            </div>
            <Progress value={(storageUsed / storageLimit) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredFiles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <File className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No files uploaded yet</h3>
            <p className="text-gray-500 text-center mb-4">
              Upload your first file to start sharing with clients
            </p>
            <Button onClick={() => document.getElementById('file-upload')?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Upload File
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredFiles.map((file) => (
            <Card key={file.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(file.file_type)}
                    <div>
                      <h4 className="font-medium">{file.filename}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{formatFileSize(file.file_size)}</span>
                        <span>•</span>
                        <span>{new Date(file.created_at).toLocaleDateString()}</span>
                        {file.ai_processed && (
                          <>
                            <span>•</span>
                            <Badge variant="secondary">AI Processed</Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewFile(file)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDownloadFile(file)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setRenamingFile(file);
                        setNewFileName(file.filename);
                        setRenameDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteFile(file.id, file.file_path)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
            <DialogDescription>
              Enter a new name for the file.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-filename">New filename</Label>
              <Input
                id="new-filename"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="Enter new filename"
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleRenameFile} className="flex-1">
                Rename
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setRenameDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
