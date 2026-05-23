let _navigate;

export function setNavigate(fn) {
  _navigate = fn;
}

export function navigateTo(path) {
  if (typeof _navigate === 'function') {
    _navigate(path);
  } else {
    window.location.href = path;
  }
}
