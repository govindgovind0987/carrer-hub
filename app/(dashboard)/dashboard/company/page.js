'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Globe, MapPin, Users, Loader2, Save, Upload, Camera, Building } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { getCompany, updateCompany } from '@/actions/company';
import { companySchema } from '@/schemas/company';

export default function CompanyPage() {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(companySchema),
  });

  const logoUrl = watch('logo');
  const coverUrl = watch('coverImage');

  useEffect(() => {
    let isMounted = true;
    getCompany().then((res) => {
      if (!isMounted) return;
      if (res.success) {
        setCompany(res.company);
        reset({
          name: res.company.name || '',
          description: res.company.description || '',
          website: res.company.website || '',
          location: res.company.location || '',
          size: res.company.size || '',
          industry: res.company.industry || '',
          logo: res.company.logo || '',
          coverImage: res.company.coverImage || '',
        });
      } else {
        toast.error(res.error);
      }
      setLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, [reset]);

  const loadCompany = async () => {
    const res = await getCompany();
    if (res.success) {
      setCompany(res.company);
    }
  };

  const handleImageUpload = async (field, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (JPG, PNG, WEBP, SVG)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit');
      return;
    }

    if (field === 'logo') setUploadingLogo(true);
    else setUploadingCover(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'companies');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!data.url) throw new Error(data.error || 'Upload failed');

      setValue(field, data.url, { shouldValidate: true, shouldDirty: true });
      toast.success(`${field === 'logo' ? 'Company logo' : 'Cover image'} uploaded!`);
    } catch (err) {
      toast.error(err.message || 'Failed to upload image');
    } finally {
      if (field === 'logo') setUploadingLogo(false);
      else setUploadingCover(false);
    }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    const res = await updateCompany(data);
    if (res.success) {
      toast.success('Company profile updated!');
      loadCompany();
    } else {
      toast.error(res.error);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Company Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your organization details, branding, industry background, and career page details.
        </p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Organization Branding & Details</CardTitle>
          <CardDescription>Upload official company assets and update public job post branding.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Company Assets Section */}
          <div className="grid gap-6 sm:grid-cols-2 p-4 rounded-xl bg-muted/40 border border-border/50">
            {/* Logo Upload */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Company Logo</span>
                {logoUrl?.includes('cloudinary') && (
                  <Badge className="bg-violet-500/10 text-violet-600 border-violet-500/20 text-[10px]">
                    Cloudinary Verified
                  </Badge>
                )}
              </Label>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-xl border border-border/60 bg-background flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Company Logo" className="h-full w-full object-contain p-1" />
                  ) : (
                    <Building className="h-8 w-8 text-muted-foreground/50" />
                  )}
                </div>
                <div className="space-y-1">
                  <label htmlFor="logo-upload" className="inline-flex">
                    <Button type="button" variant="outline" size="sm" asChild disabled={uploadingLogo} className="text-xs">
                      <span>
                        {uploadingLogo ? (
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Upload className="mr-1.5 h-3.5 w-3.5" />
                        )}
                        {logoUrl ? 'Change Logo' : 'Upload Logo'}
                      </span>
                    </Button>
                  </label>
                  <input id="logo-upload" type="file" accept="image/*" className="hidden" disabled={uploadingLogo} onChange={(e) => handleImageUpload('logo', e)} />
                  <p className="text-[11px] text-muted-foreground">PNG, JPG, WEBP or SVG (Max 5MB)</p>
                </div>
              </div>
            </div>

            {/* Cover Image Upload */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Cover Image</span>
                {coverUrl?.includes('cloudinary') && (
                  <Badge className="bg-violet-500/10 text-violet-600 border-violet-500/20 text-[10px]">
                    Cloudinary Verified
                  </Badge>
                )}
              </Label>
              <div className="flex items-center gap-4">
                <div className="h-16 w-28 rounded-xl border border-border/60 bg-background flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                  {coverUrl ? (
                    <img src={coverUrl} alt="Cover Preview" className="h-full w-full object-cover" />
                  ) : (
                    <Camera className="h-6 w-6 text-muted-foreground/50" />
                  )}
                </div>
                <div className="space-y-1">
                  <label htmlFor="cover-upload" className="inline-flex">
                    <Button type="button" variant="outline" size="sm" asChild disabled={uploadingCover} className="text-xs">
                      <span>
                        {uploadingCover ? (
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Upload className="mr-1.5 h-3.5 w-3.5" />
                        )}
                        {coverUrl ? 'Change Cover' : 'Upload Cover'}
                      </span>
                    </Button>
                  </label>
                  <input id="cover-upload" type="file" accept="image/*" className="hidden" disabled={uploadingCover} onChange={(e) => handleImageUpload('coverImage', e)} />
                  <p className="text-[11px] text-muted-foreground">Banner image for job details page (Max 5MB)</p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="c-name">Company Name</Label>
                <Input id="c-name" {...register('name')} placeholder="e.g. Acme Corp" />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="c-industry">Industry</Label>
                <Input id="c-industry" {...register('industry')} placeholder="e.g. Artificial Intelligence, SaaS, Fintech" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="c-desc">About Company</Label>
              <Textarea id="c-desc" rows={4} {...register('description')} placeholder="Briefly describe your company culture, mission, and benefits..." />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="c-website" className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> Website</Label>
                <Input id="c-website" {...register('website')} placeholder="https://company.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="c-location" className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Headquarters Location</Label>
                <Input id="c-location" {...register('location')} placeholder="San Francisco, CA or Remote" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="c-size" className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Company Size</Label>
                <Input id="c-size" {...register('size')} placeholder="50-200 employees" />
              </div>
            </div>

            <Button type="submit" disabled={saving} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save Company Profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
