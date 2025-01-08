export function encodeData(data) {
    return btoa(JSON.stringify(data));
}

export function decodeData(encoded) {
    return JSON.parse(atob(encoded));
}
