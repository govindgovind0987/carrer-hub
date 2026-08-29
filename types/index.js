/**
 * Application type definitions
 * JSDoc-based typing for JavaScript project
 */

/**
 * @typedef {'CANDIDATE' | 'RECRUITER' | 'ADMIN'} UserRole
 */

/**
 * @typedef {Object} SessionUser
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} [image]
 * @property {UserRole} role
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success
 * @property {*} [data]
 * @property {string} [error]
 * @property {string} [message]
 */

/**
 * @typedef {Object} PaginatedResponse
 * @property {Array} data
 * @property {number} total
 * @property {number} page
 * @property {number} pageSize
 * @property {number} totalPages
 */

/**
 * @typedef {Object} NavLink
 * @property {string} label
 * @property {string} href
 * @property {string} [icon]
 * @property {boolean} [external]
 */

/**
 * @typedef {Object} SiteConfig
 * @property {string} name
 * @property {string} description
 * @property {string} url
 * @property {string} ogImage
 * @property {Object} links
 * @property {string} creator
 * @property {string[]} keywords
 */

export {};
