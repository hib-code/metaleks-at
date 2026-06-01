const themeSelect = document.querySelector('#themeSelect');
const sizeSelect = document.querySelector('#sizeSelect');
const colorInput = document.querySelector('#colorInput');
const messageInput = document.querySelector('#messageInput');
const photoInput = document.querySelector('#photoInput');
const locationConsent = document.querySelector('#locationConsent');
const form = document.querySelector('#configForm');
const statusText = document.querySelector('#statusText');

const previewTheme = document.querySelector('#previewTheme');
const previewSize = document.querySelector('#previewSize');
const previewColor = document.querySelector('#previewColor');
const previewMessage = document.querySelector('#previewMessage');
const previewPlate = document.querySelector('#previewPlate');
const previewImage = document.querySelector('#previewImage');

function updatePreview() {
  previewTheme.textContent = themeSelect.value;
  previewSize.textContent = sizeSelect.value;
  previewColor.textContent = colorInput.value;
  previewMessage.textContent = messageInput.value || 'Ton message';
  previewPlate.style.borderColor = colorInput.value;
}

function updatePhotoPreview() {
  const [file] = photoInput.files;
  if (!file) {
    previewImage.removeAttribute('src');
    previewImage.style.display = 'none';
    return;
  }

  previewImage.src = URL.createObjectURL(file);
  previewImage.style.display = 'block';
}

function getLocationText() {
  if (!locationConsent.checked) {
    return Promise.resolve('Localisation non demandée par le client.');
  }

  if (!navigator.geolocation) {
    return Promise.resolve('Localisation indisponible sur cet appareil.');
  }

  statusText.textContent = 'Demande de localisation en cours...';

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const mapsLink = `https://maps.google.com/?q=${coords.latitude},${coords.longitude}`;
        resolve(`Localisation client: ${mapsLink}`);
      },
      () => {
        resolve('Localisation refusée ou non disponible.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

function openWhatsApp(message, file) {
  const phone = form.dataset.whatsapp;
  const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  if (navigator.canShare && navigator.share && file) {
    const shareData = {
      title: 'Commande Metaleks',
      text: message,
      files: [file],
    };

    if (navigator.canShare(shareData)) {
      return navigator
        .share(shareData)
        .then(() => {
          statusText.textContent =
            'Partage lancé. Choisis WhatsApp pour envoyer la photo + infos.';
        })
        .catch(() => {
          window.open(waUrl, '_blank', 'noopener');
          statusText.textContent =
            "WhatsApp ouvert. Ajoute la photo manuellement puis envoie le message.";
        });
    }
  }

  window.open(waUrl, '_blank', 'noopener');
  statusText.textContent =
    "WhatsApp ouvert. Ajoute la photo manuellement puis envoie le message.";
  return Promise.resolve();
}

themeSelect.addEventListener('change', updatePreview);
sizeSelect.addEventListener('change', updatePreview);
colorInput.addEventListener('input', updatePreview);
messageInput.addEventListener('input', updatePreview);
photoInput.addEventListener('change', updatePhotoPreview);

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const [file] = photoInput.files;
  if (!file) {
    statusText.textContent = 'Ajoute une photo avant l’envoi.';
    return;
  }

  statusText.textContent = 'Préparation de ton message WhatsApp...';

  const locationText = await getLocationText();
  const message = [
    'Nouvelle commande Metaleks',
    `Univers: ${themeSelect.value}`,
    `Taille: ${sizeSelect.value}`,
    `Couleur: ${colorInput.value}`,
    `Message client: ${messageInput.value || 'Aucun message'}`,
    `Photo: ${file.name}`,
    locationText,
  ].join('\n');

  openWhatsApp(message, file);
});

updatePreview();
updatePhotoPreview();
