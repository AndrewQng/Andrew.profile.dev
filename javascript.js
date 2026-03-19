document.addEventListener('DOMContentLoaded', () => {
    const mainPanel = document.getElementById('main-panel');
    const socialLinks = document.querySelectorAll('.links a');
    const discordCard = document.getElementById('discord-card-container');

    setTimeout(() => {
        mainPanel.classList.remove('opacity-0', 'translate-y-8');
    }, 200);

    const panelAnimationTime = 800;
    socialLinks.forEach((link, index) => {
        setTimeout(() => {
            link.classList.remove('opacity-0', 'translate-y-8');
        }, panelAnimationTime + (index * 150));
    });

    const discordDelay = panelAnimationTime + (socialLinks.length * 150);
    setTimeout(() => {
        discordCard.classList.remove('opacity-0', 'translate-y-8');
    }, discordDelay);

    const statsContainer = document.getElementById('stats-container');
    const statsDelay = discordDelay + 200;
    setTimeout(() => {
        if (statsContainer) {
            statsContainer.classList.remove('opacity-0', 'translate-y-8');
        }
    }, statsDelay);

    const andrewText = document.getElementById('andrew-text');
    const weaponScythe = document.getElementById('weapon-scythe');
    const andrewDelay = statsDelay + 500;
    
    setTimeout(() => {
        weaponScythe.classList.add('animate-scythe-slash');

        setTimeout(() => {
            const slashTrail = document.getElementById('slash-trail');
            if (slashTrail) slashTrail.classList.add('animate-slash-trail');
        }, 1000);

        setTimeout(() => {
            andrewText.classList.remove('opacity-0');
            andrewText.classList.add('animate-text-reveal');
        }, 1600);
    }, andrewDelay);

    const namespace = 'andrew_stats_perfect_v3'; // Đổi sang v3 và gọi trực tiếp API
    
    // Số liệu mặc định cộng thêm (để bù lại số view/click từ các bản cũ)
    const baseViews = 150; 
    const baseClicks = 42; 
    
    // Tăng lượt xem trực tiếp (không qua Proxy)
    fetch(`https://api.counterapi.dev/v1/${namespace}/views/up`)
        .then(res => res.json())
        .then(data => {
            const currentViews = (data.count || 1) + baseViews;
            document.getElementById('stat-views').innerText = currentViews.toLocaleString();
        })
        .catch(() => {
            document.getElementById('stat-views').innerText = (1 + baseViews).toLocaleString();
        });

    let globalClicks = parseInt(localStorage.getItem('andrew_clicks') || '0');
    // Lấy số click hiện tại (không tăng thêm)
    fetch(`https://api.counterapi.dev/v1/${namespace}/clicks`)
        .then(res => {
            if (!res.ok) return { count: 0 };
            return res.json();
        })
        .then(data => {
            if (data && data.count !== undefined) {
                globalClicks = Math.max(globalClicks, data.count + baseClicks);
                localStorage.setItem('andrew_clicks', globalClicks);
            }
            document.getElementById('stat-clicks').innerText = globalClicks.toLocaleString();
        }).catch(() => { 
            document.getElementById('stat-clicks').innerText = globalClicks.toLocaleString();
        });

    socialLinks.forEach(link => {
        link.addEventListener('click', () => {
            globalClicks++;
            localStorage.setItem('andrew_clicks', globalClicks);
            document.getElementById('stat-clicks').innerText = globalClicks.toLocaleString();

            fetch(`https://api.counterapi.dev/v1/${namespace}/clicks/up`)
                .then(res => res.json())
                .then(data => {
                    if (data && data.count !== undefined) {
                        globalClicks = Math.max(globalClicks, data.count);
                        localStorage.setItem('andrew_clicks', globalClicks);
                        document.getElementById('stat-clicks').innerText = globalClicks.toLocaleString();
                    }
                }).catch(() => {});
        });
    });
});

const discordId = '582876202222747679';

async function updateDiscordStatus() {
    try {
        const res = await fetch(`https://api.lanyard.rest/v1/users/${discordId}`);
        const { data, success } = await res.json();

        if (success) {
            const avatarUrl = `https://cdn.discordapp.com/avatars/${data.discord_user.id}/${data.discord_user.avatar}.png`;
            document.getElementById('discord-avatar').src = avatarUrl;
            
            const decorationImg = document.getElementById('discord-decoration');
            if (data.discord_user.avatar_decoration_data) {
                decorationImg.src = `https://cdn.discordapp.com/avatar-decoration-presets/${data.discord_user.avatar_decoration_data.asset}.png?size=96`;
                decorationImg.classList.remove('hidden');
            } else {
                decorationImg.classList.add('hidden');
            }

            const bannerEl = document.getElementById('discord-banner');
            if (data.discord_user.banner) {
                const ext = data.discord_user.banner.startsWith('a_') ? 'gif' : 'png';
                bannerEl.style.backgroundImage = `url(https://cdn.discordapp.com/banners/${data.discord_user.id}/${data.discord_user.banner}.${ext}?size=300)`;
                bannerEl.style.backgroundColor = 'transparent';
            } else if (data.discord_user.banner_color) {
                bannerEl.style.backgroundColor = data.discord_user.banner_color;
                bannerEl.style.backgroundImage = 'none';
            }

            const profileEffectEl = document.getElementById('discord-profile-effect');
            const profileEffectId = data.discord_user.profile_effect || data.discord_user.profile_effect_id;
            if (profileEffectId) {
                profileEffectEl.src = `https://cdn.discordapp.com/profile-effects/${profileEffectId}/intro.png`;
                profileEffectEl.classList.remove('hidden');
            } else {
                profileEffectEl.classList.add('hidden');
            }

            document.getElementById('discord-global-name').innerText = data.discord_user.global_name || data.discord_user.username;
            document.getElementById('discord-username').innerText = data.discord_user.discriminator === "0" || data.discord_user.discriminator === "0000" 
                ? `@${data.discord_user.username}` 
                : `${data.discord_user.username}#${data.discord_user.discriminator}`;

            const customStatus = data.activities.find(a => a.type === 4);
            const customStatusEl = document.getElementById('discord-custom-status');
            if (customStatus) {
                let statusHTML = '';
                if (customStatus.emoji) {
                    if (customStatus.emoji.id) {
                        const ext = customStatus.emoji.animated ? 'gif' : 'png';
                        statusHTML += `<img src="https://cdn.discordapp.com/emojis/${customStatus.emoji.id}.${ext}" class="w-4 h-4 mr-1.5 object-contain">`;
                    } else {
                        statusHTML += `<span class="mr-1">${customStatus.emoji.name}</span>`;
                    }
                }
                if (customStatus.state) statusHTML += `<span>${customStatus.state}</span>`;
                customStatusEl.innerHTML = statusHTML;
                customStatusEl.classList.remove('hidden');
            } else {
                customStatusEl.classList.add('hidden');
            }

            const statusColors = { online: 'bg-green-500', idle: 'bg-yellow-500', dnd: 'bg-red-500', offline: 'bg-gray-500' };
            const statusTexts = { online: 'Đang trực tuyến', idle: 'Đang vắng mặt', dnd: 'Đừng làm phiền', offline: 'Ngoại tuyến' };
            const statusTextColors = { online: 'text-green-400', idle: 'text-yellow-400', dnd: 'text-red-400', offline: 'text-gray-400' };

            const dot = document.getElementById('discord-status-dot');
            const text = document.getElementById('discord-status-text');

            dot.className = `absolute bottom-0 right-0 w-4 h-4 border-[3px] border-[#3b176d] rounded-full z-30 ${statusColors[data.discord_status]}`;
            dot.title = statusTexts[data.discord_status] || 'Offline';
            text.innerText = statusTexts[data.discord_status];
            text.className = `text-xs font-medium ${statusTextColors[data.discord_status]}`;

            if (data.kv && data.kv.location) {
                const kvLocation = document.getElementById('discord-kv-location');
                kvLocation.innerText = `📍 ${data.kv.location}`;
                kvLocation.classList.remove('hidden');
            }

            const spotifyWidget = document.getElementById('spotify-widget');
            if (data.spotify) {
                document.getElementById('spotify-album-art').src = data.spotify.album_art_url;
                document.getElementById('spotify-song').innerText = data.spotify.song;
                document.getElementById('spotify-song').title = data.spotify.song;
                document.getElementById('spotify-artist').innerText = data.spotify.artist;
                document.getElementById('spotify-artist').title = data.spotify.artist;
                
                spotifyWidget.onclick = () => window.open(`https://open.spotify.com/track/${data.spotify.track_id}`, '_blank');

                clearInterval(window.spotifyInterval);
                const { start, end } = data.spotify.timestamps;
                
                const updateProgress = () => {
                    const now = new Date().getTime();
                    const total = end - start;
                    let current = now - start;
                    if (current > total) current = total;

                    const calcTime = (ms) => {
                        const totalSeconds = Math.floor(ms / 1000);
                        const minutes = Math.floor(totalSeconds / 60);
                        const seconds = totalSeconds % 60;
                        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
                    };

                    document.getElementById('spotify-time-current').innerText = calcTime(current);
                    document.getElementById('spotify-time-total').innerText = calcTime(total);
                    document.getElementById('spotify-progress').style.width = `${(current / total) * 100}%`;
                };
                
                updateProgress();
                window.spotifyInterval = setInterval(updateProgress, 1000);

                spotifyWidget.classList.remove('pointer-events-none');
                spotifyWidget.classList.remove('translate-y-20', 'opacity-0');
            } else {
                clearInterval(window.spotifyInterval);
                spotifyWidget.classList.add('pointer-events-none');
                spotifyWidget.classList.add('translate-y-20', 'opacity-0');
            }
        }
    } catch (err) {
        console.error(err);
    }
}

updateDiscordStatus();
setInterval(updateDiscordStatus, 30000);

const cursor = document.getElementById('custom-cursor');
let currentCursorSrc = 'default.gif';
let mouseX = 0, mouseY = 0;
let cursorVisible = false;

// Vòng lặp đồng bộ hóa việc render chuột với tần số quét màn hình
const renderCursor = () => {
    if (cursorVisible) {
        cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    }
    requestAnimationFrame(renderCursor);
};
requestAnimationFrame(renderCursor);

document.addEventListener('mousemove', (e) => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    if (!cursorVisible) {
        cursor.style.display = 'block';
        cursorVisible = true;
    }
    
    if (e.target.closest('a, button, #spotify-widget')) {
        if (currentCursorSrc !== 'pointer.gif') { cursor.src = 'pointer.gif'; currentCursorSrc = 'pointer.gif'; }
    } else {
        if (currentCursorSrc !== 'default.gif') { cursor.src = 'default.gif'; currentCursorSrc = 'default.gif'; }
    }
});
document.addEventListener('mouseleave', () => {
    cursor.style.display = 'none';
    cursorVisible = false;
});