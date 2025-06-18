import { message } from "./config";


async function sendNotificationSingleDevice(token: string, title: string, body: string) {
    try {
        const response = await message.send({
            notification: {
                title,
                body,
            },
            token,
        });
        console.log('Notification sent successfully:', response);
    } catch (error) {
        console.error('Error sending notification:', error);
    }
}

sendNotificationSingleDevice('cRYBZtuVT2OHcpR6FECMpd:APA91bG6O4CwEctBx0sl3SCbXH1aH7C6Cf59wiaNoRcIgdhE2ZyeUwF0eRxWR5crfFaJ4PLaMHWozcZKVfygh_pBUb1BB2KrPbbC9vrgtqCiMUWpBAS0ve8', 'Title', 'Body');

async function sendNotificationMultipleDevices(tokens: string[], title: string, body: string) {
    try {
        const response = await message.sendEachForMulticast({
            notification: {
                title,
                body,
            },
            tokens,
        });
        console.log('Notification sent successfully:', response);
    } catch (error) {
        console.error('Error sending notification:', error);
    }
}