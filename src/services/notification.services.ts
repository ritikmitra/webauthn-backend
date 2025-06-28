import { message } from "../firebase/config";
import { AppError } from '../errors/AppError';

export async function sendNotificationSingleDevice(token: string, title: string, body: string) {
    try {
        const response = await message.send({
            notification: {
                title,
                body,
            },
            token,
        });
        return response;
    } catch (error) {
        throw new AppError('Failed to send notification', 500);
    }
}

export async function sendNotificationMultipleDevices(tokens: string[], title: string, body: string) {
    try {
        const response = await message.sendEachForMulticast({
            notification: {
                title,
                body,
            },
            tokens,
        });
        return response;
    } catch (error) {
        throw new AppError('Failed to send notification to multiple devices', 500);
    }
}

export async function sendNotificationTextSingleDevice(token: string, title: string, body: string) {
    const response = await message.send({
        notification: {
            title :`Message from ${title}`,
            body,
        },
        token,
        android : {
            collapseKey : `msg_from_${title}`,
            notification : {
                tag: `chat_${title}`,
            }
        },
        apns :{
            headers : {
                'apns-collapse-id': `chat_${title}`,
            }
        },
        data : {
            from : title,
            body,
        }
    });
    return response;
}

export async function sendNotificationTextMultipleDevices(tokens: string[], title: string, body: string) {
    const response = await message.sendEachForMulticast({
        notification: {
            title :`Message from ${title}`,
            body,
        },
        tokens,
        android : {
            collapseKey : `msg_from_${title}`,
            notification : {
                tag: `chat_${title}`,
            }
        },
        apns :{
            headers : {
                'apns-collapse-id': `chat_${title}`,
            }
        },
        data : {
            from : title,
            body,
        }
    });
    return response;
}