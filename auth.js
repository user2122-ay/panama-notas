document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab + '-form').classList.add('active');
  });
});

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const errEl = document.getElementById('login-error');
  errEl.textContent = '';
  try {
    await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    window.location.href = '/app.html';
  } catch (err) {
    errEl.textContent = err.message;
  }
});

document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const nombre = document.getElementById('reg-nombre').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  const colegio = document.getElementById('reg-colegio').value;
  const grado = document.getElementById('reg-grado').value;
  const errEl = document.getElementById('register-error');
  errEl.textContent = '';
  try {
    await apiFetch('/auth/register', { method: 'POST', body: JSON.stringify({ nombre, email, password, colegio, grado }) });
    window.location.href = '/app.html';
  } catch (err) {
    errEl.textContent = err.message;
  }
});
