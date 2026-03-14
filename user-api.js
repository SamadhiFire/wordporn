/**
 * User API Service
 * Handles user information and avatar updates based on the /me endpoints.
 */

const DEFAULT_API_BASE_URL = 'https://fsxnvufgnaiz.sealosbja.site'
const ENV_API_BASE_URL = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_API_BASE_URL || '' : ''
const API_BASE_URL = (ENV_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, '')

// Helper to get authorization headers
function getAuthHeader() {
  // TODO: Replace 'auth_token' with the actual key used in your login logic
  const token = uni.getStorageSync('auth_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const UserApi = {
  /**
   * Fetch current user information
   * GET /me
   * @returns {Promise<Object>} User object with avatarUrl
   */
  getUserInfo() {
    return new Promise((resolve, reject) => {
      uni.request({
        url: `${API_BASE_URL}/me`,
        method: 'GET',
        header: getAuthHeader(),
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            // Returns user.avatarUrl as per spec (wrapped in user object or direct)
            // Adjust based on actual response structure: { user: ... } or { ... }
            resolve(res.data.user || res.data)
          } else {
            reject(new Error(res.data?.message || 'Failed to fetch user info'))
          }
        },
        fail: (err) => reject(err),
      })
    })
  },

  /**
   * Update user avatar
   * PATCH /me/avatar
   * 
   * Constraints:
   * - avatarUrl must be http/https absolute URL
   * - Pass null to clear the avatar
   * 
   * @param {string|null} avatarUrl 
   * @returns {Promise<Object>} Updated user object
   */
  updateAvatar(avatarUrl) {
    // Client-side validation: must be absolute URL if provided
    if (avatarUrl && !/^https?:\/\//.test(avatarUrl)) {
      return Promise.reject(new Error('Avatar URL must be a valid HTTP/HTTPS absolute URL'))
    }

    return new Promise((resolve, reject) => {
      uni.request({
        url: `${API_BASE_URL}/me/avatar`,
        method: 'PATCH',
        header: getAuthHeader(),
        data: { avatarUrl },
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data.user || res.data)
          } else {
            reject(new Error(res.data?.message || 'Failed to update avatar'))
          }
        },
        fail: (err) => reject(err),
      })
    })
  },
}
