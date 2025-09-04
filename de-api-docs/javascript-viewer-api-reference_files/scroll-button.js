(() => {
  const scrollButton = document.getElementById('scrollToTopBtn');
  const threshold = 30;

  setButtonPosition();

  window.onscroll = () => {
    setButtonPosition();
  };

  function setButtonPosition() {
    if (document.body.scrollTop > threshold || document.documentElement.scrollTop > threshold) {
      scrollButton.style.display = 'block';
    } else {
      scrollButton.style.display = 'none';
    }
  }

  scrollButton.onclick = () => {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  };
})();
