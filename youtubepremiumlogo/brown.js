// ==UserScript==

// @name         ChangeToYouTubePremiumLogo(Original, Red)

// @version      20240120.10

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
    // jQuery를 충돌 없이 사용하기 위한 설정
    const $ = jQuery.noConflict(true);

    // 로고의 위치를 선택하고 기존 내용을 비움
    let logoContainer = $('#logo-icon').empty();

    // 적용할 로고 이미지의 URL 설정
    let darkModeLogoURL = 'https://github.com/diligencefrozen/ChangeToYouTubePremiumLogo/blob/main/logo/logov11.png?raw=true';
    let lightModeLogoURL = 'https://github.com/diligencefrozen/ChangeToYouTubePremiumLogo/blob/main/logo/logov12.png?raw=true';

    // 다크 모드 여부에 따라 적절한 로고 적용
    let logoURL = $('html').is('[dark]') ? darkModeLogoURL : lightModeLogoURL;

    // 이미지 요소 생성 및 스타일 설정
    let imgElement = $('<img>', { src: logoURL, style: 'width: 94px' });

    // 로고 컨테이너에 이미지 삽입
    logoContainer.append(imgElement);
})();
