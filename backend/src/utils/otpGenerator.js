import config from '../config.js';

export const generateOTP = () => {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < config.otp.length; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
};
