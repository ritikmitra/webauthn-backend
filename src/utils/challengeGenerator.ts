//sample response


export default function generateChallenge(uniqueString : string) {
    const challenge = new Uint8Array(Buffer.from(uniqueString,'utf-8'))
    return challenge
}

