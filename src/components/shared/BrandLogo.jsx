import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { useSiteConfig } from '../../hooks/useSiteConfig';
import { sanitizeAssetUrl } from '../../utils/theme';
import { ROUTES } from '../../constants/routes';

export function BrandLogo({
  showTeacherName = true,
  to = ROUTES.HOME,
  inverted = false,
}) {
  const site = useSiteConfig();
  const [imgError, setImgError] = useState(false);

  const customLogo = sanitizeAssetUrl(site?.branding?.logoPath, '');
  const showCustomImg =
    customLogo && customLogo !== '/logo.svg' && !imgError;

  return (
    <Link
      to={to}
      className="inline-flex items-center gap-3 transition-opacity hover:opacity-90"
    >
      {showCustomImg ? (
        <img
          src={customLogo}
          alt={site.academyName}
          onError={() => setImgError(true)}
          className="h-10 w-10 shrink-0 rounded-xl border border-brand-border bg-brand-surface object-contain p-1"
        />
      ) : (
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm ${
            inverted
              ? 'bg-brand-accent text-brand-primary'
              : 'bg-brand-primary text-white'
          }`}
        >
          <GraduationCap className="h-5 w-5" />
        </div>
      )}

      <div className="flex flex-col">
        <span
          className={`text-base font-bold leading-tight ${
            inverted ? 'text-white' : 'text-brand-text'
          }`}
        >
          {site.academyName}
        </span>
        {showTeacherName && (
          <span
            className={`text-xs font-medium ${
              inverted ? 'text-brand-accent/85' : 'text-brand-muted'
            }`}
          >
            {site.teacherName}
          </span>
        )}
      </div>
    </Link>
  );
}

export default BrandLogo;
