<template>
  <view class="wh-page results-page">
    <view class="wh-shell results-shell">
      <view class="results-header">
        <button class="nav-back" @tap="goBack" aria-label="返回">
          <view class="nav-back__chevron"></view>
        </button>

        <view class="results-header__brand">
          <image class="results-header__logo" src="/static/wordhubporm.png" mode="aspectFit"></image>
        </view>

        <view class="progress-pill">{{ progressLabel }}</view>
      </view>

      <view class="results-stage">
        <button class="arrow-btn arrow-btn--left" @tap="advance(-1)">&lt;</button>

        <view
          class="result-card"
          :style="{ transform: cardTransform }"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
        >
          <view v-if="currentItem" class="result-card__head">
            <text class="result-word">{{ currentItem.word }}</text>
          </view>

          <view v-if="currentItem" class="result-media-shell">
            <view class="result-media">
              <image v-if="hasDisplayImage(currentItem)" class="result-media__image" :src="currentItem.imageUrl" mode="aspectFill"></image>

              <view
                v-else
                class="result-media__placeholder"
                :style="{ background: currentItem.posterBackground || 'linear-gradient(180deg, #f5f6f8 0%, #eceef2 100%)' }"
              >
                <view class="result-media__poster-mask"></view>
                <view class="result-media__poster-copy">
                  <text class="result-media__poster-word">{{ currentItem.word }}</text>
                  <text class="result-media__poster-text">{{ currentItem.visualCueZh }}</text>
                </view>
              </view>

              <view v-if="hasDisplayImage(currentItem)" class="result-media__image-overlay"></view>

              <button v-if="canDownloadItem(currentItem)" class="card-action" @tap="downloadItem(currentItem)">
                <view class="card-action__icon">
                  <view class="card-action__line card-action__line--stem"></view>
                  <view class="card-action__line card-action__line--arm-left"></view>
                  <view class="card-action__line card-action__line--arm-right"></view>
                  <view class="card-action__line card-action__line--tray"></view>
                </view>
              </button>
            </view>
          </view>

          <view v-if="currentItem" class="result-card__foot">
            <text class="result-meaning">{{ currentItem.meaning }}</text>
            <text class="result-note">{{ currentItem.visualCueZh }}</text>
          </view>
        </view>

        <button class="arrow-btn arrow-btn--right" @tap="advance(1)">&gt;</button>
      </view>
    </view>

    <view class="results-actionbar-wrap">
      <view class="results-actionbar">
        <button class="wh-btn wh-btn--primary actionbar-btn" @tap="goReview">开始复习</button>
      </view>
    </view>
  </view>
</template>

<script>
import { getGeneratedResults } from '../../utils/wordhub-store'

export default {
  data() {
    return {
      results: [],
      currentIndex: 0,
      dragOffset: 0,
      touchStartX: 0,
      isTransitioning: false,
      keyboardHandler: null,
    }
  },
  computed: {
    currentItem() {
      return this.results[this.currentIndex] || null
    },
    progressLabel() {
      if (!this.results.length) {
        return '0 / 0'
      }
      return `${this.currentIndex + 1} / ${this.results.length}`
    },
    cardTransform() {
      return `translateX(${this.dragOffset}px) rotate(${this.dragOffset / 18}deg)`
    },
  },
  onLoad() {
    this.syncResults()
  },
  onShow() {
    this.syncResults()
  },
  mounted() {
    if (typeof window !== 'undefined') {
      this.keyboardHandler = (event) => {
        if (event.key === 'ArrowLeft') {
          this.advance(-1)
        }
        if (event.key === 'ArrowRight') {
          this.advance(1)
        }
      }
      window.addEventListener('keydown', this.keyboardHandler)
    }
  },
  beforeUnmount() {
    this.cleanup()
  },
  onUnload() {
    this.cleanup()
  },
  methods: {
    cleanup() {
      if (typeof window !== 'undefined' && this.keyboardHandler) {
        window.removeEventListener('keydown', this.keyboardHandler)
        this.keyboardHandler = null
      }
    },
    syncResults() {
      this.results = getGeneratedResults()
      if (this.currentIndex >= this.results.length) {
        this.currentIndex = 0
      }
    },
    hasDisplayImage(item) {
      return Boolean(String(item?.imageUrl || '').trim())
    },
    resolveDownloadUrl(item) {
      return String(item?.downloadUrl || item?.imageUrl || '').trim()
    },
    canDownloadItem(item) {
      return Boolean(this.resolveDownloadUrl(item) && item?.imageAsset?.directDownload !== false)
    },
    handleTouchStart(event) {
      if (this.isTransitioning || !event.touches || !event.touches.length) {
        return
      }
      this.touchStartX = event.touches[0].clientX
    },
    handleTouchMove(event) {
      if (this.isTransitioning || !event.touches || !event.touches.length) {
        return
      }
      const deltaX = event.touches[0].clientX - this.touchStartX
      this.dragOffset = Math.max(-160, Math.min(160, deltaX))
    },
    handleTouchEnd() {
      if (this.isTransitioning) {
        return
      }
      if (Math.abs(this.dragOffset) > 80) {
        this.advance(this.dragOffset > 0 ? -1 : 1)
        return
      }
      this.dragOffset = 0
    },
    advance(direction) {
      if (!this.results.length || this.isTransitioning) {
        return
      }
      this.isTransitioning = true
      this.dragOffset = direction > 0 ? -260 : 260

      setTimeout(() => {
        this.currentIndex = (this.currentIndex + direction + this.results.length) % this.results.length
        this.dragOffset = 0
        this.isTransitioning = false
      }, 220)
    },
    goBack() {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        uni.navigateBack()
        return
      }
      uni.reLaunch({
        url: '/pages/index/index',
      })
    },
    goReview() {
      uni.reLaunch({
        url: '/pages/review/index',
      })
    },
    downloadItem(item) {
      const downloadUrl = this.resolveDownloadUrl(item)
      if (!downloadUrl) {
        return
      }

      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        const link = document.createElement('a')
        link.href = downloadUrl
        link.target = '_blank'
        link.rel = 'noopener'
        link.download = `${String(item?.word || 'word').trim() || 'word'}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        return
      }

      uni.downloadFile({
        url: downloadUrl,
        success: () => {
          uni.showToast({
            title: 'Download started',
            icon: 'none',
          })
        },
        fail: () => {
          uni.showToast({
            title: 'Download failed',
            icon: 'none',
          })
        },
      })
    },
  },
}
</script>

<style scoped>
.results-page {
  padding: 28rpx 0 198rpx;
  background: var(--wh-bg);
}

.results-shell {
  max-width: 860rpx;
  min-height: calc(100vh - 226rpx);
  padding: 0 28rpx;
  display: flex;
  flex-direction: column;
}

.results-header {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 96rpx;
  padding: 14rpx 0 18rpx;
  margin-bottom: 18rpx;
}

.nav-back {
  position: absolute;
  top: 50%;
  left: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  padding: 0;
  border: 1rpx solid rgba(255, 255, 255, 0.08);
  outline: none;
  border-radius: var(--wh-btn-radius);
  background: #111111;
  color: var(--wh-accent);
  transform: translateY(-50%);
  transition: background-color 0.18s ease, color 0.18s ease, border-color 0.18s ease;
}

.nav-back__chevron {
  width: 22rpx;
  height: 22rpx;
  border-left: 4rpx solid currentColor;
  border-bottom: 4rpx solid currentColor;
  transform: rotate(45deg);
  box-sizing: border-box;
}

.results-header__brand {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 286rpx;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.results-header__logo {
  display: block;
  width: 100%;
  height: 76rpx;
  object-fit: contain;
}

.progress-pill {
  position: absolute;
  top: 50%;
  right: 24rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 50rpx;
  padding: 0 22rpx;
  border-radius: 999rpx;
  background: rgba(255, 153, 0, 0.12);
  border: 1rpx solid rgba(255, 153, 0, 0.24);
  color: var(--wh-accent-strong);
  font-size: 22rpx;
  line-height: 1;
  font-weight: 700;
  white-space: nowrap;
  transform: translateY(-50%);
}

.results-stage {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: auto;
  padding: 24rpx 0 20rpx;
}

.arrow-btn {
  display: none;
  flex-shrink: 0;
  width: 84rpx;
  height: 84rpx;
  border-radius: 50%;
  background: #111111;
  border: 1rpx solid rgba(255, 255, 255, 0.08);
  color: var(--wh-accent);
  font-size: 44rpx;
  font-weight: 700;
}

.result-card {
  width: 100%;
  border-radius: var(--wh-radius-xl);
  background: var(--wh-surface);
  border: 1rpx solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 22rpx 52rpx rgba(0, 0, 0, 0.46);
  overflow: hidden;
  transition: transform 0.22s ease;
}

.result-card__head {
  padding: 28rpx 28rpx 18rpx;
}

.result-word {
  display: block;
  font-size: 42rpx;
  line-height: 1.2;
  font-weight: 700;
  color: var(--wh-text-strong);
}

.result-media-shell {
  padding: 0 28rpx;
}

.result-media {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4;
  border-radius: var(--wh-radius-lg);
  overflow: hidden;
  background: linear-gradient(180deg, #0d0d0d 0%, #1a1a1a 100%);
}

.result-media__image {
  display: block;
  width: 100%;
  height: 100%;
}

.result-media__image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.02) 0%, rgba(0, 0, 0, 0.18) 100%);
  pointer-events: none;
}

.result-media__placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.result-media__poster-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0.74) 100%);
}

.result-media__poster-copy {
  position: absolute;
  right: 28rpx;
  bottom: 30rpx;
  left: 28rpx;
  z-index: 1;
}

.result-media__poster-word {
  display: block;
  font-size: 48rpx;
  font-weight: 800;
  color: #ffffff;
}

.result-media__poster-text {
  display: block;
  margin-top: 14rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.86);
}

.result-card__foot {
  padding: 24rpx 28rpx 30rpx;
}

.result-meaning {
  display: block;
  font-size: 26rpx;
  line-height: 1.6;
  font-weight: 700;
  color: var(--wh-text-main);
}

.result-note {
  display: block;
  margin-top: 12rpx;
  font-size: 22rpx;
  line-height: 1.75;
  color: var(--wh-text-muted);
}

.card-action {
  position: absolute;
  right: 12rpx;
  bottom: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44rpx;
  height: 44rpx;
  border-radius: var(--wh-btn-radius);
  border: 1rpx solid rgba(255, 153, 0, 0.2);
  background: rgba(17, 17, 17, 0.78);
  color: var(--wh-accent);
  opacity: 0.92;
  transition: background-color 0.22s ease, color 0.22s ease, opacity 0.22s ease, transform 0.22s ease;
}

.card-action:active {
  transform: scale(0.96);
  opacity: 1;
}

.card-action__icon {
  position: relative;
  width: 18rpx;
  height: 18rpx;
}

.card-action__line {
  position: absolute;
  border-radius: 999rpx;
  background: currentColor;
}

.card-action__line--stem {
  top: 1rpx;
  left: 8rpx;
  width: 2rpx;
  height: 8rpx;
}

.card-action__line--arm-left {
  top: 7rpx;
  left: 5rpx;
  width: 2rpx;
  height: 6rpx;
  transform: rotate(45deg);
  transform-origin: bottom center;
}

.card-action__line--arm-right {
  top: 7rpx;
  right: 5rpx;
  width: 2rpx;
  height: 6rpx;
  transform: rotate(-45deg);
  transform-origin: bottom center;
}

.card-action__line--tray {
  right: 2rpx;
  bottom: 1rpx;
  left: 2rpx;
  height: 2rpx;
}

.results-actionbar-wrap {
  position: fixed;
  left: 50%;
  bottom: 22rpx;
  width: 100%;
  max-width: var(--wh-page-max-width);
  transform: translateX(-50%);
  z-index: 24;
  display: flex;
  justify-content: center;
  padding: 0 var(--wh-page-gutter);
}

.results-actionbar {
  display: flex;
  justify-content: center;
  width: 100%;
}

.actionbar-btn {
  width: 320rpx;
  min-height: 80rpx;
  border-radius: var(--wh-btn-radius);
}

@media (hover: hover) {
  .nav-back:hover {
    border-color: rgba(255, 153, 0, 0.28);
    background: #161616;
  }

  .card-action:hover {
    background: rgba(255, 153, 0, 0.14);
    color: #ffd089;
  }
}

@media screen and (min-width: 768px) {
  .results-page {
    padding-top: 44rpx;
  }

  .results-shell {
    max-width: 100%;
    min-height: auto;
  }

  .results-header {
    min-height: 60px;
    padding: 12px 0 14px;
  }

  .nav-back {
    left: 24px;
    width: 40px;
    height: 40px;
  }

  .nav-back__chevron {
    width: 12px;
    height: 12px;
    border-left-width: 2px;
    border-bottom-width: 2px;
  }

  .results-header__brand {
    width: 192px;
  }

  .results-header__logo {
    height: 47px;
  }

  .progress-pill {
    right: 24px;
    min-height: 30px;
    padding: 0 12px;
    font-size: 12px;
  }

  .results-stage {
    margin-top: 8rpx;
    padding-top: 12rpx;
  }

  .arrow-btn {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .arrow-btn--left {
    margin-right: 18rpx;
  }

  .arrow-btn--right {
    margin-left: 18rpx;
  }

  .result-card {
    max-width: 100%;
  }
}

@media screen and (min-width: 1024px) {
  .results-header {
    padding: 12px 0 14px;
    margin-bottom: 16px;
  }

  .nav-back {
    left: 32px;
  }

  .progress-pill {
    right: 32px;
  }

  .results-shell {
    padding-left: 0;
    padding-right: 0;
  }

  .results-stage {
    margin-top: 2px;
    padding-top: 8px;
  }
}
</style>
