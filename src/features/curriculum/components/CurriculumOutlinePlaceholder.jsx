import React from 'react';
import { FolderKanban, Video } from 'lucide-react';
import { Card } from '../../../components/ui/Card';

export function CurriculumOutlinePlaceholder() {
  return (
    <Card className="space-y-3 border-dashed border-slate-300 bg-slate-50/60">
      <div className="flex items-center gap-2 text-brand-primary">
        <FolderKanban className="h-5 w-5" />
        <h3 className="text-sm font-bold text-brand-text">
          هيكل الوحدات والدروس (Curriculum Builder Placeholder)
        </h3>
      </div>
      <p className="text-xs leading-relaxed text-brand-muted">
        سيتم هنا تنظيم الدورة إلى وحدات متسلسلة (Sections)، وبداخل كل وحدة مجموعة دروس (Lessons) مرتبطة بمعرفات الفيديو لدى مزود الاستضافة والملفات المرفقة.
      </p>
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 text-xs text-brand-muted">
        <Video className="h-4 w-4 text-brand-secondary" />
        <span>ترتيب الوحدات والدروس وربط معرفات الفيديو سيتم عبر curriculum.service.js و video.service.js.</span>
      </div>
    </Card>
  );
}

export default CurriculumOutlinePlaceholder;
