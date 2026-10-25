import React, { useState } from 'react';
import { Upload, Image as ImageIcon, Trash2, Loader2 } from 'lucide-react';
import { sanitizeAssetUrl } from '../../utils/theme';

const ALLOWED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/svg+xml',
];

/**
 * Reusable Image Upload & Preview field.
 * Supports safe local preview / URL input and optional async upload handler
 * (e.g., uploading to Supabase Storage buckets when configured).
 */
export function ImageUploadField({
  label,
  name,
  value = '',
  onChange,
  onUploadFile,
  helperText,
  accept = 'image/png,image/jpeg,image/webp,image/svg+xml',
  previewHeight = 'h-24',
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const safePreviewUrl = sanitizeAssetUrl(value, '');

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError('');

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setUploadError('يرجى اختيار ملف صورة صالح (PNG, JPG, WEBP, SVG).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('حجم الصورة يجب ألا يتجاوز 5 ميجابايت.');
      return;
    }

    if (onUploadFile) {
      setIsUploading(true);
      try {
        const uploadedUrl = await onUploadFile(file);
        if (uploadedUrl && onChange) {
          onChange(name, sanitizeAssetUrl(uploadedUrl, ''));
        }
      } catch (err) {
        setUploadError(
          err?.message || 'تعذر رفع الصورة إلى الخادم. تأكد من إعداد حاوية التخزين في Supabase.'
        );
      } finally {
        setIsUploading(false);
      }
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    if (onChange) {
      onChange(name, objectUrl, file);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-brand-text"
        >
          {label}
        </label>
      )}

      <div className="flex flex-col gap-3 rounded-xl border border-brand-border bg-brand-surface p-3.5 sm:flex-row sm:items-center">
        {/* Image Preview Slot */}
        <div
          className={`flex ${previewHeight} w-full shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-brand-border bg-brand-bg sm:w-36`}
        >
          {safePreviewUrl ? (
            <img
              src={safePreviewUrl}
              alt={label || name}
              className="h-full w-full object-contain p-1"
            />
          ) : (
            <div className="flex flex-col items-center gap-1 text-brand-muted">
              <ImageIcon className="h-6 w-6" />
              <span className="text-[11px]">لا توجد صورة</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex-1 space-y-2">
          <input
            id={name}
            name={name}
            type="text"
            dir="ltr"
            value={value ?? ''}
            onChange={(e) => onChange && onChange(name, e.target.value)}
            placeholder="/logo.svg أو https://..."
            className="w-full rounded-lg border border-brand-border bg-brand-bg px-3 py-2 text-xs font-mono text-brand-text focus:border-brand-primary focus:outline-none"
          />

          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand-accent px-3 py-1.5 text-xs font-semibold text-brand-primary transition-colors hover:bg-brand-primary hover:text-white">
              {isUploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
              <span>{isUploading ? 'جاري الرفع...' : 'اختيار ملف صورة'}</span>
              <input
                type="file"
                accept={accept}
                onChange={handleFileSelect}
                disabled={isUploading}
                className="hidden"
              />
            </label>

            {safePreviewUrl && (
              <button
                type="button"
                onClick={() => onChange && onChange(name, '')}
                className="inline-flex items-center gap-1 rounded-lg border border-brand-border px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>إزالة</span>
              </button>
            )}
          </div>

          {helperText && (
            <p className="text-[11px] text-brand-muted">{helperText}</p>
          )}

          {uploadError && (
            <p className="text-xs font-medium text-red-600" role="alert">
              {uploadError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ImageUploadField;
