let config;

export function loadConfig() {
  return fetch('credentials.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch config');
      }
      return response.json();
    })
    .then(data => {
      config = data;
      console.log('Config loaded:', config);
    })
    .catch(error => {
      console.error('Error loading config:', error);
    });
}

export function getConfig() {
  return config;
}
