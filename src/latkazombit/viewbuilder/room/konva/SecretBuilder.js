class SecretBuilder {
    /**
     * @param {object} secretJson secret child objects from room.json
     * @returns {object[]} an array of secret child objects as Konva objects
     */
    buildRoomChildren(secretJson) {
        const secretResult = [];
        for (const [key, secret] of Object.entries(secretJson)) {
            if (!secret.attrs) {
                secret.attrs = {};
            }
            secret.attrs.id = key;
            secret.attrs.category = 'secret';
            secretResult.push(secret);
        }
        return secretResult;
    }
}

export default SecretBuilder;
