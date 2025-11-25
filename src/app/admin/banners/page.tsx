'use client'

import * as React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/context/auth-context'
import { Upload, RefreshCw, Pencil, Trash2, X } from 'lucide-react'

type BannerRow = {
  id: string
  title: string | null
  subtitle: string | null
  cta_text: string | null
  cta_url: string | null
  image_url: string | null
  active: boolean | null
  created_at?: string | null
}

export default function AdminBannersPage() {
  const { supabase } = useAuth()
  const { toast } = useToast()
  const [banners, setBanners] = React.useState<BannerRow[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [imageFile, setImageFile] = React.useState<File | null>(null)
  const [imagePreview, setImagePreview] = React.useState<string | null>(null)
  const [editingId, setEditingId] = React.useState<string | null>(null)

  const [title, setTitle] = React.useState('')
  const [subtitle, setSubtitle] = React.useState('')
  const [ctaText, setCtaText] = React.useState('')
  const [ctaUrl, setCtaUrl] = React.useState('')
  const [storyContent, setStoryContent] = React.useState('')
  const [storyLink, setStoryLink] = React.useState('')
  const [storyId, setStoryId] = React.useState<string | null>(null)
  const [storyImageFile, setStoryImageFile] = React.useState<File | null>(null)
  const [storyImagePreview, setStoryImagePreview] = React.useState<string | null>(null)

  const describeError = (cause: unknown) => {
    if (cause instanceof Error) return cause.message
    if (typeof cause === 'string') return cause
    try {
      return JSON.stringify(cause)
    } catch {
      return 'Unknown error'
    }
  }

  const loadBanners = React.useCallback(async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to load banners', error)
      toast({
        title: 'Unable to load banners',
        description: describeError(error),
        variant: 'destructive',
      })
    }

    setBanners((data as BannerRow[]) ?? [])
    setIsLoading(false)
  }, [supabase, toast])

  const loadStory = React.useCallback(async () => {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('title', 'Our Story')
      .maybeSingle()

    if (error) {
      console.error('Failed to load story content', error)
      return
    }

    if (data) {
      setStoryId(data.id)
      setStoryContent(data.subtitle ?? '')
      setStoryLink(data.cta_url ?? '')
      setStoryImagePreview(data.image_url ?? null)
    } else {
      setStoryId(null)
      setStoryContent('')
      setStoryLink('')
      setStoryImagePreview(null)
    }
  }, [supabase])

  React.useEffect(() => {
    loadBanners()
    loadStory()
  }, [loadBanners, loadStory])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const resetForm = () => {
    setTitle('')
    setSubtitle('')
    setCtaText('')
    setCtaUrl('')
    setImageFile(null)
    setImagePreview(null)
    setEditingId(null)
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isSaving) return
    if (!imageFile && !editingId) {
      toast({
        title: 'Image required',
        description: 'Upload a banner image before saving.',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)
    try {
      let imageUrl = editingId
        ? banners.find((b) => b.id === editingId)?.image_url ?? null
        : null

      if (imageFile) {
        const { data: imageData, error: imageError } = await supabase.storage
          .from('banner_images')
          .upload(`${Date.now()}_${imageFile.name}`, imageFile, {
            cacheControl: '3600',
            upsert: false,
          })

        if (imageError || !imageData) {
          throw imageError ?? new Error('Unknown image upload error')
        }

        const { data: publicUrlData } = supabase.storage
          .from('banner_images')
          .getPublicUrl(imageData.path)

        imageUrl = publicUrlData.publicUrl
      }

      if (editingId) {
        const { error: updateError } = await supabase
          .from('banners')
          .update({
            title: title.trim() || null,
            subtitle: subtitle.trim() || null,
            cta_text: ctaText.trim() || null,
            cta_url: ctaUrl.trim() || null,
            image_url: imageUrl,
          })
          .eq('id', editingId)

        if (updateError) throw updateError
        toast({ title: 'Banner updated' })
      } else {
        const { error: insertError } = await supabase.from('banners').insert([
          {
            title: title.trim() || null,
            subtitle: subtitle.trim() || null,
            cta_text: ctaText.trim() || null,
            cta_url: ctaUrl.trim() || null,
            image_url: imageUrl,
            active: true,
          },
        ])

        if (insertError) {
          throw insertError
        }

        toast({ title: 'Banner saved' })
      }

      resetForm()
      loadBanners()
    } catch (error) {
      console.error('Failed to save banner', error)
      toast({
        title: 'Could not save banner',
        description: describeError(error),
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleStorySave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      let storyImageUrl = storyImagePreview

      if (storyImageFile) {
        const { data: imageData, error: imageError } = await supabase.storage
          .from('banner_images')
          .upload(`${Date.now()}_${storyImageFile.name}`, storyImageFile, {
            cacheControl: '3600',
            upsert: false,
          })

        if (imageError || !imageData) throw imageError ?? new Error('Story image upload failed')

        const { data: publicUrlData } = supabase.storage.from('banner_images').getPublicUrl(imageData.path)
        storyImageUrl = publicUrlData.publicUrl
      }

      if (storyId) {
        const { error } = await supabase
          .from('banners')
          .update({
            subtitle: storyContent.trim() || null,
            cta_url: storyLink.trim() || null,
            image_url: storyImageUrl,
          })
          .eq('id', storyId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('banners').insert([
          {
            title: 'Our Story',
            subtitle: storyContent.trim() || null,
            cta_url: storyLink.trim() || null,
            image_url: storyImageUrl,
            active: false,
          },
        ])
        if (error) throw error
      }
      toast({ title: 'Story content saved' })
      loadStory()
    } catch (error) {
      console.error('Failed to save story', error)
      toast({
        title: 'Could not save story content',
        description: describeError(error),
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card/70 backdrop-blur-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle>Banners</CardTitle>
            <CardDescription>Upload and manage homepage banners.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={loadBanners} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading banners...</p>
          ) : banners.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
              No banners yet. Upload your first hero to highlight promos on the homepage.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {banners.map((banner) => (
                <Card key={banner.id} className="overflow-hidden bg-card/70 backdrop-blur-sm">
                  {banner.image_url && (
                    <img src={banner.image_url} alt={banner.title ?? 'Banner'} className="h-40 w-full object-cover" />
                  )}
                  <CardContent className="space-y-2 pt-4">
                    <h3 className="font-semibold">{banner.title || 'Untitled banner'}</h3>
                    {banner.subtitle && <p className="text-sm text-muted-foreground">{banner.subtitle}</p>}
                    <p className="text-xs text-muted-foreground">
                      CTA: {banner.cta_text || 'None'} {banner.cta_url ? `(${banner.cta_url})` : ''}
                    </p>
                    <p className="text-xs text-muted-foreground">Status: {banner.active ? 'Active' : 'Inactive'}</p>
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingId(banner.id)
                          setTitle(banner.title ?? '')
                          setSubtitle(banner.subtitle ?? '')
                          setCtaText(banner.cta_text ?? '')
                          setCtaUrl(banner.cta_url ?? '')
                          setImagePreview(banner.image_url ?? null)
                          setImageFile(null)
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={async () => {
                          const { error } = await supabase.from('banners').delete().eq('id', banner.id)
                          if (error) {
                            toast({
                              title: 'Could not delete banner',
                              description: describeError(error),
                              variant: 'destructive',
                            })
                            return
                          }
                          if (editingId === banner.id) resetForm()
                          toast({ title: 'Banner deleted' })
                          loadBanners()
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>{editingId ? 'Edit Banner' : 'Add Banner'}</CardTitle>
            <CardDescription>Upload a new banner image and content.</CardDescription>
          </div>
          {editingId && (
            <Button type="button" variant="ghost" size="sm" onClick={resetForm} className="gap-1">
              <X className="h-4 w-4" /> Cancel
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 lg:grid-cols-2 gap-6" onSubmit={handleSave}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Headline" />
              </div>
              <div>
                <Label htmlFor="subtitle">Subtitle</Label>
                <Textarea
                  id="subtitle"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  rows={3}
                  placeholder="Short supporting copy"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="ctaText">CTA Text</Label>
                  <Input id="ctaText" value={ctaText} onChange={(e) => setCtaText(e.target.value)} placeholder="Shop now" />
                </div>
                <div>
                  <Label htmlFor="ctaUrl">CTA URL</Label>
                  <Input id="ctaUrl" value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="/shop" />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <Label>Banner Image</Label>
              <label
                htmlFor="banner-image"
                className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/50 hover:bg-secondary"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Banner preview" className="h-full w-full object-cover rounded-lg" />
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, JPEG</p>
                  </div>
                )}
                <input id="banner-image" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving...' : editingId ? 'Update Banner' : 'Save Banner'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-card/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Our Story Content</CardTitle>
          <CardDescription>Update the copy that appears in the homepage story section.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleStorySave}>
            <div>
              <Label htmlFor="story-content">Story Copy</Label>
              <Textarea
                id="story-content"
                value={storyContent}
                onChange={(e) => setStoryContent(e.target.value)}
                rows={4}
                placeholder="Tell your brand story..."
              />
            </div>
            <div>
              <Label htmlFor="story-link">Optional Link</Label>
              <Input
                id="story-link"
                value={storyLink}
                onChange={(e) => setStoryLink(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label>Story Image</Label>
              <label
                htmlFor="story-image"
                className="mt-2 flex h-44 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-secondary/50 hover:bg-secondary"
              >
                {storyImagePreview ? (
                  <img src={storyImagePreview} alt="Story preview" className="h-full w-full rounded-lg object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-sm text-muted-foreground">
                    <Upload className="mb-3 h-6 w-6" />
                    <span>Click to upload story image</span>
                  </div>
                )}
                <input
                  id="story-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setStoryImageFile(file)
                      const reader = new FileReader()
                      reader.onloadend = () => setStoryImagePreview(reader.result as string)
                      reader.readAsDataURL(file)
                    }
                  }}
                />
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Story Content'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
