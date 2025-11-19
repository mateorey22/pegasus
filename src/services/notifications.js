export const notificationService = {
    requestPermission: async () => {
        if (!('Notification' in window)) {
            console.log('This browser does not support desktop notification');
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }

        return false;
    },

    send: (title, options = {}) => {
        if (!('Notification' in window)) return;

        if (Notification.permission === 'granted') {
            new Notification(title, {
                icon: '/vite.svg',
                badge: '/vite.svg',
                vibrate: [200, 100, 200],
                ...options
            });
        }
    }
};
