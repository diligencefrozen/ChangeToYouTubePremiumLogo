// ==UserScript==

// @name         ChangeToYouTubePremiumLogo(Original, Red)

// @version      20240918.3

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

    // jQuery를 사용할 수 있도록 설정
    
    const $ = jQuery.noConflict(true);

    // GM_info가 존재하면, Tampermonkey 환경이므로 리디렉션 방지
    
    if (typeof GM_info !== 'undefined') {
        
        console.log("Tampermonkey is detected. Script is running in user script manager environment.");

        // 유튜브 로고 컨테이너 선택 및 비우기
        
        let logoContainer = $('#logo-icon').empty();

        // 다크 모드와 라이트 모드 로고 URL 설정
        
        let darkModeLogoURL = 'https://github.com/diligencefrozen/ChangeToYouTubePremiumLogo/blob/main/logo/logov1.png?raw=true';
        
        let lightModeLogoURL = 'https://github.com/diligencefrozen/ChangeToYouTubePremiumLogo/blob/main/logo/logov2.png?raw=true';

        // 현재 페이지가 다크 모드인지 확인하여 로고 URL 선택
        
        let logoURL = $('html').is('[dark]') ? darkModeLogoURL : lightModeLogoURL;

        // 새 이미지 요소 생성
        
        let imgElement = $('<img>', { src: logoURL, style: 'width: 94px' });

        // 로고 컨테이너에 이미지 추가
        
        logoContainer.append(imgElement);
        
    } else {
        
        // GM_info가 없을 경우, 유저가 Tampermonkey를 설치하지 않았으므로 리디렉션 실행
        
        if (!localStorage.getItem('tampermonkeyRedirected')) {
            
            alert('You need Tampermonkey or a similar user script manager to run this script. Redirecting you to the installation page...');
            
            window.location.href = 'https://tampermonkey.net/';
            
            localStorage.setItem('tampermonkeyRedirected', 'true');
            
        }
    }
})();
