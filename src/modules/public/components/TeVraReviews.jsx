import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../../core/contexts/AuthContext'
import reviewsService from '../services/reviews.service'
import api from '../../../core/services/api'
import useScrollReveal from '../../../core/hooks/useScrollReveal'

export default function TeVraReviews() {
  const { isAuthenticated } = useAuth()
  const { t } = useTranslation()
  const [reviews, setReviews] = useState([])
  const [form, setForm] = useState({ rating: 5, title: '', comment: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const { ref, isVisible } = useScrollReveal(0.05)

  useEffect(() => {
    api.get('/reviews?type=tevra&limit=6')
      .then(r => setReviews(Array.isArray(r) ? r : r?.items || []))
      .catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.comment.trim()) return
    setSubmitting(true)
    setError('')
    try {
      await reviewsService.create({
        type: 'tevra',
        rating: form.rating,
        title: form.title.trim() || undefined,
        comment: form.comment.trim(),
      })
      setSubmitted(true)
      setForm({ rating: 5, title: '', comment: '' })
      api.get('/reviews?type=tevra&limit=6')
        .then(r => setReviews(Array.isArray(r) ? r : r?.items || []))
        .catch(() => {})
    } catch {
      setError(t('teVraReviews.error'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="py-24 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 rounded-full border border-secondary/20 mb-4">
            <span className="material-symbols-outlined text-secondary text-sm">star</span>
            <span className="text-secondary text-[11px] font-black uppercase tracking-widest">{t('teVraReviews.badge')}</span>
          </div>
          <h2 className="font-headline font-extrabold text-primary tracking-tight mb-3" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>
            {t('teVraReviews.title')}
          </h2>
          <p className="text-text-muted">{t('teVraReviews.subtitle')}</p>
        </div>

        {reviews.length > 0 && (
          <div ref={ref} className={`grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-14 reveal ${isVisible ? 'visible' : ''}`}>
            {reviews.map((review, i) => (
              <div key={review.id} className={`bg-surface-container-lowest rounded-2xl p-6 shadow-soft border border-outline-variant/15 stagger-${Math.min(i + 1, 5)}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex text-amber-400">
                    {[...Array(review.rating || 5)].map((_, j) => (
                      <span key={j} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    ))}
                  </div>
                  <span className="text-xs text-text-muted">
                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                  </span>
                </div>
                {review.title && <p className="font-bold text-primary text-sm mb-1">{review.title}</p>}
                <p className="text-sm text-on-surface-variant leading-relaxed italic mb-4">"{review.comment}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    {(review.user?.firstName?.[0] || 'U')}{(review.user?.lastName?.[0] || '')}
                  </div>
                  <span className="text-xs font-bold text-primary">{review.user?.firstName || 'Cliente'} {review.user?.lastName?.[0] || ''}.</span>
                  <span className="ml-auto flex items-center gap-1 text-xs text-mint font-bold">
                    <span className="material-symbols-outlined text-sm">verified</span>
                    {t('teVraReviews.verified')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="max-w-2xl mx-auto">
          {isAuthenticated ? (
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 p-8 shadow-soft">
              <h3 className="font-headline font-bold text-primary text-xl mb-1">{t('teVraReviews.formTitle')}</h3>
              <p className="text-text-muted text-sm mb-6">{t('teVraReviews.formSubtitle')}</p>
              {submitted ? (
                <div className="flex items-center gap-3 py-6 justify-center">
                  <span className="material-symbols-outlined text-3xl text-mint">check_circle</span>
                  <div>
                    <p className="font-bold text-primary">{t('teVraReviews.submitted.title')}</p>
                    <p className="text-sm text-text-muted">{t('teVraReviews.submitted.desc')}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <p className="text-sm font-bold text-primary mb-2">{t('teVraReviews.rating')}</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, rating: star }))}
                          className="text-2xl transition-transform hover:scale-110"
                        >
                          <span
                            className="material-symbols-outlined text-amber-400"
                            style={{ fontVariationSettings: star <= form.rating ? "'FILL' 1" : "'FILL' 0" }}
                          >star</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder={t('teVraReviews.titlePlaceholder')}
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant/30 bg-surface-container-low text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  />
                  <textarea
                    placeholder={t('teVraReviews.commentPlaceholder')}
                    value={form.comment}
                    onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                    rows={4}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant/30 bg-surface-container-low text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none"
                  />
                  {error && <p className="text-red-500 text-xs">{error}</p>}
                  <button
                    type="submit"
                    disabled={submitting || !form.comment.trim()}
                    className="w-full py-3 bg-primary text-white rounded-xl font-headline font-bold text-sm hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    {submitting ? t('teVraReviews.submitting') : t('teVraReviews.submitBtn')}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 p-8 text-center shadow-soft">
              <span className="material-symbols-outlined text-4xl text-text-muted mb-3 block">rate_review</span>
              <p className="font-headline font-bold text-primary text-lg mb-2">{t('teVraReviews.guestTitle')}</p>
              <p className="text-text-muted text-sm mb-5">{t('teVraReviews.guestDesc')}</p>
              <Link to="/login" className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl font-headline font-bold hover:bg-secondary transition-colors shadow-md">
                <span className="material-symbols-outlined text-base">login</span>
                {t('teVraReviews.loginBtn')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
