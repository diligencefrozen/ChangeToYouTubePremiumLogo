function changeYouTubeLogo() {
    var ytIcon = document.getElementById('logo-icon');
    ytIcon.innerHTML = '';

    var newLogo = new Image();
    newLogo.width = 94;

    if (document.documentElement.getAttribute('dark')) {
        newLogo.src = 'https://github.com/diligencefrozen/FakeYTPremiumlogo/blob/main/logo/logov1.png?raw=true';
    } else {
        newLogo.src = 'https://github.com/diligencefrozen/FakeYTPremiumlogo/blob/main/logo/logov2.png?raw=true';
    }

    ytIcon.appendChild(newLogo);
}

changeYouTubeLogo();

