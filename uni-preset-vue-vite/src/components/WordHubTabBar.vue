<template>
  <view class="tabbar-wrap">
    <view
      v-for="item in tabs"
      :key="item.key"
      class="tab-item"
      :class="{ 'tab-item--active': current === item.key }"
      hover-class="tab-item--hover"
      @tap="go(item)"
    >
      <view class="tab-item__inner">
        <view class="tab-icon" :class="`tab-icon--${item.key}`">
          <template v-if="item.key === 'query'">
            <view class="icon-query__ring">
              <view class="icon-cut icon-query__ring-cut"></view>
            </view>
            <view class="icon-query__handle"></view>
          </template>

          <template v-else-if="item.key === 'review'">
            <view class="icon-review__back">
              <view class="icon-cut icon-review__back-cut"></view>
            </view>
            <view class="icon-review__front">
              <view class="icon-cut icon-review__front-cut"></view>
            </view>
          </template>

          <template v-else>
            <view class="icon-profile__head">
              <view class="icon-cut icon-profile__head-cut"></view>
            </view>
            <view class="icon-profile__body">
              <view class="icon-cut icon-profile__body-cut"></view>
            </view>
          </template>
        </view>

        <text class="tab-item__label">{{ item.label }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    current: {
      type: String,
      default: 'query',
    },
  },
  data() {
    return {
      tabs: [
        { key: 'query', label: '查询', path: '/pages/index/index' },
        { key: 'review', label: '复习', path: '/pages/review/index' },
        { key: 'profile', label: '我的', path: '/pages/profile/index' },
      ],
    }
  },
  methods: {
    go(item) {
      if (!item || item.key === this.current) {
        return
      }
      uni.reLaunch({
        url: item.path,
      })
    },
  },
}
</script>

<style scoped>
.tabbar-wrap {
  --tabbar-cut-bg: #111111;
  position: fixed;
  left: 50%;
  bottom: calc(env(safe-area-inset-bottom) + 12rpx);
  z-index: 50;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: space-between;
  width: calc(100% - 56rpx);
  max-width: 340px;
  padding: 12rpx;
  border-radius: 8rpx;
  background: rgba(10, 10, 10, 0.96);
  border: 1rpx solid rgba(255, 153, 0, 0.22);
  box-shadow: 0 16rpx 34rpx rgba(0, 0, 0, 0.55);
  transform: translateX(-50%);
  pointer-events: auto;
}

.tab-item {
  flex: 1 1 0;
  min-width: 0;
  min-height: 76rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7d7d7d;
  background: transparent;
  border: none;
  box-shadow: none;
  cursor: pointer;
  transition: color 0.2s ease, opacity 0.2s ease;
}

.tab-item--active {
  color: var(--wh-accent);
}

.tab-item--hover {
  color: #d5d5d5;
}

.tab-item__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: inherit;
  gap: 6rpx;
  width: calc(100% - 6rpx);
  padding: 10rpx 0;
  border-radius: 6rpx;
  border: 1rpx solid transparent;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.tab-item--active .tab-item__inner {
  background: rgba(255, 153, 0, 0.12);
  border-color: rgba(255, 153, 0, 0.24);
}

.tab-item__label {
  font-size: 18rpx;
  line-height: 1;
  font-weight: 700;
}

.tab-icon {
  position: relative;
  width: 32rpx;
  height: 32rpx;
}

.icon-cut {
  position: absolute;
  background: var(--tabbar-cut-bg);
}

.icon-query__ring {
  position: absolute;
  top: 3rpx;
  left: 3rpx;
  width: 18rpx;
  height: 18rpx;
  border-radius: 50%;
  background: currentColor;
}

.icon-query__ring-cut {
  top: 4rpx;
  left: 4rpx;
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
}

.icon-query__handle {
  position: absolute;
  right: 4rpx;
  bottom: 5rpx;
  width: 10rpx;
  height: 3rpx;
  border-radius: 999rpx;
  background: currentColor;
  transform: rotate(45deg);
  transform-origin: center;
}

.icon-review__back,
.icon-review__front {
  position: absolute;
  border-radius: 10rpx;
  background: currentColor;
}

.icon-review__back {
  top: 5rpx;
  left: 4rpx;
  width: 15rpx;
  height: 12rpx;
  opacity: 0.55;
}

.icon-review__front {
  right: 4rpx;
  bottom: 4rpx;
  width: 17rpx;
  height: 14rpx;
}

.icon-review__back-cut {
  top: 3rpx;
  left: 3rpx;
  width: 9rpx;
  height: 6rpx;
  border-radius: 5rpx;
}

.icon-review__front-cut {
  top: 3rpx;
  left: 3rpx;
  width: 11rpx;
  height: 8rpx;
  border-radius: 5rpx;
}

.icon-profile__head,
.icon-profile__body {
  position: absolute;
  left: 50%;
  background: currentColor;
  transform: translateX(-50%);
}

.icon-profile__head {
  top: 3rpx;
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
}

.icon-profile__head-cut {
  top: 3rpx;
  left: 3rpx;
  width: 6rpx;
  height: 6rpx;
  border-radius: 50%;
}

.icon-profile__body {
  bottom: 3rpx;
  width: 20rpx;
  height: 12rpx;
  border-radius: 14rpx 14rpx 8rpx 8rpx;
}

.icon-profile__body-cut {
  right: 3rpx;
  bottom: 3rpx;
  left: 3rpx;
  height: 6rpx;
  border-radius: 7rpx 7rpx 5rpx 5rpx;
}

@media (hover: hover) {
  .tab-item:hover {
    color: #d5d5d5;
  }

  .tab-item--active:hover {
    color: var(--wh-accent);
  }
}

@media screen and (min-width: 1024px) {
  .tabbar-wrap {
    bottom: 24px;
    width: calc(100% - 40px);
    max-width: 332px;
    padding: 8px;
    border-width: 1px;
  }

  .tab-item {
    min-height: 52px;
  }

  .tab-item__inner {
    gap: 4px;
    padding: 7px 0;
  }

  .tab-item__label {
    font-size: 10px;
  }

  .tab-icon {
    width: 18px;
    height: 18px;
  }

  .icon-query__ring {
    top: 2px;
    left: 2px;
    width: 11px;
    height: 11px;
  }

  .icon-query__ring-cut {
    top: 2px;
    left: 2px;
    width: 7px;
    height: 7px;
  }

  .icon-query__handle {
    right: 2px;
    bottom: 3px;
    width: 7px;
    height: 2px;
  }

  .icon-review__back {
    top: 2px;
    left: 2px;
    width: 9px;
    height: 7px;
    border-radius: 5px;
  }

  .icon-review__front {
    right: 2px;
    bottom: 2px;
    width: 10px;
    height: 8px;
    border-radius: 5px;
  }

  .icon-review__back-cut {
    top: 2px;
    left: 2px;
    width: 5px;
    height: 3px;
    border-radius: 3px;
  }

  .icon-review__front-cut {
    top: 2px;
    left: 2px;
    width: 6px;
    height: 4px;
    border-radius: 3px;
  }

  .icon-profile__head {
    top: 1px;
    width: 7px;
    height: 7px;
  }

  .icon-profile__head-cut {
    top: 2px;
    left: 2px;
    width: 3px;
    height: 3px;
  }

  .icon-profile__body {
    bottom: 1px;
    width: 12px;
    height: 8px;
    border-radius: 8px 8px 5px 5px;
  }

  .icon-profile__body-cut {
    right: 2px;
    bottom: 2px;
    left: 2px;
    height: 4px;
    border-radius: 4px 4px 3px 3px;
  }
}
</style>
