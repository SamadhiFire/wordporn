<template>
  <view class="wh-page-host">
    <view class="wh-page review-page" :style="pageBackgroundStyle">
      <view class="wh-shell review-shell">
        <view class="review-header">
          <image class="review-header__logo" src="/static/wordhubporm.png" mode="heightFix"></image>
          <view class="progress-pill">{{ progressLabel }}</view>
        </view>

        <view class="review-body">
          <view class="review-body__content">
            <view class="review-stage">
              <button class="arrow-btn arrow-btn--left" :disabled="isInteractionLocked || !deck.length" @tap="advance(-1)">
                <text>&lt;</text>
              </button>

              <view
                class="review-delete-zone"
                :class="{
                  'review-delete-zone--visible': isDeleteCueVisible,
                  'review-delete-zone--ready': isDeleteReady,
                }"
                :style="deleteCueStyle"
              >
                <view class="review-delete-zone__glow"></view>
                <text class="review-delete-zone__label">{{ isDeleteReady ? '🗑️ 释放删除' : '🗑️ 上滑移出复习库' }}</text>
              </view>

              <view
                class="review-card"
                :class="{ 'review-card--delete-ready': isDeleteReady }"
                :style="cardMotionStyle"
                @touchstart="handleTouchStart"
                @touchmove.stop.prevent="handleTouchMove"
                @touchend="handleTouchEnd"
                @touchcancel="handleTouchEnd"
                @mousedown.prevent="handlePointerStart"
                @mousemove="handlePointerMove"
                @mouseup="handlePointerEnd"
                @mouseleave="handlePointerEnd"
              >
                <view v-if="currentItem" class="review-card__body">
                  <view class="image-mode">
                    <view class="image-mode__frame">
                      <view class="image-mode__visual">
                        <view class="image-mode__media" :style="visualStyle(currentItem)"></view>
                        <view class="image-mode__overlay"></view>
                        <view class="image-mode__content">
                          <text class="image-mode__word">{{ displayWord(currentItem) }}</text>
                          <text class="image-mode__cue">{{ currentItem.visualCueZh }}</text>
                        </view>
                      </view>
                    </view>
                  </view>
                </view>

                <view v-else class="review-card__body review-card__body--empty">
                  <view class="review-empty-card">
                    <text class="review-empty-card__title">复习库已清空</text>
                    <text class="review-empty-card__hint">回到结果页继续生成，新的单词会自动加入这里。</text>
                  </view>
                </view>
              </view>

              <button class="arrow-btn arrow-btn--right" :disabled="isInteractionLocked || !deck.length" @tap="advance(1)">
                <text>&gt;</text>
              </button>
            </view>

            <view v-if="currentItem" class="choice-grid">
              <button
                v-for="choice in currentChoices"
                :key="choice"
                class="choice-btn"
                :class="choiceClass(choice)"
                :disabled="isInteractionLocked"
                @tap="selectChoice(choice)"
              >
                {{ choice }}
              </button>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view v-if="deleteToastVisible" class="review-toast">
      <text class="review-toast__text">🗑️ 已移出复习库</text>
    </view>

    <WordHubTabBar current="review" />
  </view>
</template>

<script>
import WordHubTabBar from '../../components/WordHubTabBar.vue'
import { getReviewDeck, recordReviewResult, removeReviewDeckItem, isLoggedIn, fetchMyReviewDeck } from '../../utils/wordhub-store'

const GESTURE_LOCK_THRESHOLD = 10
const HORIZONTAL_SWITCH_THRESHOLD = 80
const DELETE_FLICK_VELOCITY = -1.05
const DEFAULT_CARD_HEIGHT = 520
const DELETE_DISMISS_DURATION = 240
const SPRING_BACK_DURATION = 460
const CARD_ENTRY_DURATION = 260
const CARD_ENTRY_SCALE = 0.95

export default {
  components: {
    WordHubTabBar,
  },
  data() {
    return {
      deck: [],
      currentIndex: 0,
      answerStatus: 'unanswered',
      selectedChoice: '',
      dragOffsetX: 0,
      dragOffsetY: 0,
      touchStartX: 0,
      touchStartY: 0,
      lastPointerX: 0,
      lastPointerY: 0,
      lastDragTime: 0,
      dragVelocityY: 0,
      gestureAxis: '',
      isDraggingPointer: false,
      isTransitioning: false,
      isDeletingCard: false,
      cardHeight: 0,
      cardScale: 1,
      cardBaseOpacity: 1,
      cardTransition: '',
      answerTimer: null,
      deleteTimer: null,
      entryAnimationTimer: null,
      toastTimer: null,
      deleteToastVisible: false,
      keyboardHandler: null,
    }
  },
  computed: {
    currentItem() {
      return this.deck[this.currentIndex] || null
    },
    progressLabel() {
      if (!this.deck.length) {
        return '0 / 0'
      }
      return `${this.currentIndex + 1} / ${this.deck.length}`
    },
    currentChoices() {
      return this.currentItem && Array.isArray(this.currentItem.choices) ? this.currentItem.choices : []
    },
    pageBackgroundStyle() {
      const imageUrl = String(this.currentItem?.imageUrl || '').trim()
      const posterBackground = String(this.currentItem?.posterBackground || '').trim()
      const safeImageUrl = imageUrl.replace(/(["\\])/g, '\\$1')

      return {
        '--review-backdrop-layer': safeImageUrl
          ? `url("${safeImageUrl}")`
          : (posterBackground || 'linear-gradient(180deg, #f3ebff 0%, #eef4ff 100%)'),
      }
    },
    deleteThreshold() {
      const sourceHeight = this.cardHeight || DEFAULT_CARD_HEIGHT
      return Math.max(120, Math.round(sourceHeight * 0.25))
    },
    deleteProgress() {
      return Math.min(1, Math.abs(Math.min(0, this.dragOffsetY)) / this.deleteThreshold)
    },
    isDeleteCueVisible() {
      return Boolean(this.currentItem && (this.gestureAxis === 'delete' || this.dragOffsetY < -4))
    },
    isDeleteReady() {
      return this.deleteProgress >= 1 || this.dragVelocityY <= DELETE_FLICK_VELOCITY
    },
    cardMotionStyle() {
      const rotation = this.gestureAxis === 'horizontal' ? this.dragOffsetX / 18 : 0
      const deleteOpacity = 1 - this.deleteProgress * 0.5
      const opacity = Math.max(0, Math.min(this.cardBaseOpacity, deleteOpacity))
      const style = {
        transform: `translate3d(${this.dragOffsetX}px, ${this.dragOffsetY}px, 0) rotate(${rotation}deg) scale(${this.cardScale})`,
        opacity,
        willChange: this.isDraggingPointer || this.isTransitioning ? 'transform, opacity' : 'auto',
      }
      if (this.cardTransition) {
        style.transition = this.cardTransition
      }
      return style
    },
    deleteCueStyle() {
      const progress = this.isDeleteCueVisible ? Math.max(0.18, this.deleteProgress) : 0
      return {
        opacity: progress,
        transform: `translateY(${(1 - this.deleteProgress) * 12}px) scale(${0.98 + this.deleteProgress * 0.02})`,
      }
    },
    isInteractionLocked() {
      return this.isTransitioning || this.answerStatus !== 'unanswered'
    },
  },
  onLoad() {
    this.syncDeck()
  },
  onShow() {
    this.syncDeck()
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
    this.measureCardHeight()
  },
  beforeUnmount() {
    this.cleanup()
  },
  onUnload() {
    this.cleanup()
  },
  methods: {
    cleanup() {
      this.clearAnswerTimer()
      this.clearDeleteTimer()
      this.clearEntryAnimationTimer()
      this.clearToastTimer()
      if (typeof window !== 'undefined' && this.keyboardHandler) {
        window.removeEventListener('keydown', this.keyboardHandler)
        this.keyboardHandler = null
      }
    },
    clearAnswerTimer() {
      if (this.answerTimer) {
        clearTimeout(this.answerTimer)
        this.answerTimer = null
      }
    },
    clearDeleteTimer() {
      if (this.deleteTimer) {
        clearTimeout(this.deleteTimer)
        this.deleteTimer = null
      }
    },
    clearEntryAnimationTimer() {
      if (this.entryAnimationTimer) {
        clearTimeout(this.entryAnimationTimer)
        this.entryAnimationTimer = null
      }
    },
    clearToastTimer() {
      if (this.toastTimer) {
        clearTimeout(this.toastTimer)
        this.toastTimer = null
      }
    },
    showDeleteToast() {
      this.clearToastTimer()
      this.deleteToastVisible = true
      this.toastTimer = setTimeout(() => {
        this.deleteToastVisible = false
      }, 2000)
    },
    resetAnswerState() {
      this.answerStatus = 'unanswered'
      this.selectedChoice = ''
    },
    resetGestureState() {
      this.dragOffsetX = 0
      this.dragOffsetY = 0
      this.dragVelocityY = 0
      this.gestureAxis = ''
      this.isDraggingPointer = false
    },
    resetCardPresentation() {
      this.cardScale = 1
      this.cardBaseOpacity = 1
      this.cardTransition = ''
      this.isDeletingCard = false
    },
    async syncDeck() {
      this.deck = getReviewDeck()
      if (isLoggedIn() && !this.deck.length) {
        try {
          const result = await fetchMyReviewDeck()
          this.deck = result.cards || []
        } catch (_) {}
      }
      if (this.currentIndex >= this.deck.length) {
        this.currentIndex = Math.max(0, this.deck.length - 1)
      }
      this.resetAnswerState()
      this.resetGestureState()
      this.resetCardPresentation()
      this.isTransitioning = false
      this.$nextTick(() => {
        this.measureCardHeight()
      })
    },
    measureCardHeight() {
      this.$nextTick(() => {
        const query = uni.createSelectorQuery().in(this)
        query.select('.review-card').boundingClientRect((rect) => {
          if (rect && rect.height) {
            this.cardHeight = rect.height
          }
        }).exec()
      })
    },
    displayWord(item) {
      const source = String(item?.word || '').trim()
      if (!source) {
        return ''
      }
      const latinOnly = source
        .replace(/[\u4e00-\u9fff].*$/u, '')
        .replace(/[（(].*$/, '')
        .replace(/[：:｜|].*$/, '')
        .trim()
      return latinOnly || source
    },
    visualStyle(item) {
      const imageUrl = String(item?.imageUrl || '').trim()
      if (imageUrl) {
        const safeUrl = imageUrl.replace(/"/g, '\\"')
        return {
          backgroundImage: `url("${safeUrl}")`,
          backgroundColor: '#dbe5ff',
        }
      }
      return {
        background: item?.posterBackground || 'linear-gradient(180deg, #eef2ff 0%, #dbe5ff 100%)',
      }
    },
    applyDeleteDamping(distance) {
      if (!distance) {
        return 0
      }
      return Math.min(280, distance * 0.52 + Math.sqrt(distance) * 8)
    },
    beginDrag(pointX, pointY) {
      if (this.isInteractionLocked || !this.currentItem) {
        return
      }
      this.clearEntryAnimationTimer()
      this.cardTransition = 'none'
      this.isDraggingPointer = true
      this.touchStartX = pointX
      this.touchStartY = pointY
      this.lastPointerX = pointX
      this.lastPointerY = pointY
      this.lastDragTime = Date.now()
      this.dragVelocityY = 0
      this.gestureAxis = ''
    },
    updateDrag(pointX, pointY) {
      if (this.isInteractionLocked || !this.isDraggingPointer || !this.currentItem) {
        return
      }

      const now = Date.now()
      const deltaTime = Math.max(16, now - this.lastDragTime)
      this.dragVelocityY = (pointY - this.lastPointerY) / deltaTime
      this.lastPointerX = pointX
      this.lastPointerY = pointY
      this.lastDragTime = now

      const rawDeltaX = pointX - this.touchStartX
      const rawDeltaY = pointY - this.touchStartY

      if (!this.gestureAxis) {
        const movement = Math.max(Math.abs(rawDeltaX), Math.abs(rawDeltaY))
        if (movement < GESTURE_LOCK_THRESHOLD) {
          return
        }

        if (rawDeltaY < 0 && Math.abs(rawDeltaY) > Math.abs(rawDeltaX) * 1.08) {
          this.gestureAxis = 'delete'
        } else if (Math.abs(rawDeltaX) >= Math.abs(rawDeltaY)) {
          this.gestureAxis = 'horizontal'
        } else {
          return
        }
      }

      if (this.gestureAxis === 'delete') {
        const upwardDistance = Math.max(0, -rawDeltaY)
        this.dragOffsetX = 0
        this.dragOffsetY = -this.applyDeleteDamping(upwardDistance)
        return
      }

      this.dragOffsetY = 0
      this.dragOffsetX = Math.max(-160, Math.min(160, rawDeltaX))
    },
    springBackCard() {
      this.isTransitioning = true
      this.cardTransition = `transform ${SPRING_BACK_DURATION}ms cubic-bezier(0.22, 1.25, 0.36, 1), opacity 320ms ease`
      this.dragOffsetX = 0
      this.dragOffsetY = 0
      this.cardScale = 1
      this.cardBaseOpacity = 1
      this.gestureAxis = ''
      this.isDraggingPointer = false
      this.dragVelocityY = 0

      this.clearEntryAnimationTimer()
      this.entryAnimationTimer = setTimeout(() => {
        this.cardTransition = ''
        this.isTransitioning = false
      }, SPRING_BACK_DURATION)
    },
    dismissCurrentCard() {
      if (!this.currentItem || this.isDeletingCard) {
        return
      }

      const deletingItem = this.currentItem
      this.isTransitioning = true
      this.isDeletingCard = true
      this.isDraggingPointer = false
      this.gestureAxis = 'delete'
      this.cardTransition = `transform ${DELETE_DISMISS_DURATION}ms cubic-bezier(0.18, 0.84, 0.24, 1), opacity 180ms ease-out`
      this.dragOffsetX = 0
      this.dragOffsetY = -Math.max((this.cardHeight || DEFAULT_CARD_HEIGHT) + 160, 680)
      this.cardScale = 0.985
      this.cardBaseOpacity = 0

      this.clearDeleteTimer()
      this.deleteTimer = setTimeout(() => {
        this.finishDelete(deletingItem)
      }, DELETE_DISMISS_DURATION)
    },
    finishDelete(deletingItem) {
      const nextDeck = removeReviewDeckItem(deletingItem)
      this.deck = nextDeck
      if (this.currentIndex >= nextDeck.length) {
        this.currentIndex = Math.max(0, nextDeck.length - 1)
      }
      this.resetAnswerState()
      this.showDeleteToast()

      if (!nextDeck.length) {
        this.resetGestureState()
        this.resetCardPresentation()
        this.isTransitioning = false
        this.measureCardHeight()
        return
      }

      this.resetGestureState()
      this.cardScale = CARD_ENTRY_SCALE
      this.cardBaseOpacity = 0.92
      this.cardTransition = 'none'

      this.$nextTick(() => {
        const runFrame = typeof requestAnimationFrame === 'function'
          ? requestAnimationFrame
          : (callback) => setTimeout(callback, 16)

        runFrame(() => {
          this.cardTransition = `transform ${CARD_ENTRY_DURATION}ms cubic-bezier(0.16, 1, 0.3, 1), opacity ${CARD_ENTRY_DURATION}ms ease`
          this.cardScale = 1
          this.cardBaseOpacity = 1
          this.clearEntryAnimationTimer()
          this.entryAnimationTimer = setTimeout(() => {
            this.cardTransition = ''
            this.isDeletingCard = false
            this.isTransitioning = false
            this.measureCardHeight()
          }, CARD_ENTRY_DURATION)
        })
      })
    },
    handleTouchStart(event) {
      if (!event.touches || !event.touches.length) {
        return
      }
      this.beginDrag(event.touches[0].clientX, event.touches[0].clientY)
    },
    handleTouchMove(event) {
      if (!event.touches || !event.touches.length) {
        return
      }
      this.updateDrag(event.touches[0].clientX, event.touches[0].clientY)
    },
    handleTouchEnd() {
      this.finishDrag()
    },
    handlePointerStart(event) {
      this.beginDrag(event.clientX, event.clientY)
    },
    handlePointerMove(event) {
      this.updateDrag(event.clientX, event.clientY)
    },
    handlePointerEnd() {
      this.finishDrag()
    },
    finishDrag() {
      if (!this.isDraggingPointer) {
        return
      }

      this.isDraggingPointer = false
      if (this.gestureAxis === 'delete' && this.currentItem) {
        const shouldDelete = Math.abs(this.dragOffsetY) >= this.deleteThreshold || this.dragVelocityY <= DELETE_FLICK_VELOCITY
        if (shouldDelete) {
          this.dismissCurrentCard()
          return
        }
        this.springBackCard()
        return
      }

      if (this.gestureAxis === 'horizontal' && Math.abs(this.dragOffsetX) > HORIZONTAL_SWITCH_THRESHOLD) {
        this.advance(this.dragOffsetX > 0 ? -1 : 1)
        return
      }

      this.springBackCard()
    },
    choiceClass(choice) {
      if (!this.currentItem || this.answerStatus === 'unanswered') {
        return []
      }

      const isSelected = choice === this.selectedChoice
      const isCorrect = choice === this.currentItem.meaning

      if (this.answerStatus === 'correct') {
        if (isSelected && isCorrect) {
          return ['bg-green-500', 'text-white', 'scale-105', 'transition-all', 'duration-300']
        }
        return ['opacity-50', 'grayscale']
      }

      if (isSelected && !isCorrect) {
        return ['bg-red-500', 'text-white', 'shake', 'transition-all', 'duration-300']
      }

      if (isCorrect) {
        return ['bg-green-500', 'text-white', 'ring-2', 'ring-green-300', 'transition-all', 'duration-300']
      }

      return ['opacity-50']
    },
    selectChoice(choice) {
      if (!this.currentItem || this.isInteractionLocked) {
        return
      }

      const correct = choice === this.currentItem.meaning
      this.selectedChoice = choice
      this.answerStatus = correct ? 'correct' : 'incorrect'
      recordReviewResult(correct)
      this.clearAnswerTimer()

      this.answerTimer = setTimeout(() => {
        this.advance(1, true)
      }, correct ? 800 : 1500)
    },
    advance(direction, force = false) {
      if (!this.deck.length || this.isTransitioning) {
        return
      }
      if (this.answerStatus !== 'unanswered' && !force) {
        return
      }

      this.isTransitioning = true
      this.clearAnswerTimer()
      this.clearEntryAnimationTimer()
      this.cardTransition = 'transform 220ms ease, opacity 220ms ease'
      this.dragOffsetX = direction > 0 ? -260 : 260
      this.dragOffsetY = 0
      this.cardScale = 1
      this.cardBaseOpacity = 1

      this.entryAnimationTimer = setTimeout(() => {
        const nextIndex = (this.currentIndex + direction + this.deck.length) % this.deck.length
        this.currentIndex = nextIndex
        this.resetAnswerState()
        this.resetGestureState()
        this.resetCardPresentation()
        this.isTransitioning = false
        this.measureCardHeight()
      }, 220)
    },
  },
}
</script>

<style scoped>
.review-page {
  position: relative;
  min-height: 100vh;
  height: auto;
  padding: 24px var(--wh-page-gutter) 136px;
  background: var(--wh-bg);
  isolation: isolate;
  overflow: visible;
}

.review-page::before,
.review-page::after {
  display: none;
}

.review-shell {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 540px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-header {
  position: relative;
  z-index: 24;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
  padding: 0 10px;
  background: transparent;
}

.review-header__logo {
  width: auto;
  height: clamp(38px, 10vw, 54px);
  object-fit: contain;
  vertical-align: middle;
}

.progress-pill {
  min-height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(255, 153, 0, 0.12);
  border: 1px solid rgba(255, 153, 0, 0.24);
  color: var(--wh-accent-strong);
  font-size: clamp(13px, 3vw, 16px);
  line-height: 34px;
  font-weight: 700;
  text-align: center;
}

.review-body {
  display: block;
  background: transparent;
  overflow: visible;
  padding-bottom: 0;
  padding-top: 0;
}

.review-body__content {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 0;
}

.review-stage {
  position: relative;
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
  padding: 0 10px;
}

.arrow-btn {
  position: absolute;
  top: 50%;
  z-index: 3;
  display: none;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  margin-top: -21px;
  border-radius: 50%;
  background: #111111;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--wh-accent);
  font-size: 22px;
  font-weight: 700;
}

.arrow-btn--left {
  left: 0;
}

.arrow-btn--right {
  right: 0;
}

.arrow-btn[disabled] {
  opacity: 0.35;
}

.review-delete-zone {
  position: absolute;
  right: 24px;
  bottom: 10px;
  left: 24px;
  z-index: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  min-height: 96px;
  padding: 0 20px 18px;
  border-radius: var(--wh-btn-radius);
  background: linear-gradient(180deg, rgba(255, 90, 79, 0) 0%, rgba(255, 90, 79, 0.12) 46%, rgba(72, 13, 10, 0.82) 100%);
  pointer-events: none;
  opacity: 0;
  transform: translateY(12px) scale(0.98);
  transition: opacity 0.18s ease, transform 0.22s ease;
  overflow: hidden;
}

.review-delete-zone__glow {
  position: absolute;
  right: 16%;
  bottom: 8px;
  left: 16%;
  height: 42px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(255, 90, 79, 0.52) 0%, rgba(255, 90, 79, 0.16) 48%, rgba(255, 90, 79, 0) 100%);
  filter: blur(18px);
}

.review-delete-zone__label {
  position: relative;
  z-index: 1;
  font-size: 14px;
  line-height: 1;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: rgba(255, 245, 245, 0.92);
}

.review-delete-zone--ready .review-delete-zone__label {
  color: #ffffff;
}

.review-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  border-radius: var(--wh-radius-xl);
  background: transparent;
  border: none;
  box-shadow: none;
  overflow: visible;
  touch-action: none;
  transition: transform 0.22s ease, opacity 0.22s ease;
}

.review-card--delete-ready .image-mode__frame {
  border-color: rgba(255, 90, 79, 0.28);
  box-shadow: 0 18px 38px rgba(63, 15, 12, 0.3);
}

.review-card__body {
  width: 100%;
  padding: 0;
}

.review-card__body--empty {
  min-height: 520px;
}

.review-empty-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: inherit;
  padding: 28px;
  border-radius: var(--wh-radius-xl);
  background: var(--wh-surface);
  border: 1px solid rgba(255, 255, 255, 0.08);
  text-align: center;
}

.review-empty-card__title {
  font-size: clamp(24px, 6vw, 30px);
  line-height: 1.15;
  font-weight: 800;
  color: var(--wh-text-strong);
}

.review-empty-card__hint {
  margin-top: 12px;
  font-size: clamp(14px, 3.6vw, 16px);
  line-height: 1.7;
  color: var(--wh-text-muted);
}

.image-mode {
  display: block;
  width: 100%;
}

.image-mode__frame {
  position: relative;
  width: 100%;
  padding: 14px;
  border-radius: var(--wh-radius-xl);
  background: var(--wh-surface);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 24px 50px rgba(0, 0, 0, 0.42);
  transition: box-shadow 0.22s ease, border-color 0.22s ease;
}

.image-mode__visual {
  position: relative;
  width: 100%;
  max-width: 392px;
  aspect-ratio: 3 / 4;
  margin: 0 auto;
  border-radius: var(--wh-radius-lg);
  overflow: hidden;
  background: linear-gradient(180deg, #0f0f0f 0%, #1b1b1b 100%);
  box-shadow: 0 20px 42px rgba(0, 0, 0, 0.45);
}

.image-mode__media {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  transform: scale(1.02);
  filter: saturate(0.96) contrast(0.99);
}

.image-mode__overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.06) 0%, rgba(0, 0, 0, 0.14) 42%, rgba(0, 0, 0, 0.84) 100%);
}

.image-mode__content {
  position: absolute;
  right: 34px;
  bottom: 28px;
  left: 34px;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}

.image-mode__word {
  display: block;
  font-size: clamp(34px, 9vw, 44px);
  line-height: 1.02;
  font-weight: 800;
  color: #ffffff;
  text-shadow: 0 8px 24px rgba(0, 0, 0, 0.36);
}

.image-mode__cue {
  display: block;
  font-size: clamp(14px, 3.8vw, 17px);
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.88);
  text-shadow: 0 6px 16px rgba(0, 0, 0, 0.28);
}

.choice-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-auto-rows: minmax(58px, auto);
  gap: 10px;
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
  padding: 0 10px;
  background: transparent;
  box-shadow: none;
}

.choice-btn {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  min-height: 58px;
  padding: 12px 14px;
  border-radius: var(--wh-btn-radius);
  background: var(--wh-surface);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--wh-text-main);
  font-size: clamp(14px, 3vw, 16px);
  line-height: 1.35;
  font-weight: 600;
  text-align: left;
  transition: all 0.2s ease;
  transform-origin: center;
}

.choice-btn[disabled] {
  opacity: 1;
}

.bg-green-500 {
  background: #1f7a42;
  border-color: #30c267;
}

.bg-red-500 {
  background: #6f1f1a;
  border-color: #ff5a4f;
}

.text-white {
  color: #ffffff;
}

.scale-105 {
  transform: scale(1.05);
}

.transition-all {
  transition-property: all;
}

.duration-300 {
  transition-duration: 0.3s;
}

.opacity-50 {
  opacity: 0.5;
}

.grayscale {
  filter: grayscale(1);
}

.ring-2 {
  box-shadow: 0 0 0 4rpx rgba(48, 194, 103, 0.55);
}

.ring-green-300 {
  border-color: #30c267;
}

.shake {
  animation: choice-shake 0.42s ease-in-out;
}

.review-toast {
  position: fixed;
  top: 88px;
  left: 50%;
  z-index: 120;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 0 18px;
  border-radius: 999px;
  background: #111111;
  border: 1px solid rgba(255, 153, 0, 0.2);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.32);
  transform: translateX(-50%);
  animation: review-toast-fade 2s both;
}

.review-toast__text {
  font-size: 14px;
  line-height: 1;
  font-weight: 700;
  color: var(--wh-accent-strong);
  letter-spacing: 0.01em;
}

@keyframes choice-shake {
  0%,
  100% {
    transform: translateX(0);
  }

  20% {
    transform: translateX(-10rpx);
  }

  40% {
    transform: translateX(8rpx);
  }

  60% {
    transform: translateX(-6rpx);
  }

  80% {
    transform: translateX(4rpx);
  }
}

@keyframes review-toast-fade {
  0% {
    opacity: 0;
    transform: translate(-50%, -8px) scale(0.96);
  }

  14% {
    opacity: 1;
    transform: translate(-50%, 0) scale(1);
  }

  84% {
    opacity: 1;
    transform: translate(-50%, 0) scale(1);
  }

  100% {
    opacity: 0;
    transform: translate(-50%, -4px) scale(0.98);
  }
}

@media screen and (max-width: 420px) {
  .review-page {
    padding-bottom: 116px;
  }

  .review-shell {
    gap: 12px;
  }

  .review-stage,
  .choice-grid,
  .review-header {
    padding-right: 6px;
    padding-left: 6px;
  }

  .review-delete-zone {
    right: 16px;
    bottom: 8px;
    left: 16px;
    min-height: 88px;
    padding-bottom: 16px;
    border-radius: var(--wh-radius-lg);
  }

  .image-mode__frame {
    padding: 12px;
    border-radius: var(--wh-radius-lg);
  }

  .image-mode__visual {
    border-radius: var(--wh-radius-md);
  }

  .image-mode__content {
    right: 28px;
    bottom: 24px;
    left: 28px;
  }

  .choice-grid {
    gap: 8px;
  }

  .choice-btn {
    min-height: 54px;
    padding: 10px 12px;
    border-radius: var(--wh-btn-radius);
    font-size: 13px;
  }

  .review-toast {
    top: 78px;
  }
}

@media screen and (min-width: 1024px) {
  .review-page {
    min-height: 100vh;
    height: auto;
    padding: 28px var(--wh-page-gutter) 148px;
    isolation: isolate;
    overflow: visible;
  }

  .review-shell {
    max-width: 620px;
  }

  .review-header {
    max-width: 620px;
    padding: 0 56px;
  }

  .review-header__logo {
    height: 54px;
  }

  .review-stage {
    max-width: 620px;
    padding: 0 56px;
  }

  .arrow-btn {
    display: flex;
  }

  .review-card {
    max-width: 508px;
  }

  .review-delete-zone {
    right: 56px;
    left: 56px;
  }

  .image-mode__frame {
    padding: 16px;
    border-radius: var(--wh-radius-xl);
  }

  .image-mode__visual {
    max-width: 404px;
    border-radius: var(--wh-radius-lg);
  }

  .image-mode__content {
    right: 40px;
    bottom: 32px;
    left: 40px;
  }

  .image-mode__word {
    font-size: 46px;
  }

  .image-mode__cue {
    font-size: 18px;
  }

  .choice-grid {
    max-width: 508px;
    padding: 0;
    gap: 12px;
  }

  .choice-btn {
    min-height: 60px;
    padding: 14px 16px;
    font-size: 16px;
    border-radius: var(--wh-btn-radius);
  }

  .review-toast {
    top: 84px;
  }
}
</style>
