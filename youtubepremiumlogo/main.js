// ==UserScript==

// @name         ChangeToYouTubePremiumLogo(Original, Red)

// @version      20240918.1

// @description  Change YouTube logo to Premium version

// @author       diligencefrozen

// @match        https://www.youtube.com/*

// @grant        none

// @namespace    https://github.com/diligencefrozen/ChangeToYouTubePremiumLogo

// @icon         https://www.google.com/s2/favicons?domain=youtube.com

// @updateURL    https://raw.githubusercontent.com/diligencefrozen/ChangeToYouTubePremiumLogo/main/youtubepremiumlogo/main.js

// @downloadURL  https://raw.githubusercontent.com/diligencefrozen/ChangeToYouTubePremiumLogo/main/youtubepremiumlogo/main.js

// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.6.4/jquery.min.js

// ==/UserScript==

(function() {
    
    'use strict';

    const $ = jQuery.noConflict(true);

    let logoContainer = $('#logo-icon').empty();

    let darkModeLogoURL = 'https://github.com/diligencefrozen/ChangeToYouTubePremiumLogo/blob/main/logo/logov1.png?raw=true';
    
    let lightModeLogoURL = 'https://github.com/diligencefrozen/ChangeToYouTubePremiumLogo/blob/main/logo/logov2.png?raw=true';

    let logoURL = $('html').is('[dark]') ? darkModeLogoURL : lightModeLogoURL;

    let imgElement = $('<img>', { src: logoURL, style: 'width: 94px' });

    logoContainer.append(imgElement);

    // 자동 설치 페이지로 리디렉션
    
    if (typeof GM_info === 'undefined') {
        
        window.location.href = 'https://tampermonkey.net/';
        
    }
})();
