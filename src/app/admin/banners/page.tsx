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
import { Upload, RefreshCw } from 'lucide-react'

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

  const [title, setTitle] = React.useState('')
  const [subtitle, setSubtitle] = React.useState('')
  const [ctaText, setCtaText] = React.useState('')
  const [ctaUrl, setCtaUrl] = React.useState('')

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

  React.useEffect(() => {
    loadBanners()
  }, [loadBanners])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isSaving) return
    if (!imageFile) {
      toast({
        title: 'Image required',
        description: 'Upload a banner image before saving.',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)
    try {
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

      const imageUrl = publicUrlData.publicUrl

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
      setTitle('')
      setSubtitle('')
      setCtaText('')
      setCtaUrl('')
      setImageFile(null)
      setImagePreview(null)
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

  return (
    <div className="space-y-6">
      <Card>
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
            <p className="text-sm text-muted-foreground">No banners yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {banners.map((banner) => (
                <Card key={banner.id} className="overflow-hidden">
                  {banner.image_url && (
                    <img src={banner.image_url} alt={banner.title ?? 'Banner'} className="h-40 w-full object-cover" />
                  )}
                  <CardContent className="space-y-2 pt-4">
                    <h3 className="font-semibold">{banner.title || 'Untitled banner'}</h3>
                    {banner.subtitle && <p className="text-sm text-muted-foreground">{banner.subtitle}</p>}
                    <p className="text-xs text-muted-foreground">
                      CTA: {banner.cta_text || '—'} {banner.cta_url ? `(${banner.cta_url})` : ''}
                    </p>
                    <p className="text-xs text-muted-foreground">Status: {banner.active ? 'Active' : 'Inactive'}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add Banner</CardTitle>
          <CardDescription>Upload a new banner image and content.</CardDescription>
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
                  {isSaving ? 'Saving...' : 'Save Banner'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
