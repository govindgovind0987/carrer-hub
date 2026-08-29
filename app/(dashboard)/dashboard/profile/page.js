'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  User,
  GraduationCap,
  Briefcase,
  Wrench,
  FolderGit2,
  Globe,
  Plus,
  Trash2,
  Loader2,
  Save,
} from 'lucide-react';
import { FaGithub } from '@/components/shared/social-icons';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  getProfile,
  updatePersonalInfo,
  updateUserAvatar,
  addEducation,
  deleteEducation,
  addExperience,
  deleteExperience,
  addSkill,
  deleteSkill,
  addProject,
  deleteProject,
} from '@/actions/profile';
import { Camera } from 'lucide-react';

import { personalInfoSchema, educationSchema, experienceSchema, skillSchema, projectSchema } from '@/schemas/profile';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState({ edu: false, exp: false, skill: false, proj: false });

  const loadProfile = async () => {
    const res = await getProfile();
    if (res.success) {
      setProfile(res.profile);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (JPG, PNG, WEBP, GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size cannot exceed 5MB');
      return;
    }

    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'avatars');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!data.url) throw new Error(data.error || 'Upload failed');

      const updateRes = await updateUserAvatar(data.url);
      if (updateRes.success) {
        toast.success('Avatar updated successfully!');
        loadProfile();
      } else {
        toast.error(updateRes.error);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to upload avatar');
    } finally {
      setAvatarUploading(false);
    }
  };


  useEffect(() => {
    let isMounted = true;
    getProfile().then((res) => {
      if (!isMounted) return;
      if (res.success) {
        setProfile(res.profile);
      } else {
        toast.error(res.error || 'Failed to load profile');
      }
      setLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Form for Personal Info
  const {
    register: regPersonal,
    handleSubmit: handlePersonalSubmit,
    reset: resetPersonal,
    formState: { errors: errorsPersonal },
  } = useForm({
    resolver: zodResolver(personalInfoSchema),
  });

  useEffect(() => {
    if (profile) {
      resetPersonal({
        name: profile.user?.name || '',
        headline: profile.headline || '',
        bio: profile.bio || '',
        phone: profile.phone || '',
        location: profile.location || '',
        website: profile.website || '',
        linkedinUrl: profile.linkedinUrl || '',
        githubUrl: profile.githubUrl || '',
      });
    }
  }, [profile, resetPersonal]);

  const onPersonalSubmit = async (data) => {
    setSaving(true);
    const res = await updatePersonalInfo(data);
    if (res.success) {
      toast.success('Personal information updated');
      loadProfile();
    } else {
      toast.error(res.error || 'Failed to update info');
    }
    setSaving(false);
  };

  // Education form
  const { register: regEdu, handleSubmit: handleEduSubmit, reset: resetEdu } = useForm({
    resolver: zodResolver(educationSchema),
  });
  const onEduSubmit = async (data) => {
    const res = await addEducation(data);
    if (res.success) {
      toast.success('Education added');
      setDialogOpen((prev) => ({ ...prev, edu: false }));
      resetEdu();
      loadProfile();
    } else {
      toast.error(res.error);
    }
  };

  // Experience form
  const { register: regExp, handleSubmit: handleExpSubmit, reset: resetExp } = useForm({
    resolver: zodResolver(experienceSchema),
  });
  const onExpSubmit = async (data) => {
    const res = await addExperience(data);
    if (res.success) {
      toast.success('Experience added');
      setDialogOpen((prev) => ({ ...prev, exp: false }));
      resetExp();
      loadProfile();
    } else {
      toast.error(res.error);
    }
  };

  // Skill form
  const { register: regSkill, handleSubmit: handleSkillSubmit, reset: resetSkill } = useForm({
    resolver: zodResolver(skillSchema),
  });
  const onSkillSubmit = async (data) => {
    const res = await addSkill(data);
    if (res.success) {
      toast.success('Skill added');
      setDialogOpen((prev) => ({ ...prev, skill: false }));
      resetSkill();
      loadProfile();
    } else {
      toast.error(res.error);
    }
  };

  // Project form
  const { register: regProj, handleSubmit: handleProjSubmit, reset: resetProj } = useForm({
    resolver: zodResolver(projectSchema),
  });
  const onProjSubmit = async (data) => {
    const res = await addProject(data);
    if (res.success) {
      toast.success('Project added');
      setDialogOpen((prev) => ({ ...prev, proj: false }));
      resetProj();
      loadProfile();
    } else {
      toast.error(res.error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Candidate Profile</h1>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Manage your personal details, career history, education, skills, and portfolio links.
        </p>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-card p-1 border border-border">
          <TabsTrigger value="personal" className="flex items-center gap-1.5 text-xs">
            <User className="h-3.5 w-3.5" /> Personal
          </TabsTrigger>
          <TabsTrigger value="experience" className="flex items-center gap-1.5 text-xs">
            <Briefcase className="h-3.5 w-3.5" /> Experience
          </TabsTrigger>
          <TabsTrigger value="education" className="flex items-center gap-1.5 text-xs">
            <GraduationCap className="h-3.5 w-3.5" /> Education
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-1.5 text-xs">
            <Wrench className="h-3.5 w-3.5" /> Skills
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-1.5 text-xs">
            <FolderGit2 className="h-3.5 w-3.5" /> Projects
          </TabsTrigger>
        </TabsList>

        {/* Personal Info Tab */}
        <TabsContent value="personal" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Personal Details & Links</CardTitle>
              <CardDescription className="text-xs">Update your contact info and social media profile links.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Profile Avatar Upload Widget */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-lg bg-muted/40 border border-border mb-6">
                <div className="relative group">
                  <Avatar className="h-20 w-20 border-2 border-border shadow-xs">
                    <AvatarImage src={profile?.user?.image} alt={profile?.user?.name || 'Avatar'} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                      {profile?.user?.name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90 shadow-xs transition-all">
                    {avatarUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
                    <input id="avatar-upload" type="file" accept="image/*" className="hidden" disabled={avatarUploading} onChange={handleAvatarUpload} />
                  </label>
                </div>
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="font-semibold text-sm flex items-center justify-center sm:justify-start gap-2">
                    Profile Photo
                    {profile?.user?.image?.includes('cloudinary') && (
                      <Badge variant="secondary" className="text-[10px]">
                        Cloudinary Verified
                      </Badge>
                    )}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Upload a high quality professional avatar (Max 5MB). Automatically cropped and optimized by Cloudinary.
                  </p>
                </div>
              </div>

              <form onSubmit={handlePersonalSubmit(onPersonalSubmit)} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" {...regPersonal('name')} />
                    {errorsPersonal.name && <p className="text-xs text-destructive">{errorsPersonal.name.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="headline">Professional Headline</Label>
                    <Input id="headline" placeholder="e.g. Senior Full Stack Engineer" {...regPersonal('headline')} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Professional Summary / Bio</Label>
                  <Textarea id="bio" placeholder="Write a short overview of your career and goals..." rows={4} {...regPersonal('bio')} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="+1 (555) 000-0000" {...regPersonal('phone')} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" placeholder="e.g. San Francisco, CA" {...regPersonal('location')} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="website" className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> Portfolio Website</Label>
                    <Input id="website" placeholder="https://yourwebsite.com" {...regPersonal('website')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedinUrl" className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> LinkedIn URL</Label>
                    <Input id="linkedinUrl" placeholder="https://linkedin.com/in/username" {...regPersonal('linkedinUrl')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="githubUrl" className="flex items-center gap-1.5"><FaGithub className="h-3.5 w-3.5" /> GitHub URL</Label>
                    <Input id="githubUrl" placeholder="https://github.com/username" {...regPersonal('githubUrl')} />
                  </div>
                </div>

                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Experience Tab */}
        <TabsContent value="experience" className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Work History</h3>
            <Dialog open={dialogOpen.exp} onOpenChange={(open) => setDialogOpen((prev) => ({ ...prev, exp: open }))}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-violet-600 text-white"><Plus className="mr-1 h-4 w-4" /> Add Experience</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Work Experience</DialogTitle></DialogHeader>
                <form onSubmit={handleExpSubmit(onExpSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input {...regExp('company')} placeholder="TechCorp" />
                  </div>
                  <div className="space-y-2">
                    <Label>Job Title</Label>
                    <Input {...regExp('title')} placeholder="Software Engineer" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input type="date" {...regExp('startDate')} />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input type="date" {...regExp('endDate')} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea {...regExp('description')} placeholder="Key accomplishments and responsibilities..." />
                  </div>
                  <Button type="submit" className="w-full bg-violet-600 text-white">Save Experience</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {profile?.experiences?.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">No experience entries added yet.</Card>
          ) : (
            profile?.experiences?.map((exp) => (
              <Card key={exp.id} className="border-border/50">
                <CardContent className="p-6 flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-bold text-base">{exp.title}</h4>
                    <p className="text-sm font-medium text-violet-600">{exp.company}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(exp.startDate).toLocaleDateString()} - {exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'N/A'}
                    </p>
                    {exp.description && <p className="text-sm mt-2 text-muted-foreground">{exp.description}</p>}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteExperience(exp.id).then(loadProfile)} className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Education Tab */}
        <TabsContent value="education" className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Education & Degrees</h3>
            <Dialog open={dialogOpen.edu} onOpenChange={(open) => setDialogOpen((prev) => ({ ...prev, edu: open }))}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-violet-600 text-white"><Plus className="mr-1 h-4 w-4" /> Add Education</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Education</DialogTitle></DialogHeader>
                <form onSubmit={handleEduSubmit(onEduSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Institution</Label>
                    <Input {...regEdu('institution')} placeholder="Stanford University" />
                  </div>
                  <div className="space-y-2">
                    <Label>Degree</Label>
                    <Input {...regEdu('degree')} placeholder="Bachelor of Science" />
                  </div>
                  <div className="space-y-2">
                    <Label>Field of Study</Label>
                    <Input {...regEdu('fieldOfStudy')} placeholder="Computer Science" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input type="date" {...regEdu('startDate')} />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input type="date" {...regEdu('endDate')} />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-violet-600 text-white">Save Education</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {profile?.educations?.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">No education entries added yet.</Card>
          ) : (
            profile?.educations?.map((edu) => (
              <Card key={edu.id} className="border-border/50">
                <CardContent className="p-6 flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-bold text-base">{edu.degree} in {edu.fieldOfStudy}</h4>
                    <p className="text-sm font-medium text-violet-600">{edu.institution}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(edu.startDate).toLocaleDateString()} - {edu.endDate ? new Date(edu.endDate).toLocaleDateString() : 'Present'}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteEducation(edu.id).then(loadProfile)} className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Technical & Professional Skills</h3>
            <Dialog open={dialogOpen.skill} onOpenChange={(open) => setDialogOpen((prev) => ({ ...prev, skill: open }))}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-violet-600 text-white"><Plus className="mr-1 h-4 w-4" /> Add Skill</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Skill</DialogTitle></DialogHeader>
                <form onSubmit={handleSkillSubmit(onSkillSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Skill Name</Label>
                    <Input {...regSkill('name')} placeholder="React, Node.js, Python, PostgreSQL..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input {...regSkill('category')} placeholder="Frontend, Backend, DevOps..." />
                  </div>
                  <Button type="submit" className="w-full bg-violet-600 text-white">Save Skill</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {profile?.skills?.length === 0 ? (
              <p className="text-sm text-muted-foreground">No skills added yet.</p>
            ) : (
              profile?.skills?.map((sk) => (
                <Badge key={sk.id} variant="secondary" className="px-3 py-1 text-sm flex items-center gap-2 border border-border">
                  <span>{sk.name}</span>
                  <button onClick={() => deleteSkill(sk.id).then(loadProfile)} className="hover:text-destructive">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Highlighted Projects</h3>
            <Dialog open={dialogOpen.proj} onOpenChange={(open) => setDialogOpen((prev) => ({ ...prev, proj: open }))}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-violet-600 text-white"><Plus className="mr-1 h-4 w-4" /> Add Project</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Project</DialogTitle></DialogHeader>
                <form onSubmit={handleProjSubmit(onProjSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Project Title</Label>
                    <Input {...regProj('title')} placeholder="AI Resume Analyzer" />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea {...regProj('description')} placeholder="Built a scalable Next.js app..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Project / Live Link</Label>
                    <Input {...regProj('link')} placeholder="https://myproject.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>GitHub URL</Label>
                    <Input {...regProj('githubUrl')} placeholder="https://github.com/user/project" />
                  </div>
                  <Button type="submit" className="w-full bg-violet-600 text-white">Save Project</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {profile?.projects?.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">No projects added yet.</Card>
          ) : (
            profile?.projects?.map((proj) => (
              <Card key={proj.id} className="border-border/50">
                <CardContent className="p-6 flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-bold text-base">{proj.title}</h4>
                    <p className="text-sm text-muted-foreground">{proj.description}</p>
                    <div className="flex gap-4 pt-2 text-xs text-violet-600">
                      {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1"><Globe className="h-3 w-3" /> Live Demo</a>}
                      {proj.githubUrl && <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1"><FaGithub className="h-3 w-3" /> Code Repository</a>}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteProject(proj.id).then(loadProfile)} className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
