import React from 'react';
import { PlayCircle, Lock } from 'lucide-react';

export function VideoPlayerPlaceholder({ courseId, lessonId }) {
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center text-slate-100 shadow-sm">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-teal-400">
        <PlayCircle className="h-8 w-8" />
      </div>
      <h3 className="text-base font-bold">
        موضع مشغل الفيديو المحمي (Video Player Boundary)
      </h3>
      <p className="mt-1.5 max-w-md text-xs leading-relaxed text-slate-400">
        سيتم هنا تضمين مشغل الفيديو بعد التحقق من صلاحية اشتراك الطالب في الخادم وتوليد رابط تشغيل موقع (Signed Playback URL) عبر{' '}
        <code className="font-mono text-teal-300">video.service.js</code>.
      </p>
      <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-800 px-3.5 py-1 text-xs text-slate-300">
        <Lock className="h-3.5 w-3.5 text-amber-400" />
        <span dir="ltr" className="font-mono">
          course: {courseId} | lesson: {lessonId}
        </span>
      </div>
    </div>
  );
}

export default VideoPlayerPlaceholder;
