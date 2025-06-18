import { initializeApp, cert, ServiceAccount} from 'firebase-admin/app';
import { getMessaging} from 'firebase-admin/messaging';

import serviceAccount from '../../ServiceAccountKey.json' ;
const app = initializeApp({
    credential : cert(serviceAccount as ServiceAccount)
});


export const message = getMessaging(app);