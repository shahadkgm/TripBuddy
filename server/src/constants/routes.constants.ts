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
        EDIT_PROFILE: '/edit-profile/:id'
    },

    ADMIN: {
        BASE: '/api/admin',
        USERS: '/users',
        USER_BLOCK: '/users/:id/block',
        USER_DELETE: '/users/:id',
        GUIDES_PENDING: '/guides/pending',
        GUIDE_VERIFY: '/guides/:id/verify',
        GUIDES_ALL: '/guides',
        GUIDE_REJECT: '/guides/:id',
        STATS: '/stats',
    },

    UPLOAD: {
        BASE: '/api',
        FILE_UPLOAD: '/upload',
        PROFILE_PHOTO: '/profile-photo',
        KYC_STATUS: '/kyc-status/:userId',
    },

    GUIDE: {
        BASE: '/api/guides',
        REGISTER: '/register',
        STATUS: '/status/:userId',
        GET_ALL: '/all',
    },

    TRIP: {
        BASE: '/api/plantrips',
        CREATE: '/',
        GET_BY_USER: '/user/:userId',
        GET_BY_ID: '/:id',
        GET_ALL: '/all',
    },

    CONNECTION: {
        BASE: '/api/connections',
        SEND: '/request',
        ACCEPT: '/accept/:requestId',
        REJECT: '/reject/:requestId',
        PENDING: '/pending',
        STATUS: '/status',
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
        GET_ALL: '/all'
    }
};
