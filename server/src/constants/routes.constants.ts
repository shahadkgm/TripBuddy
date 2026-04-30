export const API_ROUTES = {
  BASE: '/',
  UPLOADS: '/uploads',

  AUTH: {
    BASE: '/auth',
    REGISTER: '/register',
    LOGIN: '/login',
    VERIFY_EMAIL: '/verify-email/:token',
    REFRESH: '/refresh',
    LOGOUT: '/logout',
    GOOGLE_LOGIN: '/google-login',
  },

  USER: {
    BASE: '/api/users',
    GET_ALL: '/',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password/:token',
    PROFILE: '/profile/:userId',
    CHANGE_PASSWORD: '/password/:userId',
  },

  ADMIN: {
    BASE: '/api/admin',
    USERS: '/users',
    USER_BLOCK: '/users/:userId/block',
    USER_DELETE: '/users/:userId',
    GUIDES_PENDING: '/guides/pending',
    GUIDE_VERIFY: '/guides/:guideId/verify',
    GUIDES_ALL: '/guides',
    GUIDE_REJECT: '/guides/:guideId',
    STATS: '/stats',
    PAYMENTS: '/payments',
  },

  UPLOAD: {
    BASE: '/api',
    FILE_UPLOAD: '/upload',
    PROFILE_PHOTO: '/profile-photo',
    CHAT_IMAGE: '/chat-image',
    KYC_STATUS: '/kyc-status/:userId',
  },

  GUIDE: {
    BASE: '/api/guides',
    REGISTER: '/register',
    STATUS: '/status/:userId',
    GET_ALL: '/all',
    UPDATE: '/profile',
    RESET: '/reset-status',
  },

  TRIP: {
    BASE: '/api/plantrips',
    CREATE: '/',
    GET_BY_USER: '/user/:userId',
    GET_BY_ID: '/:tripId',
    GET_ALL: '/all',
    GET_CHAT: '/:tripId/chat',
  },

  CONNECTION: {
    BASE: '/api/connections',
    SEND: '/request',
    ACCEPT: '/accept/:requestId',
    REJECT: '/reject/:requestId',
    PENDING: '/pending',
    MY_REQUESTS: '/my-requests',
    STATUS: '/status',
    MEMBERS: '/members/:tripId',
  },

  EXPENSE: {
    BASE: '/api/expenses',
    ADD: '/',
    GET_BY_TRIP: '/trip/:tripId',
    DELETE: '/:expenseId',
  },

  GALLERY: {
    BASE: '/api/gallery',
    UPLOAD: '/upload',
    CREATE: '/post',
    GET_ALL: '/all',
    GET_USER_GALLERY: '/user/:userId',
  },
  AI: {
    BASE: '/api/ai',
    CHAT: '/chat',
  },
  PAYMENT: {
    BASE: '/api/payments',
    PAY_DEPOSIT: '/pay-deposit',
    MY_PAYMENTS: '/my-payments/:tripId',
    TRIP_PAYMENTS: '/trip-payments/:tripId',
    USER_PAYMENTS: '/user-payments',
  },
  REVIEW: {
    BASE: '/api/reviews',
    ADD: '/',
  },
  GUIDE_INVITATION: {
    BASE: '/api/guide-invitations',
    SEND: '/send',
    RESPOND: '/respond',
    INBOUND: '/inbound',
    OUTBOUND: '/outbound',
  },
  REPORT: {
    BASE: '/api/reports',
    CREATE: '/',
    GET_ALL: '/all',
    GET_BY_TARGET: '/target/:targetId',
    UPDATE_STATUS: '/:reportId/status',
  },
};
