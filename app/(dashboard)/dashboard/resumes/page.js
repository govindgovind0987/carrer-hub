'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  FileText,
  Upload,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Plus,
  Loader2,
  Clock,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getResumes, createResume, setDefaultResume, deleteResume } from '@/actions/resume';

export default function ResumesPage() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const loadResumes = async () => {
    const res = await getResumes();
    if (res.success) {
      setResumes(res.resumes);
    }
  };

  useEffect(() => {
    let isMounted = true;
    getResumes().then((res) => {
      if (!isMounted) return;
      if (res.success) {
        setResumes(res.resumes);
      } else {
        toast.error(res.error || 'Failed to load resumes');
      }
      setLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title || !selectedFile) {
      toast.error('Please enter a title and select a PDF file');
      return;
    }

    setUploading(true);
    try {
      // Upload file to /api/upload
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('folder', 'resumes');

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadData.url) {
        throw new Error(uploadData.error || 'Upload failed');
      }

      // Create resume entry in database
      const res = await createResume({
        title,
        fileUrl: uploadData.url,
        fileKey: uploadData.publicId,
        fileSize: selectedFile.size,
        mimeType: selectedFile.type,
      });

      if (res.success) {
        toast.success('Resume uploaded successfully!');
        setUploadOpen(false);
        setTitle('');
        setSelectedFile(null);
        loadResumes();
      } else {
        toast.error(res.error);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleMakeDefault = async (id) => {
    const res = await setDefaultResume(id);
    if (res.success) {
      toast.success('Default resume updated');
      loadResumes();
    } else {
      toast.error(res.error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;
    const res = await deleteResume(id);
    if (res.success) {
      toast.success('Resume deleted');
      loadResumes();
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Resume Management</h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Upload multiple resume versions and manage default documents for one-click job applications.
          </p>
        </div>

        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Upload className="mr-1.5 h-3.5 w-3.5" /> Upload New Resume
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-base font-semibold">Upload Resume PDF</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="res-title">Resume Title / Label</Label>
                <Input
                  id="res-title"
                  placeholder="e.g. Senior FullStack Resume 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="res-file">PDF or Word Document (Max 10MB)</Label>
                <Input
                  id="res-file"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  disabled={uploading}
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                />
              </div>

              {selectedFile && (
                <div className="text-xs text-muted-foreground bg-muted/50 p-2.5 rounded-lg flex items-center justify-between">
                  <span className="truncate font-medium">{selectedFile.name}</span>
                  <span className="shrink-0 font-mono">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                </div>
              )}

              {uploading && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Uploading file...</span>
                    <span>Processing</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-full animate-pulse bg-primary rounded-full" />
                  </div>
                </div>
              )}

              <Button type="submit" disabled={uploading} className="w-full">
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" /> Upload Resume
                  </>
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : resumes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-md bg-muted">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold text-foreground">No Resumes Uploaded</h3>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              Upload your first resume PDF to start applying to jobs seamlessly.
            </p>
            <Button onClick={() => setUploadOpen(true)} size="sm" className="mt-4">
              <Upload className="mr-1.5 h-3.5 w-3.5" /> Upload Resume
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => (
            <Card key={resume.id} className={`relative transition-all ${resume.isDefault ? 'border-primary' : ''}`}>
              {resume.isDefault && (
                <div className="absolute -top-3 left-4">
                  <Badge variant="default" className="text-[10px]">
                    Default Resume
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-3 pt-5">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-foreground shrink-0" />
                  <span className="truncate">{resume.title}</span>
                </CardTitle>
                <CardDescription className="text-[11px] flex items-center gap-1.5">
                  <Clock className="h-3 w-3" /> Updated {new Date(resume.updatedAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs text-muted-foreground bg-muted/40 p-2 rounded-md flex items-center justify-between">
                  <span>Version {resume.versions?.length || 1}</span>
                  <span>{resume.fileSize ? `${Math.round(resume.fileSize / 1024)} KB` : 'PDF'}</span>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <Button asChild variant="outline" size="sm" className="flex-1 text-xs">
                    <a href={resume.fileUrl} target="_blank" rel="noreferrer">
                      <ExternalLink className="mr-1 h-3.5 w-3.5" /> Preview PDF
                    </a>
                  </Button>

                  {!resume.isDefault && (
                    <Button variant="ghost" size="sm" onClick={() => handleMakeDefault(resume.id)} className="text-xs">
                      Set Default
                    </Button>
                  )}

                  <Button variant="ghost" size="icon" onClick={() => handleDelete(resume.id)} className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
