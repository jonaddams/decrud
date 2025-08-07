(function() {
  const scrollButton = document.getElementById("scrollToTopBtn");
  const threshold = 30;

  setButtonPosition();

  window.onscroll = function() {
    setButtonPosition();
  };

  function setButtonPosition() {
    if (document.body.scrollTop > threshold || document.documentElement.scrollTop > threshold) {
      scrollButton.style.display = "block";
    } else {
      scrollButton.style.display = "none";
    }
  }

  scrollButton.onclick = function() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  };
})()
