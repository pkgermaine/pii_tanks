export async function loadConfig() {
    const response = await fetch('credentials.json');
    if (!response.ok) throw new Error('Failed to fetch config');
    return response.json();
}
