import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Check, Loader2, Inbox } from 'lucide-react';
import { notificationsService } from '../../services/notifications/notifications.service';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';
import { formatDate } from '../../utils/formatters';

/**
 * Reusable NotificationCenter dropdown for Student and Teacher dashboard headers.
 * Displays real unread counts and database records without fabricating notifications.
 */
export function NotificationCenter() {
  const { isAuthenticated, isConfigured } = useAuth();
  const { locale, t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchNotifications = useCallback(async () => {
    if (!isConfigured || !isAuthenticated) {
      setNotifications([]);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    try {
      const records = await notificationsService.listMyNotifications(25);
      setNotifications(records);
    } catch (err) {
      setErrorMessage(err?.message || 'تعذر تحميل الإشعارات.');
    } finally {
      setIsLoading(false);
    }
  }, [isConfigured, isAuthenticated]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((item) => !item.is_read).length;

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      setErrorMessage(err?.message || 'تعذر تحديث حالة الإشعار.');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      setErrorMessage(err?.message || 'تعذر تحديث الإشعارات.');
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          const next = !isOpen;
          setIsOpen(next);
          if (next) fetchNotifications();
        }}
        className="relative inline-flex items-center justify-center rounded-lg border border-brand-border bg-brand-surface p-2 text-brand-text transition-colors hover:bg-brand-accent/40"
        aria-label={t('notifications.title')}
        aria-expanded={isOpen}
      >
        <Bell className="h-4 w-4 text-brand-primary" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -end-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-brand-primary px-1 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div
            role="region"
            aria-label={t('notifications.title')}
            className="absolute end-0 z-40 mt-2 w-80 rounded-2xl border border-brand-border bg-brand-surface shadow-xl sm:w-96"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-brand-border px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-brand-primary">
                  {t('notifications.title')}
                </span>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-brand-accent px-2 py-0.5 text-[11px] font-bold text-brand-primary">
                    {unreadCount} {t('notifications.unreadCount')}
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary hover:underline"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span>{t('notifications.markAllRead')}</span>
                </button>
              )}
            </div>

            {/* Body */}
            <div className="max-h-80 overflow-y-auto p-3">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 py-8 text-xs text-brand-muted">
                  <Loader2 className="h-4 w-4 animate-spin text-brand-primary" />
                  <span>{t('common.loading')}</span>
                </div>
              ) : errorMessage ? (
                <p className="rounded-lg bg-red-50 p-3 text-xs text-red-700">
                  {errorMessage}
                </p>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                  <Inbox className="h-6 w-6 text-brand-muted" />
                  <p className="text-xs text-brand-muted">
                    {t('notifications.empty')}
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {notifications.map((item) => {
                    const title =
                      locale === 'en'
                        ? item.title_en || item.title_ar
                        : item.title_ar || item.title_en;
                    const body =
                      locale === 'en'
                        ? item.body_en || item.body_ar
                        : item.body_ar || item.body_en;

                    return (
                      <li
                        key={item.id}
                        className={`rounded-xl border p-3 text-xs transition-colors ${
                          item.is_read
                            ? 'border-brand-border bg-brand-surface text-brand-muted'
                            : 'border-brand-primary/30 bg-brand-accent/35 text-brand-text'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-bold text-brand-text">{title}</p>
                          {!item.is_read && (
                            <button
                              type="button"
                              onClick={() => handleMarkAsRead(item.id)}
                              className="shrink-0 rounded bg-brand-surface px-1.5 py-0.5 text-[10px] font-semibold text-brand-primary hover:bg-brand-primary hover:text-white"
                              title={t('notifications.markRead')}
                            >
                              <Check className="h-3 w-3" />
                            </button>
                          )}
                        </div>

                        {body && <p className="mt-1 leading-relaxed">{body}</p>}

                        <div className="mt-2 flex items-center justify-between text-[11px] text-brand-muted">
                          <span>{formatDate(item.created_at, locale)}</span>
                          {item.link_path && (
                            <Link
                              to={item.link_path}
                              onClick={() => setIsOpen(false)}
                              className="font-semibold text-brand-primary hover:underline"
                            >
                              {t('common.preview')}
                            </Link>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default NotificationCenter;
