// ==UserScript==

// @name         ChangeToYouTubePremiumLogo(indigo)

// @version      20241014.1

// @description  Change YouTube logo to Premium version

// @author       diligencefrozen

// @match        https://www.youtube.com/*

// @grant        none

// @namespace    https://github.com/diligencefrozen/ChangeToYouTubePremiumLogo

// @icon         https://www.google.com/s2/favicons?domain=youtube.com

// @updateURL    https://raw.githubusercontent.com/diligencefrozen/ChangeToYouTubePremiumLogo/main/youtubepremiumlogo/indigo.js

// @downloadURL  https://raw.githubusercontent.com/diligencefrozen/ChangeToYouTubePremiumLogo/main/youtubepremiumlogo/indigo.js

// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.6.4/jquery.min.js

// ==/UserScript==


(function() {
    'use strict';

    const $ = jQuery.noConflict(true);


    let logoContainer = $('#logo-icon').empty();


    let darkModeLogoURL = 'https://github.com/diligencefrozen/ChangeToYouTubePremiumLogo/blob/main/logo/logov15.png?raw=true';
    let lightModeLogoURL = 'https://github.com/diligencefrozen/ChangeToYouTubePremiumLogo/blob/main/logo/logov16.png?raw=true';


    let logoURL = $('html').is('[dark]') ? darkModeLogoURL : lightModeLogoURL;


    let imgElement = $('<img>', { src: logoURL, style: 'width: 94px' });


    logoContainer.append(imgElement);
})();
