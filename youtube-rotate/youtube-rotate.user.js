// ==UserScript==
// @name         YouTube Rotate Video 90°
// @namespace    youtube-rotate-video
// @version      1.3.1
// @description  Rotate YouTube videos left or right in 90-degree steps, fitted to the player.
// @license      MIT
// @author       Tsujigiri
// @homepageURL  https://github.com/NotTsujigiri/public-tampermonkey-scripts
// @supportURL   https://github.com/NotTsujigiri/public-tampermonkey-scripts/issues
// @match        https://www.youtube.com/*
// @match        https://youtube.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(() => {
    'use strict';
    const id = 'yt-rotate-video-button';
    let angle = 0, video = null, player = null, saved = null, pending = false;
    const properties = ['rotate', 'scale', 'transform-origin'];
    const resizeObserver = new ResizeObserver(schedule);
    const styleObserver = new MutationObserver(schedule);

    function restore() {
        if (video && saved) {
            for (const [property, value, priority] of saved) {
                if (value) video.style.setProperty(property, value, priority);
                else video.style.removeProperty(property);
            }
        }
        saved = null;
    }

    function set(property, value) {
        if (video.style.getPropertyValue(property) !== value ||
            video.style.getPropertyPriority(property) !== 'important') {
            video.style.setProperty(property, value, 'important');
        }
    }

    function apply() {
        for (const [buttonId, direction] of [[id, 'right'], [id + '-left', 'left']]) {
          const button = document.getElementById(buttonId);
          if (button) {
            const label = `Rotate 90° ${direction} (current rotation: ${angle}°)`;
            if (button.title !== label) {
                button.title = label;
                button.setAttribute('aria-label', label);
            }
          }
        }
        if (!video || !player) return;
        if (!angle) { restore(); return; }
        // clientWidth/Height ignore our rotation. The video wrapper can have height 0.
        const width = video.clientWidth, height = video.clientHeight;
        if (!width || !height || !player.clientWidth || !player.clientHeight) return;
        if (!saved) saved = properties.map(p => [p,
            video.style.getPropertyValue(p), video.style.getPropertyPriority(p)]);
        const quarterTurn = angle === 90 || angle === 270;
        const scale = Math.min(1,
            player.clientWidth / (quarterTurn ? height : width),
            player.clientHeight / (quarterTurn ? width : height));
        set('transform-origin', '50% 50%');
        set('rotate', `${angle}deg`);
        set('scale', String(scale));
    }

    function scan() {
        pending = false;
        const nextPlayer = document.querySelector('#movie_player');
        const nextVideo = nextPlayer?.querySelector('video.html5-main-video, video') || null;
        if (nextPlayer !== player || nextVideo !== video) {
            styleObserver.disconnect();
            resizeObserver.disconnect();
            if (video) {
                video.removeEventListener('loadedmetadata', schedule);
                video.removeEventListener('resize', schedule);
            }
            restore();
            player = nextPlayer;
            video = nextVideo;
            if (player) resizeObserver.observe(player);
            if (video) {
                resizeObserver.observe(video);
                styleObserver.observe(video, {attributes: true, attributeFilter: ['style']});
                video.addEventListener('loadedmetadata', schedule);
                video.addEventListener('resize', schedule);
            }
        }
        if (!player) return;
        const fullscreen = player.querySelector('.ytp-fullscreen-button');
        const controls = fullscreen?.parentElement || player.querySelector('.ytp-right-controls');
        if (controls) {
          for (const delta of [90, -90]) {
            const buttonId = delta === 90 ? id : id + '-left';
            const anchor = delta === 90 ? fullscreen : document.getElementById(id);
            let button = document.getElementById(buttonId);
            if (!button) {
                button = document.createElement('button');
                button.id = buttonId;
                button.type = 'button';
                button.className = 'ytp-button';
                button.style.cssText = 'color:white;min-width:40px;width:48px;padding:0;flex-shrink:0;vertical-align:top;cursor:pointer;position:relative';
                // A centered SVG avoids font baseline and inherited line-height offsets.
                // Build with DOM methods: no HTML string / Trusted Types sink.
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('viewBox', '0 0 24 24');
                svg.setAttribute('aria-hidden', 'true');
                svg.setAttribute('focusable', 'false');
                svg.style.cssText = 'position:absolute!important;left:50%!important;top:50%!important;width:24px!important;height:24px!important;transform:translate(-50%,-50%)!important;margin:0!important;pointer-events:none;display:block';
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('d', 'M20 11a8 8 0 1 0-2.34 6.66 M20 4v7h-7');
                if (delta < 0) path.setAttribute('transform', 'translate(24 0) scale(-1 1)');
                path.setAttribute('fill', 'none');
                path.setAttribute('stroke', 'currentColor');
                path.setAttribute('stroke-width', '2');
                path.setAttribute('stroke-linecap', 'round');
                path.setAttribute('stroke-linejoin', 'round');
                svg.append(path);
                button.append(svg);
                button.addEventListener('click', event => {
                    event.preventDefault();
                    event.stopPropagation();
                    angle = (angle + delta + 360) % 360;
                    apply();
                });
            }
            // insertBefore requires the reference to be a DIRECT child.
            if (button.parentElement !== controls || (anchor && button.nextSibling !== anchor)) {
                controls.insertBefore(button, anchor || null);
            }
          }
        }
        apply();
    }

    function schedule() {
        if (!pending) { pending = true; requestAnimationFrame(scan); }
    }
    document.addEventListener('yt-navigate-start', () => { angle = 0; restore(); schedule(); });
    document.addEventListener('yt-navigate-finish', schedule);
    document.addEventListener('fullscreenchange', schedule);
    window.addEventListener('resize', schedule);
    new MutationObserver(schedule).observe(document.body, {childList: true, subtree: true});
    schedule();
})();
