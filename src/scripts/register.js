import '../styles/main.scss';
import IMask from 'imask';

// --- Tabs ---

document.querySelectorAll('.js-tabs').forEach((tabsEl) => {
  const tabs = tabsEl.querySelectorAll('.tabs__tab');
  const panels = tabsEl.querySelectorAll('.tabs__panel');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      tabs.forEach((t) => t.classList.remove('is-active'));
      panels.forEach((p) => p.classList.remove('is-active'));

      tab.classList.add('is-active');
      tabsEl.querySelector(`[data-panel="${target}"]`).classList.add('is-active');
    });
  });
});

// --- Form helpers ---

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function setError(input, message) {
  const wrapper = input.closest('.input');
  wrapper.classList.add('is-error');
  wrapper.querySelector('.input__error').textContent = message;
}

function clearError(input) {
  const wrapper = input.closest('.input');
  wrapper.classList.remove('is-error');
  wrapper.querySelector('.input__error').textContent = '';
}

function validateForm(form, validators) {
  let hasErrors = false;

  for (const [name, validate] of Object.entries(validators)) {
    const input = form.querySelector(`[name="${name}"]`);
    const error = validate(input);
    if (error) {
      setError(input, error);
      hasErrors = true;
    } else {
      clearError(input);
    }
  }

  return !hasErrors;
}

function bindClearOnInput(form) {
  form.querySelectorAll('input').forEach((input) => {
    input.addEventListener('input', () => clearError(input));
  });
}

// --- Register form ---

const registerForm = document.querySelector('.js-register-form');
const phoneInput = registerForm.querySelector('input[name="phone"]');

const phoneMask = IMask(phoneInput, {
  mask: '+{7} (000) 000-00-00',
});

const registerValidators = {
  email(input) {
    if (!input.value.trim()) return 'Enter your email';
    if (!emailRegex.test(input.value.trim())) return 'Invalid email address';
    return '';
  },
  phone() {
    if (!phoneMask.unmaskedValue) return 'Enter your phone number';
    if (!phoneMask.masked.isComplete) return 'Enter the full phone number';
    return '';
  },
  password(input) {
    if (!input.value) return 'Enter your password';
    if (input.value.length < 6) return 'Minimum 6 characters';
    return '';
  },
};

registerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (validateForm(registerForm, registerValidators)) {
    console.log('Register submitted', {
      email: registerForm.email.value,
      phone: phoneMask.unmaskedValue,
      password: registerForm.password.value,
    });
  }
});

bindClearOnInput(registerForm);

// --- Login form ---

const loginForm = document.querySelector('.js-login-form');

const loginValidators = {
  email(input) {
    if (!input.value.trim()) return 'Enter your email';
    if (!emailRegex.test(input.value.trim())) return 'Invalid email address';
    return '';
  },
  password(input) {
    if (!input.value) return 'Enter your password';
    return '';
  },
};

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (validateForm(loginForm, loginValidators)) {
    console.log('Login submitted', {
      email: loginForm.email.value,
      password: loginForm.password.value,
    });
  }
});

bindClearOnInput(loginForm);
