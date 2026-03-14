<template>
  <view class="wh-page-host">
    <view class="wh-page profile-page">
      <view class="wh-shell">
        <view class="profile-stack">
          <button class="profile-hero wh-card" :class="{ 'profile-hero--guest': !isLoggedIn }" @tap="handleHeroTap">
            <view v-if="isLoggedIn" class="avatar">{{ user.avatar }}</view>
            <view v-else class="avatar avatar--guest">
              <view class="avatar-ghost__head"></view>
              <view class="avatar-ghost__body"></view>
            </view>

            <view class="profile-copy">
              <text class="profile-name">{{ isLoggedIn ? user.nickname : '点击登录 / 注册' }}</text>
              <text class="profile-hint">{{ isLoggedIn ? (user.email || '已连接后端账号') : '登录后同步模型配置与生成历史' }}</text>
            </view>
          </button>

          <view class="profile-card wh-card" :class="{ 'profile-card--locked': !isLoggedIn }">
            <view class="profile-card__body">
              <view class="profile-card__head">
                <text class="profile-card__title">大模型配置</text>
                <text v-if="isLoggedIn && modelConfigUpdatedAtLabel" class="profile-card__meta">{{ modelConfigUpdatedAtLabel }}</text>
              </view>

              <view class="config-group">
                <text class="config-group__title">文字模型</text>
                <view class="config-tabs">
                  <button
                    v-for="provider in textProviders"
                    :key="`text-${provider}`"
                    class="config-tab"
                    :class="{ 'config-tab--active': aiConfig.textProvider === provider }"
                    :disabled="!isLoggedIn || isSavingConfig || isSyncingProfile"
                    @tap="selectTextProvider(provider)"
                  >
                    {{ providerMeta[provider].label }}
                  </button>
                </view>
                <input
                  class="wh-input config-input"
                  :disabled="!isLoggedIn || isSavingConfig || isSyncingProfile"
                  password
                  :value="aiConfig.textApiKey"
                  placeholder="重新输入才会覆盖旧 Key"
                  @input="handleTextKeyInput"
                />
                <text class="config-help">{{ textKeyStatus }}</text>
                <text class="config-link">{{ currentTextProviderMeta.baseUrl }}</text>
              </view>

              <view class="config-row">
                <text class="config-row__label">图片跟随文字模型</text>
                <button
                  class="config-toggle"
                  :class="{ 'config-toggle--active': aiConfig.imageLinked }"
                  :disabled="!isLoggedIn || isSavingConfig || isSyncingProfile"
                  @tap="toggleImageLinked"
                >
                  {{ aiConfig.imageLinked ? '已开启' : '已关闭' }}
                </button>
              </view>

              <view class="config-group">
                <text class="config-group__title">图片模型</text>
                <view class="config-tabs">
                  <button
                    v-for="provider in imageProviders"
                    :key="`image-${provider}`"
                    class="config-tab"
                    :class="{ 'config-tab--active': aiConfig.imageProvider === provider }"
                    :disabled="!isLoggedIn || aiConfig.imageLinked || isSavingConfig || isSyncingProfile"
                    @tap="selectImageProvider(provider)"
                  >
                    {{ providerMeta[provider].label }}
                  </button>
                </view>
                <input
                  class="wh-input config-input"
                  :disabled="!isLoggedIn || aiConfig.imageLinked || isSavingConfig || isSyncingProfile"
                  password
                  :value="aiConfig.imageApiKey"
                  :placeholder="aiConfig.imageLinked ? '当前已联动，无需单独填写' : '重新输入才会覆盖旧 Key'"
                  @input="handleImageKeyInput"
                />
                <text class="config-help">{{ imageKeyStatus }}</text>
                <text class="config-link">{{ currentImageProviderMeta.baseUrl }}</text>
              </view>

              <button class="wh-btn wh-btn--primary profile-save" :disabled="!isLoggedIn || isSavingConfig || isSyncingProfile" @tap="saveConfig">
                {{ isSavingConfig ? '保存中...' : '保存配置' }}
              </button>
            </view>

            <button v-if="!isLoggedIn" class="profile-lock" @tap="openAuthModal">
              <text class="profile-lock__title">登录后配置 AI</text>
              <text class="profile-lock__hint">同步 token、模型配置和历史记录</text>
            </button>
          </view>

          <button v-if="isLoggedIn" class="wh-btn profile-logout" :disabled="isLoggingOut" @tap="logout">
            {{ isLoggingOut ? '退出中...' : '退出登录' }}
          </button>
        </view>
      </view>
    </view>

    <view v-if="showAuthModal" class="auth-mask" @tap="closeAuthModal">
      <view class="auth-modal" @tap.stop>
        <button class="auth-close" @tap="closeAuthModal"><text>x</text></button>
        <image class="auth-logo" src="/static/wordhubporm.png" mode="widthFix"></image>
        <text class="auth-title">连接真实账号后，模型配置和历史记录才会进入后端。</text>

        <view class="auth-tabs">
          <button class="auth-tab" :class="{ 'auth-tab--active': activeAuthTab === 'login' }" @tap="switchAuthTab('login')">登录</button>
          <button class="auth-tab" :class="{ 'auth-tab--active': activeAuthTab === 'register' }" @tap="switchAuthTab('register')">注册</button>
        </view>

        <form v-if="activeAuthTab === 'login'" class="auth-form" @submit="submitLogin">
          <input class="wh-input auth-input" type="text" name="email" :value="authForm.email" placeholder="请输入邮箱" @input="updateAuthField('email', $event)" />
          <input class="wh-input auth-input" password name="password" :value="authForm.password" placeholder="请输入密码" @input="updateAuthField('password', $event)" />
          <button class="wh-btn wh-btn--primary auth-submit" :disabled="isSubmittingAuth" form-type="submit">{{ isSubmittingAuth ? '登录中...' : '登录' }}</button>
        </form>

        <form v-else class="auth-form" @submit="submitRegister">
          <input class="wh-input auth-input" type="text" name="nickname" :value="authForm.nickname" placeholder="请输入昵称" @input="updateAuthField('nickname', $event)" />
          <input class="wh-input auth-input" type="text" name="email" :value="authForm.email" placeholder="请输入邮箱" @input="updateAuthField('email', $event)" />
          <input class="wh-input auth-input" password name="password" :value="authForm.password" placeholder="请输入至少 6 位密码" @input="updateAuthField('password', $event)" />
          <button class="wh-btn wh-btn--primary auth-submit" :disabled="isSubmittingAuth" form-type="submit">{{ isSubmittingAuth ? '注册中...' : '注册并登录' }}</button>
        </form>
      </view>
    </view>

    <WordHubTabBar current="profile" />
  </view>
</template>

<script>
import WordHubTabBar from '../../components/WordHubTabBar.vue'
import {
  clearAuthSession,
  getAiModelConfig,
  getCurrentUser,
  getMe,
  getModelConfig,
  isLoggedIn as checkLoggedIn,
  listMyGeneratedCards,
  listMyGenerationJobs,
  fetchMyReviewDeck,
  loginUser,
  logoutUser,
  registerUser,
  updateModelConfig,
} from '../../utils/wordhub-store'

const PROVIDER_META = {
  deepseek: { label: 'DeepSeek', baseUrl: 'https://api.deepseek.com', keyUrl: 'https://platform.deepseek.com/' },
  qwen: { label: 'Qwen', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', keyUrl: 'https://help.aliyun.com/zh/model-studio/get-api-key' },
  openai: { label: 'OpenAI', baseUrl: 'https://api.openai.com/v1', keyUrl: 'https://platform.openai.com/api-keys' },
  gemini: { label: 'Gemini', baseUrl: 'https://generativelanguage.googleapis.com', keyUrl: 'https://aistudio.google.com/app/apikey' },
}

const TEXT_PROVIDERS = ['deepseek', 'qwen', 'openai', 'gemini']
const IMAGE_PROVIDERS = ['openai', 'qwen', 'gemini']

function createEmptyAuthForm() {
  return { nickname: '', email: '', password: '' }
}

function canSyncImageProvider(provider) {
  return IMAGE_PROVIDERS.includes(provider)
}

function createDraftConfig(config) {
  const base = { ...getAiModelConfig(), ...(config || {}), textApiKey: '', imageApiKey: '' }
  if (base.imageLinked && canSyncImageProvider(base.textProvider)) {
    base.imageProvider = base.textProvider
    if (!base.imageApiKeyMasked && base.textApiKeyMasked) {
      base.imageApiKeyMasked = base.textApiKeyMasked
    }
    if (!base.hasImageApiKey && base.hasTextApiKey) {
      base.hasImageApiKey = true
    }
  }
  return base
}

function pickFirstText(...values) {
  for (const value of values) {
    const text = String(value || '').trim()
    if (text) {
      return text
    }
  }
  return ''
}

function normalizeWordList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || '').trim()).filter(Boolean)
  }
  if (typeof value === 'string') {
    return value.split(/[\n,，]/).map((item) => item.trim()).filter(Boolean)
  }
  return []
}

function formatHistoryDate(value) {
  const parsed = new Date(String(value || '').trim())
  if (Number.isNaN(parsed.getTime())) {
    return ''
  }
  return parsed.toLocaleString()
}

function getStatusMeta(status) {
  const normalized = String(status || '').trim().toLowerCase()
  if (normalized === 'success') return { label: '完成', tone: 'success' }
  if (normalized === 'running') return { label: '进行中', tone: 'running' }
  if (normalized === 'failed') return { label: '失败', tone: 'failed' }
  if (normalized === 'queued') return { label: '排队中', tone: 'queued' }
  return { label: '等待中', tone: 'queued' }
}

export default {
  components: { WordHubTabBar },
  data() {
    return {
      isLoggedIn: false,
      showAuthModal: false,
      activeAuthTab: 'login',
      isSubmittingAuth: false,
      isSavingConfig: false,
      isSyncingProfile: false,
      isSyncingHistory: false,
      isLoggingOut: false,
      historyError: '',
      historyCards: [],
      historyJobs: [],
      user: {},
      providerMeta: PROVIDER_META,
      textProviders: TEXT_PROVIDERS,
      imageProviders: IMAGE_PROVIDERS,
      aiConfig: createDraftConfig(),
      authForm: createEmptyAuthForm(),
    }
  },
  computed: {
    currentTextProviderMeta() {
      return this.providerMeta[this.aiConfig.textProvider] || this.providerMeta.deepseek
    },
    currentImageProviderMeta() {
      return this.providerMeta[this.aiConfig.imageProvider] || this.providerMeta.openai
    },
    textKeyStatus() {
      if (String(this.aiConfig.textApiKey || '').trim()) return '已输入新的文字模型 Key，保存后会覆盖旧配置。'
      if (this.aiConfig.hasTextApiKey && this.aiConfig.textApiKeyMasked) return `已保存文字模型 Key：${this.aiConfig.textApiKeyMasked}`
      return '尚未保存文字模型 Key。'
    },
    imageKeyStatus() {
      if (this.aiConfig.imageLinked) return '图片模型当前跟随文字模型。'
      if (String(this.aiConfig.imageApiKey || '').trim()) return '已输入新的图片模型 Key，保存后会覆盖旧配置。'
      if (this.aiConfig.hasImageApiKey && this.aiConfig.imageApiKeyMasked) return `已保存图片模型 Key：${this.aiConfig.imageApiKeyMasked}`
      return '尚未保存图片模型 Key。'
    },
    modelConfigUpdatedAtLabel() {
      if (!this.aiConfig.updatedAt) return ''
      const parsed = new Date(this.aiConfig.updatedAt)
      if (Number.isNaN(parsed.getTime())) return ''
      return `最近同步：${parsed.toLocaleString()}`
    },
  },
  onLoad() {
    this.syncProfile()
  },
  onShow() {
    this.syncProfile()
  },
  methods: {
    resetAuthForm() {
      this.authForm = createEmptyAuthForm()
    },
    resetHistoryState() {
      this.historyError = ''
      this.historyCards = []
      this.historyJobs = []
    },
    normalizeHistoryCards(cards) {
      return (Array.isArray(cards) ? cards : []).slice(0, 8).map((item, index) => {
        const source = item && typeof item === 'object' ? item : {}
        return {
          id: pickFirstText(source.id, source.cardId) || `card-${index}`,
          word: pickFirstText(source.word, source.title) || `Word ${index + 1}`,
          meaning: pickFirstText(source.meaning, source.note, source.visualCueZh, source.scene) || '暂无释义',
          hasImage: Boolean(pickFirstText(source.imageUrl, source.downloadUrl)),
          updatedAtLabel: formatHistoryDate(pickFirstText(source.updatedAt, source.createdAt)),
        }
      })
    },
    normalizeHistoryJobs(jobs) {
      return (Array.isArray(jobs) ? jobs : []).slice(0, 8).map((item, index) => {
        const source = item && typeof item === 'object' ? item : {}
        const acceptedWords = normalizeWordList(source.acceptedWords || source.words || source.inputWords)
        const invalidWords = normalizeWordList(source.invalidWords)
        const unsupportedWords = normalizeWordList(source.unsupportedWords)
        const resultCount = Array.isArray(source.results) ? source.results.length : Number(source.resultCount || source.generatedCount || 0)
        const parts = []
        if (acceptedWords.length) parts.push(`accepted ${acceptedWords.length}`)
        if (invalidWords.length) parts.push(`invalid ${invalidWords.length}`)
        if (unsupportedWords.length) parts.push(`unsupported ${unsupportedWords.length}`)
        if (Number.isFinite(resultCount) && resultCount > 0) parts.push(`cards ${resultCount}`)
        const statusMeta = getStatusMeta(source.status)
        return {
          id: pickFirstText(source.jobId, source.id) || `job-${index}`,
          statusLabel: statusMeta.label,
          statusTone: statusMeta.tone,
          wordsLabel: acceptedWords.join(', ') || pickFirstText(source.message) || '暂无任务词汇',
          summary: parts.join(' · ') || pickFirstText(source.message) || '等待更多任务详情',
          updatedAtLabel: formatHistoryDate(pickFirstText(source.updatedAt, source.createdAt)),
        }
      })
    },
    async syncHistory(options = {}) {
      if (!this.isLoggedIn || this.isSyncingHistory) return
      const silent = Boolean(options.silent)
      this.isSyncingHistory = true
      if (!silent) this.historyError = ''
      try {
        const [jobsPayload, cardsPayload] = await Promise.all([listMyGenerationJobs(), listMyGeneratedCards(), fetchMyReviewDeck().catch(() => {})])
        this.historyJobs = this.normalizeHistoryJobs(jobsPayload.jobs)
        this.historyCards = this.normalizeHistoryCards(cardsPayload.cards)
        this.historyError = ''
        if (!silent) {
          uni.showToast({ title: '历史已刷新', icon: 'none' })
        }
      } catch (error) {
        this.historyCards = []
        this.historyJobs = []
        this.historyError = error?.message || '加载历史失败'
        if (error?.statusCode === 401) {
          clearAuthSession({ keepResults: true })
          this.isLoggedIn = false
          this.user = {}
          this.aiConfig = createDraftConfig()
        }
        if (!silent) {
          uni.showToast({ title: this.historyError, icon: 'none' })
        }
      } finally {
        this.isSyncingHistory = false
      }
    },
    handleHistoryRefresh() {
      return this.syncHistory()
    },
    async syncProfile() {
      if (this.isSyncingProfile) return
      this.isSyncingProfile = true
      try {
        if (!checkLoggedIn()) {
          this.isLoggedIn = false
          this.user = {}
          this.aiConfig = createDraftConfig()
          this.resetHistoryState()
          return
        }
        const mePayload = await getMe()
        this.isLoggedIn = true
        this.user = mePayload.user || getCurrentUser() || {}
        try {
          const modelPayload = await getModelConfig()
          this.aiConfig = createDraftConfig(modelPayload.modelConfig)
        } catch (modelError) {
          if (modelError?.statusCode === 401) throw modelError
          this.aiConfig = createDraftConfig(mePayload.modelConfig || getAiModelConfig())
        }
        await this.syncHistory({ silent: true })
      } catch (error) {
        if (error?.statusCode === 401) {
          clearAuthSession({ keepResults: true })
          this.isLoggedIn = false
          this.user = {}
          this.aiConfig = createDraftConfig()
          this.resetHistoryState()
          uni.showToast({ title: '登录已失效，请重新登录', icon: 'none' })
          return
        }
        this.isLoggedIn = checkLoggedIn()
        this.user = getCurrentUser() || {}
        this.aiConfig = createDraftConfig(getAiModelConfig())
        this.resetHistoryState()
      } finally {
        this.isSyncingProfile = false
      }
    },
    handleHeroTap() {
      if (!this.isLoggedIn) this.openAuthModal()
    },
    openAuthModal() {
      this.showAuthModal = true
    },
    closeAuthModal(force = false) {
      const shouldForceClose = typeof force === 'boolean' ? force : Boolean(force?.force)
      if (shouldForceClose || !this.isSubmittingAuth) this.showAuthModal = false
    },
    switchAuthTab(tab) {
      if (!this.isSubmittingAuth) this.activeAuthTab = tab
    },
    updateAuthField(field, event) {
      const nextValue = event?.detail?.value ?? event?.target?.value ?? ''
      this.authForm = { ...this.authForm, [field]: nextValue }
    },
    syncImageProviderFromText() {
      if (!this.aiConfig.imageLinked) return
      if (!canSyncImageProvider(this.aiConfig.textProvider)) {
        this.aiConfig.imageLinked = false
        return
      }
      this.aiConfig.imageProvider = this.aiConfig.textProvider
      this.aiConfig.hasImageApiKey = this.aiConfig.hasTextApiKey
      this.aiConfig.imageApiKeyMasked = this.aiConfig.textApiKeyMasked
      if (String(this.aiConfig.textApiKey || '').trim()) {
        this.aiConfig.imageApiKey = this.aiConfig.textApiKey
      }
    },
    selectTextProvider(provider) {
      if (!this.isLoggedIn || this.isSavingConfig || this.isSyncingProfile) return
      this.aiConfig.textProvider = provider
      if (this.aiConfig.imageLinked && !canSyncImageProvider(provider)) {
        this.aiConfig.imageLinked = false
        uni.showToast({ title: '当前文字模型不能直接复用为图片模型', icon: 'none' })
      }
      this.syncImageProviderFromText()
    },
    handleTextKeyInput(event) {
      if (!this.isLoggedIn || this.isSavingConfig || this.isSyncingProfile) return
      this.aiConfig.textApiKey = event?.detail?.value ?? ''
      this.syncImageProviderFromText()
    },
    toggleImageLinked() {
      if (!this.isLoggedIn || this.isSavingConfig || this.isSyncingProfile) return
      const nextValue = !this.aiConfig.imageLinked
      if (nextValue && !canSyncImageProvider(this.aiConfig.textProvider)) {
        uni.showToast({ title: '请先切换到 OpenAI、Qwen 或 Gemini 再开启联动', icon: 'none' })
        return
      }
      this.aiConfig.imageLinked = nextValue
      this.syncImageProviderFromText()
    },
    selectImageProvider(provider) {
      if (!this.isLoggedIn || this.aiConfig.imageLinked || this.isSavingConfig || this.isSyncingProfile) return
      this.aiConfig.imageProvider = provider
    },
    handleImageKeyInput(event) {
      if (!this.isLoggedIn || this.aiConfig.imageLinked || this.isSavingConfig || this.isSyncingProfile) return
      this.aiConfig.imageApiKey = event?.detail?.value ?? ''
    },
    buildConfigPayload() {
      const payload = { textProvider: this.aiConfig.textProvider, imageLinked: this.aiConfig.imageLinked }
      const textApiKey = String(this.aiConfig.textApiKey || '').trim()
      const imageApiKey = String(this.aiConfig.imageApiKey || '').trim()
      if (textApiKey) payload.textApiKey = textApiKey
      if (this.aiConfig.imageLinked) {
        payload.imageProvider = this.aiConfig.textProvider
        if (textApiKey) payload.imageApiKey = textApiKey
      } else {
        payload.imageProvider = this.aiConfig.imageProvider
        if (imageApiKey) payload.imageApiKey = imageApiKey
      }
      return payload
    },
    async saveConfig() {
      if (!this.isLoggedIn) {
        this.openAuthModal()
        return
      }
      this.isSavingConfig = true
      try {
        const response = await updateModelConfig(this.buildConfigPayload())
        this.aiConfig = createDraftConfig(response.modelConfig)
        uni.showToast({ title: '模型配置已保存到后端', icon: 'none' })
      } catch (error) {
        const message = error?.statusCode === 401
          ? '登录已失效，请重新登录'
          : error?.errorCode === 'INVALID_MODEL_CONFIG'
            ? '模型配置不合法，请检查提供商和 Key 是否匹配'
            : error?.message || '保存模型配置失败'
        uni.showToast({ title: message, icon: 'none' })
        if (error?.statusCode === 401) {
          await this.syncProfile()
        }
      } finally {
        this.isSavingConfig = false
      }
    },
    validateEmail(email) {
      return /.+@.+\..+/.test(String(email || '').trim())
    },
    async submitLogin(event) {
      if (event && typeof event.preventDefault === 'function') event.preventDefault()
      const email = String(this.authForm.email || '').trim().toLowerCase()
      const password = String(this.authForm.password || '').trim()
      if (!this.validateEmail(email)) {
        uni.showToast({ title: '请输入有效邮箱', icon: 'none' })
        return
      }
      if (!password) {
        uni.showToast({ title: '请输入密码', icon: 'none' })
        return
      }
      this.isSubmittingAuth = true
      try {
        const response = await loginUser({ email, password })
        this.isLoggedIn = true
        this.user = response.user || getCurrentUser() || {}
        this.aiConfig = createDraftConfig(response.modelConfig)
        await this.syncHistory({ silent: true })
        this.closeAuthModal(true)
        this.resetAuthForm()
        uni.showToast({ title: '登录成功', icon: 'none' })
      } catch (error) {
        const message = error?.statusCode === 401 ? '邮箱或密码错误' : error?.message || '登录失败，请稍后重试'
        uni.showToast({ title: message, icon: 'none' })
      } finally {
        this.isSubmittingAuth = false
      }
    },
    async submitRegister(event) {
      if (event && typeof event.preventDefault === 'function') event.preventDefault()
      const nickname = String(this.authForm.nickname || '').trim()
      const email = String(this.authForm.email || '').trim().toLowerCase()
      const password = String(this.authForm.password || '').trim()
      if (!nickname) {
        uni.showToast({ title: '请输入昵称', icon: 'none' })
        return
      }
      if (!this.validateEmail(email)) {
        uni.showToast({ title: '请输入有效邮箱', icon: 'none' })
        return
      }
      if (password.length < 6) {
        uni.showToast({ title: '密码至少需要 6 位', icon: 'none' })
        return
      }
      this.isSubmittingAuth = true
      try {
        const response = await registerUser({ email, password, nickname })
        this.isLoggedIn = true
        this.user = response.user || getCurrentUser() || {}
        this.aiConfig = createDraftConfig(response.modelConfig)
        await this.syncHistory({ silent: true })
        this.closeAuthModal(true)
        this.resetAuthForm()
        uni.showToast({ title: '注册成功，已自动登录', icon: 'none' })
      } catch (error) {
        const message = error?.errorCode === 'EMAIL_ALREADY_USED' ? '该邮箱已注册，请直接登录' : error?.message || '注册失败，请稍后重试'
        uni.showToast({ title: message, icon: 'none' })
      } finally {
        this.isSubmittingAuth = false
      }
    },
    async logout() {
      this.isLoggingOut = true
      try {
        await logoutUser()
        this.isLoggedIn = false
        this.user = {}
        this.aiConfig = createDraftConfig()
        this.resetHistoryState()
        this.resetAuthForm()
        uni.showToast({ title: '已退出登录', icon: 'none' })
      } catch (error) {
        this.isLoggedIn = false
        this.user = {}
        this.aiConfig = createDraftConfig()
        this.resetHistoryState()
        uni.showToast({ title: error?.message || '已退出登录，本地状态已清理', icon: 'none' })
      } finally {
        this.isLoggingOut = false
      }
    },
  },
}
</script>

<style scoped>
.profile-page {
  background: var(--wh-bg);
  padding-bottom: 224rpx;
}

.profile-stack {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding-top: 8rpx;
}

.profile-hero {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 30rpx;
  gap: 18rpx;
  text-align: left;
  background: var(--wh-surface);
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 18rpx 40rpx rgba(0, 0, 0, 0.32);
}

.profile-hero--guest {
  cursor: pointer;
}

.avatar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120rpx;
  height: 120rpx;
  border-radius: var(--wh-radius-xl);
  border: 1rpx solid rgba(255, 153, 0, 0.2);
  background: #111111;
  color: var(--wh-accent-strong);
  font-size: 42rpx;
  font-weight: 800;
  flex-shrink: 0;
}

.avatar--guest {
  background: #111111;
}

.avatar-ghost__head,
.avatar-ghost__body {
  position: absolute;
  left: 50%;
  background: var(--wh-accent);
  transform: translateX(-50%);
}

.avatar-ghost__head {
  top: 24rpx;
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
}

.avatar-ghost__body {
  bottom: 24rpx;
  width: 54rpx;
  height: 30rpx;
  border-radius: 18rpx 18rpx 12rpx 12rpx;
}

.profile-copy {
  min-width: 0;
}

.profile-name {
  display: block;
  font-size: 42rpx;
  font-weight: 800;
  color: var(--wh-text-strong);
}

.profile-hint {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  line-height: 1.6;
  color: var(--wh-text-muted);
}

.profile-card,
.history-card {
  position: relative;
  width: 100%;
  padding: 30rpx;
  border-radius: var(--wh-radius-xl);
  background: var(--wh-surface);
  border: 1rpx solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 18rpx 40rpx rgba(0, 0, 0, 0.32);
}

.profile-card--locked .profile-card__body {
  opacity: 0.38;
}

.profile-card__head,
.history-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.profile-card__title,
.history-card__title,
.config-group__title,
.history-section__title {
  color: var(--wh-text-strong);
}

.profile-card__title,
.history-card__title {
  font-size: 30rpx;
  font-weight: 700;
}

.profile-card__meta,
.config-help,
.config-link,
.history-item__date,
.history-error {
  font-size: 20rpx;
  line-height: 1.6;
  color: var(--wh-text-muted);
}

.config-group {
  margin-top: 24rpx;
}

.config-group__title,
.history-section__title,
.config-row__label {
  display: block;
  font-size: 24rpx;
  font-weight: 700;
}

.config-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 18rpx;
}

.config-tab,
.config-toggle,
.history-refresh,
.history-item__badge {
  min-height: 56rpx;
  padding: 0 22rpx;
  border-radius: var(--wh-btn-radius);
  font-size: 22rpx;
  font-weight: 600;
  border: 1rpx solid transparent;
}

.config-tab,
.config-toggle {
  background: #111111;
  color: var(--wh-text-muted);
  border-color: rgba(255, 255, 255, 0.08);
}

.config-tab--active,
.config-toggle--active,
.history-refresh {
  background: rgba(255, 153, 0, 0.12);
  border-color: rgba(255, 153, 0, 0.24);
  color: var(--wh-accent-strong);
}

.config-input {
  min-height: 82rpx;
  margin-top: 18rpx;
  padding: 0 24rpx;
  border-radius: var(--wh-btn-radius);
  font-size: 26rpx;
}

.config-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
  margin-top: 26rpx;
}

.profile-save,
.profile-logout,
.auth-submit {
  width: 100%;
  margin-top: 24rpx;
}

.profile-lock {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  border-radius: inherit;
  background: rgba(0, 0, 0, 0.72);
  border: 1rpx solid rgba(255, 153, 0, 0.16);
}

.profile-lock__title {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--wh-accent-strong);
}

.profile-lock__hint,
.history-empty text {
  font-size: 20rpx;
  line-height: 1.6;
  color: var(--wh-text-muted);
}

.history-section {
  margin-top: 24rpx;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  margin-top: 16rpx;
}

.history-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
  padding: 20rpx;
  border-radius: var(--wh-radius-lg);
  background: #111111;
  border: 1rpx solid rgba(255, 255, 255, 0.08);
}

.history-item__main,
.history-item__meta {
  min-width: 0;
}

.history-item__main {
  flex: 1;
}

.history-item__meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8rpx;
}

.history-item__title {
  display: block;
  font-size: 24rpx;
  font-weight: 700;
  line-height: 1.4;
  color: var(--wh-text-strong);
}

.history-item__desc {
  display: block;
  margin-top: 8rpx;
  font-size: 20rpx;
  line-height: 1.6;
  color: var(--wh-text-muted);
}

.history-item__badge {
  background: rgba(255, 255, 255, 0.06);
  color: #9c9c9c;
}

.history-item__badge--success {
  background: rgba(48, 194, 103, 0.12);
  color: #6fe59a;
}

.history-item__badge--running {
  background: rgba(255, 153, 0, 0.12);
  color: var(--wh-accent-strong);
}

.history-item__badge--failed {
  background: rgba(255, 90, 79, 0.12);
  color: #ff8d84;
}

.history-empty {
  margin-top: 16rpx;
  padding: 22rpx;
  border-radius: var(--wh-radius-lg);
  background: #111111;
  border: 1rpx solid rgba(255, 255, 255, 0.08);
}

.profile-logout {
  color: var(--wh-accent-strong);
  background: #111111;
  border: 1rpx solid rgba(255, 153, 0, 0.22);
  box-shadow: none;
}

.auth-mask {
  position: fixed;
  top: 0;
  right: auto;
  bottom: 0;
  left: 50%;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: var(--wh-page-max-width);
  padding: 24rpx var(--wh-page-gutter);
  background: rgba(0, 0, 0, 0.82);
  transform: translateX(-50%);
}

.auth-modal {
  position: relative;
  width: 100%;
  padding: 42rpx 30rpx 34rpx;
  border-radius: var(--wh-radius-xl);
  background: var(--wh-surface);
  border: 1rpx solid rgba(255, 153, 0, 0.18);
  box-shadow: 0 22rpx 60rpx rgba(0, 0, 0, 0.5);
}

.auth-close {
  position: absolute;
  top: 18rpx;
  right: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56rpx;
  height: 56rpx;
  border-radius: var(--wh-btn-radius);
  background: #111111;
  color: var(--wh-text-muted);
  border: 1rpx solid rgba(255, 255, 255, 0.08);
  font-size: 38rpx;
}

.auth-logo {
  display: block;
  width: 260rpx;
  margin: 0 auto;
}

.auth-title {
  display: block;
  margin-top: 18rpx;
  font-size: 24rpx;
  line-height: 1.6;
  text-align: center;
  color: var(--wh-text-muted);
}

.auth-tabs {
  display: flex;
  margin-top: 28rpx;
  padding: 4rpx;
  border-radius: var(--wh-radius-lg);
  background: #111111;
  border: 1rpx solid rgba(255, 255, 255, 0.08);
}

.auth-tab {
  flex: 1;
  min-height: 68rpx;
  border-radius: var(--wh-btn-radius);
  color: var(--wh-text-muted);
  font-size: 24rpx;
  font-weight: 600;
}

.auth-tab--active {
  background: var(--wh-accent);
  color: #000000;
}

.auth-form {
  margin-top: 24rpx;
}

.auth-input {
  min-height: 84rpx;
  margin-top: 14rpx;
  padding: 0 24rpx;
  border-radius: var(--wh-btn-radius);
  font-size: 26rpx;
}

.auth-form .auth-input:first-child {
  margin-top: 0;
}

@media (hover: hover) {
  .profile-hero--guest:hover {
    border-color: rgba(255, 153, 0, 0.2);
  }

  .profile-logout:hover {
    background: rgba(255, 153, 0, 0.1);
  }
}

@media screen and (min-width: 1024px) {
  .profile-page {
    padding-bottom: 156px;
  }

  .profile-stack {
    gap: 18px;
  }
}
</style>

