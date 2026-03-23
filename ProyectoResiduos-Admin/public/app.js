const state = {
  adminKey: localStorage.getItem('admin_api_key') ?? '',
};

const adminKeyInput = document.querySelector('#adminKey');
const saveKeyBtn = document.querySelector('#saveKeyBtn');
const createAlertForm = document.querySelector('#createAlertForm');
const sendNotificationForm = document.querySelector('#sendNotificationForm');
const refreshAlertsBtn = document.querySelector('#refreshAlertsBtn');
const alertsList = document.querySelector('#alertsList');
const statusBox = document.querySelector('#statusBox');

adminKeyInput.value = state.adminKey;

function logStatus(message, payload) {
  const now = new Date().toLocaleTimeString();
  const data = payload ? `\n${JSON.stringify(payload, null, 2)}` : '';
  statusBox.textContent = `[${now}] ${message}${data}\n\n${statusBox.textContent}`.trim();
}

function parseTags(tagsRaw) {
  return tagsRaw
    .split(',')
    .map(tag => tag.trim().toLowerCase())
    .filter(Boolean);
}

async function adminRequest(path, init = {}) {
  const response = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': state.adminKey,
      ...(init.headers ?? {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message ?? 'Error en solicitud admin');
  }

  return data;
}

async function loadAlerts() {
  if (!state.adminKey) {
    alertsList.innerHTML = '<p>Agrega tu API key para ver alertas.</p>';
    return;
  }

  try {
    const data = await adminRequest('/api/admin/alerts');
    const alerts = data.alerts ?? [];

    if (!alerts.length) {
      alertsList.innerHTML = '<p>No hay alertas registradas.</p>';
      return;
    }

    alertsList.innerHTML = alerts
      .map(alert => {
        const tags = (alert.tags ?? []).join(', ') || 'sin tags';
        return `
          <article class="alert-item ${alert.severity}">
            <strong>${alert.title}</strong>
            <p>${alert.message}</p>
            <p class="alert-meta">Severidad: ${alert.severity} | Estado: ${alert.status}</p>
            <p class="alert-meta">Tags: ${tags}</p>
            <p class="alert-meta">Programada: ${alert.scheduledFor ?? 'no'} | Expira: ${alert.expiresAt ?? 'no'}</p>
            <div class="inline-actions">
              <button class="btn btn-secondary" data-action="dispatch" data-id="${alert.id}">Despachar</button>
              <button class="btn btn-ghost" data-action="cancel" data-id="${alert.id}">Cancelar</button>
            </div>
          </article>
        `;
      })
      .join('');
  } catch (error) {
    logStatus('No se pudieron cargar alertas', { error: error.message });
  }
}

saveKeyBtn.addEventListener('click', () => {
  state.adminKey = adminKeyInput.value.trim();
  localStorage.setItem('admin_api_key', state.adminKey);
  logStatus('API key guardada localmente');
  loadAlerts();
});

createAlertForm.addEventListener('submit', async event => {
  event.preventDefault();

  const formData = new FormData(createAlertForm);
  const payload = {
    title: String(formData.get('title') ?? ''),
    message: String(formData.get('message') ?? ''),
    severity: String(formData.get('severity') ?? 'medium'),
    status: String(formData.get('status') ?? 'draft'),
    sendPush: formData.get('sendPush') === 'on',
    tags: parseTags(String(formData.get('tags') ?? '')),
    scheduledFor: String(formData.get('scheduledFor') ?? '').trim() || null,
    expiresAt: String(formData.get('expiresAt') ?? '').trim() || null,
  };

  try {
    const response = await adminRequest('/api/admin/alerts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    logStatus('Alerta creada', response);
    createAlertForm.reset();
    await loadAlerts();
  } catch (error) {
    logStatus('Error creando alerta', { error: error.message });
  }
});

sendNotificationForm.addEventListener('submit', async event => {
  event.preventDefault();

  const formData = new FormData(sendNotificationForm);
  const payload = {
    title: String(formData.get('title') ?? ''),
    message: String(formData.get('message') ?? ''),
    severity: String(formData.get('severity') ?? 'medium'),
    tags: parseTags(String(formData.get('tags') ?? '')),
  };

  try {
    const response = await adminRequest('/api/admin/notifications/send', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    logStatus('Notificación enviada', response);
    sendNotificationForm.reset();
  } catch (error) {
    logStatus('Error enviando notificación', { error: error.message });
  }
});

refreshAlertsBtn.addEventListener('click', loadAlerts);

alertsList.addEventListener('click', async event => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const action = target.dataset.action;
  const id = target.dataset.id;
  if (!action || !id) {
    return;
  }

  try {
    if (action === 'dispatch') {
      const response = await adminRequest(`/api/admin/alerts/${id}/dispatch`, { method: 'POST' });
      logStatus('Alerta despachada', response);
    }

    if (action === 'cancel') {
      const response = await adminRequest(`/api/admin/alerts/${id}`, { method: 'DELETE' });
      logStatus('Alerta cancelada', response);
    }

    await loadAlerts();
  } catch (error) {
    logStatus('Error ejecutando acción', { error: error.message });
  }
});

loadAlerts();
