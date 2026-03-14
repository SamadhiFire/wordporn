<script>
import { hydrateAuthSession } from './utils/wordhub-store'

export default {
  data() {
    return {
      isHydratingAuth: false,
      hasShownAuthExpiredToast: false,
    }
  },
  onLaunch() {
    this.restoreAuthSession()
  },
  onShow() {
    this.restoreAuthSession()
  },
  methods: {
    async restoreAuthSession() {
      if (this.isHydratingAuth) {
        return
      }

      this.isHydratingAuth = true
      try {
        const session = await hydrateAuthSession()
        if (session.expired && !this.hasShownAuthExpiredToast) {
          uni.showToast({ title: '登录已失效，请重新登录', icon: 'none' })
          this.hasShownAuthExpiredToast = true
          return
        }

        if (!session.expired) {
          this.hasShownAuthExpiredToast = false
        }
      } catch (error) {
        if (error?.statusCode === 401 && !this.hasShownAuthExpiredToast) {
          uni.showToast({ title: '登录已失效，请重新登录', icon: 'none' })
          this.hasShownAuthExpiredToast = true
        }
      } finally {
        this.isHydratingAuth = false
      }
    },
  },
}
</script>

<style>
:root,
page {
  --wh-page-max-width: 448px;
  --wh-page-gutter: 28rpx;
  --wh-bg: #000000;
  --wh-bg-strong: #121212;
  --wh-surface: #1b1b1b;
  --wh-surface-muted: #282828;
  --wh-surface-elevated: #202020;
  --wh-text-strong: #ffffff;
  --wh-text-main: #f2f2f2;
  --wh-text-muted: #b2b2b2;
  --wh-text-faint: #7d7d7d;
  --wh-line: rgba(255, 255, 255, 0.08);
  --wh-line-strong: rgba(255, 153, 0, 0.28);
  --wh-accent: #ff9900;
  --wh-accent-strong: #ffb84d;
  --wh-accent-soft: rgba(255, 153, 0, 0.14);
  --wh-success: #30c267;
  --wh-danger: #ff5a4f;
  --wh-shadow-md: 0 20rpx 48rpx rgba(0, 0, 0, 0.5);
  --wh-shadow-soft: 0 10rpx 24rpx rgba(0, 0, 0, 0.36);
  --wh-shadow-accent: 0 8rpx 18rpx rgba(255, 153, 0, 0.2);
  --wh-radius-xl: 8rpx;
  --wh-radius-lg: 8rpx;
  --wh-radius-md: 8rpx;
  --wh-radius-sm: 6rpx;
  --wh-btn-radius: 8rpx;
}

page {
  min-height: 100%;
  background: var(--wh-bg);
  color: var(--wh-text-main);
  font-family: 'Avenir Next', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

view,
text,
button,
image,
textarea,
input,
scroll-view {
  box-sizing: border-box;
}

button {
  margin: 0;
  padding: 0;
  line-height: 1;
  background: transparent;
}

button::after {
  border: none;
}

.wh-page {
  position: relative;
  width: 100%;
  max-width: var(--wh-page-max-width);
  margin: 0 auto;
  min-height: 100vh;
  padding: 28rpx var(--wh-page-gutter) 136rpx;
  overflow-x: hidden;
  background: var(--wh-bg);
}

.wh-shell {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
}

.wh-card {
  background: var(--wh-surface);
  border: 1rpx solid var(--wh-line);
  border-radius: var(--wh-radius-xl);
  box-shadow: var(--wh-shadow-md);
}

.wh-card--soft {
  background: var(--wh-surface-muted);
  box-shadow: var(--wh-shadow-soft);
}

.wh-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22rpx;
}

.wh-section-title {
  font-size: 40rpx;
  font-weight: 700;
  color: var(--wh-text-strong);
}

.wh-section-subtitle {
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.6;
  color: var(--wh-text-muted);
}

.wh-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 56rpx;
  padding: 0 22rpx;
  border-radius: 999rpx;
  background: var(--wh-surface-muted);
  border: 1rpx solid var(--wh-line);
  font-size: 22rpx;
  color: var(--wh-text-muted);
}

.wh-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80rpx;
  border-radius: var(--wh-btn-radius);
  padding: 0 24rpx;
  font-size: 28rpx;
  font-weight: 700;
  border: 1rpx solid transparent;
  transition: transform 0.18s ease, opacity 0.18s ease, background-color 0.18s ease, border-color 0.18s ease;
}

.wh-btn:active {
  transform: scale(0.98);
}

.wh-btn[disabled] {
  opacity: 0.45;
}

.wh-btn--primary {
  color: #000000;
  background: var(--wh-accent);
  border-color: rgba(255, 153, 0, 0.75);
  box-shadow: var(--wh-shadow-accent);
}

.wh-btn--secondary {
  color: var(--wh-text-main);
  background: var(--wh-surface-muted);
  border-color: var(--wh-line-strong);
  box-shadow: none;
}

.wh-btn--ghost {
  color: var(--wh-accent);
  background: transparent;
  border: 1rpx solid var(--wh-line-strong);
}

.wh-btn--danger {
  color: var(--wh-danger);
  background: rgba(255, 90, 79, 0.1);
  border: 1rpx solid rgba(255, 90, 79, 0.3);
}

.wh-textarea,
.wh-input {
  display: block;
  width: 100%;
  box-sizing: border-box;
  background: var(--wh-bg-strong);
  border: 2rpx solid rgba(255, 255, 255, 0.1);
  border-radius: var(--wh-btn-radius);
  color: var(--wh-text-strong);
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.wh-textarea:focus,
.wh-input:focus {
  border-color: var(--wh-accent);
  background: #151515;
}

.wh-tag-row {
  display: flex;
  flex-wrap: wrap;
  margin-right: -16rpx;
  margin-bottom: -16rpx;
}

.wh-tag {
  margin-right: 16rpx;
  margin-bottom: 16rpx;
  padding: 12rpx 20rpx;
  border-radius: 999rpx;
  background: var(--wh-accent-soft);
  color: var(--wh-accent-strong);
  font-size: 24rpx;
  font-weight: 600;
  border: 1rpx solid rgba(255, 153, 0, 0.18);
}

.wh-stat-grid {
  display: flex;
  flex-wrap: wrap;
  margin-right: -18rpx;
  margin-bottom: -18rpx;
}

.wh-stat-card {
  width: calc(50% - 18rpx);
  margin-right: 18rpx;
  margin-bottom: 18rpx;
  padding: 24rpx;
  border-radius: var(--wh-radius-lg);
  background: var(--wh-surface-muted);
  border: 1rpx solid var(--wh-line);
}

.wh-stat-label {
  display: block;
  font-size: 22rpx;
  color: var(--wh-text-muted);
}

.wh-stat-value {
  display: block;
  margin-top: 14rpx;
  font-size: 42rpx;
  font-weight: 700;
  color: var(--wh-text-strong);
}

.wh-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.wh-topbar-title {
  font-size: 38rpx;
  font-weight: 700;
  color: var(--wh-text-strong);
}

.wh-topbar-note {
  margin-top: 10rpx;
  font-size: 22rpx;
  color: var(--wh-text-muted);
}

@media screen and (min-width: 768px) {
  :root,
  page {
    --wh-page-gutter: 16px;
  }

  .wh-page {
    padding: 40rpx var(--wh-page-gutter) 96px;
  }

  .wh-stat-card {
    width: calc(25% - 18rpx);
  }
}

/* #ifdef H5 */
@media screen and (min-width: 1024px) {
  :root,
  page {
    --wh-page-max-width: 640px;
    --wh-page-gutter: 20px;
    --wh-btn-radius: 4px;
  }

  .wh-page {
    min-height: calc(100vh - 40px);
    margin: 20px auto 28px;
    padding: 24px var(--wh-page-gutter) 112px;
    border-radius: 18px;
    background: #050505;
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 28px 70px rgba(0, 0, 0, 0.58);
  }
}
/* #endif */
</style>
