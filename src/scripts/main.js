 // ═══════════ ADAPTIVE AMBIENT PARTICLES ═══════════
(function(){
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const cores = navigator.hardwareConcurrency || 4;
    const memory = navigator.deviceMemory || 4;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || reduced || cores <= 4 || memory <= 4) {
        canvas.style.display = 'none';
        return;
    }

    const ctx = canvas.getContext('2d', { alpha: true });
    let W = 0, H = 0;
    const particles = [];
    let running = true;

    function resize(){
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        W = Math.floor(window.innerWidth * dpr);
        H = Math.floor(window.innerHeight * dpr);
        canvas.width = W;
        canvas.height = H;
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        ctx.setTransform(dpr,0,0,dpr,0,0);
        W = window.innerWidth;
        H = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const count = cores >= 8 && memory >= 8 ? 34 : 24;
    for(let i=0;i<count;i++) particles.push({
        x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.7+.5,
        dx:(Math.random()-.5)*.18,dy:(Math.random()-.5)*.12,
        o:Math.random()*.35+.15,pulse:Math.random()*Math.PI*2
    });

    function draw(){
        if (!running) return;
        ctx.clearRect(0,0,W,H);
        for(const p of particles){
            p.pulse += .012;
            ctx.globalAlpha = Math.max(.06, Math.min(.6, p.o + Math.sin(p.pulse)*.1));
            ctx.fillStyle = '#E8C97A';
            ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
            p.x += p.dx; p.y += p.dy;
            if(p.x < -10) p.x=W+10; else if(p.x>W+10) p.x=-10;
            if(p.y < -10) p.y=H+10; else if(p.y>H+10) p.y=-10;
        }
        ctx.globalAlpha=1;
        requestAnimationFrame(draw);
    }
    document.addEventListener('visibilitychange',()=>{
        running=!document.hidden;
        if(running) requestAnimationFrame(draw);
    });
    draw();
})();


// ═══════════ ADAPTIVE AURORA POINTER TRACKER ═══════════
(function(){
    const aurora=document.getElementById('bg-aurora');
    if(!aurora) return;
    const finePointer=window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cores=navigator.hardwareConcurrency || 4;
    if(!finePointer || reduced || cores<=4) return;

    let ax=30,ay=25,bx=70,by=70,tx=30,ty=25,active=false,raf=0;
    document.addEventListener('pointermove',e=>{
        tx=e.clientX/window.innerWidth*100;
        ty=e.clientY/window.innerHeight*100;
        active=true;
        if(!raf) raf=requestAnimationFrame(step);
    },{passive:true});
    function step(){
        ax+=(tx-ax)*.045; ay+=(ty-ay)*.045;
        bx+=((100-tx)-bx)*.035; by+=((100-ty)-by)*.035;
        aurora.style.setProperty('--ax',ax+'%'); aurora.style.setProperty('--ay',ay+'%');
        aurora.style.setProperty('--bx',bx+'%'); aurora.style.setProperty('--by',by+'%');
        const settled=Math.abs(tx-ax)+Math.abs(ty-ay)+Math.abs((100-tx)-bx)+Math.abs((100-ty)-by) < .2;
        if(active && !settled) raf=requestAnimationFrame(step); else {active=false;raf=0;}
    }
})();


// ═══════════ SCROLL REVEAL OBSERVER ═══════════
    (function(){
        const els = document.querySelectorAll('.reveal, .reveal-stagger');
        if (!('IntersectionObserver' in window)) {
            els.forEach(el => el.classList.add('active'));
            return;
        }
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) { e.target.classList.add('active'); obs.unobserve(e.target); }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
        
        window.refreshReveals = () => {
            els.forEach(el => {
                const rect = el.getBoundingClientRect();
                // If invitation isn't opened, don't auto-activate
                if (!document.body.classList.contains('invitation-opened')) {
                    obs.observe(el);
                    return;
                }
                
                if (rect.top < window.innerHeight) {
                    el.classList.add('active');
                } else {
                    obs.observe(el);
                }
            });
        };
        
        window.refreshReveals();
    })();


    // ═══════════ MAIN-PAGE ONLY AUDIO PLAYER ═══════════
    // Put your song file beside index.html and name it: Jhilmil-Sitaron.mp3
    const audio = document.getElementById('wedding-audio');
    const audioIcon = document.getElementById('audio-icon');
    const audioPulse = document.getElementById('audio-pulse');
    const audioStatus = document.getElementById('audio-status');
    let isPlaying = false;
    let musicStartedAfterInvitation = false;
    let musicFadeTimer = null;

    function fadeAudioTo(targetVolume, duration) {
        if (!audio) return;
        clearInterval(musicFadeTimer);
        const start = audio.volume;
        const startTime = performance.now();
        musicFadeTimer = setInterval(() => {
            const t = Math.min(1, (performance.now() - startTime) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            audio.volume = start + (targetVolume - start) * eased;
            if (t >= 1) clearInterval(musicFadeTimer);
        }, 32);
    }

    function updateAudioUI(playing) {
        if (!audioIcon || !audioPulse) return;
        if (playing) {
            audioIcon.textContent = '❚❚';
            audioPulse.style.animation = 'pulse 1.5s ease-in-out infinite';
            audioPulse.style.opacity = '1';
            if (audioStatus) audioStatus.textContent = 'Now Playing';
            isPlaying = true;
        } else {
            audioIcon.textContent = '▶';
            audioPulse.style.animation = 'none';
            audioPulse.style.opacity = '0.4';
            if (audioStatus) audioStatus.textContent = 'Paused';
            isPlaying = false;
        }
    }

    window.toggleAudio = function() {
        if (!audio) return;
        if (audio.paused) {
            audio.muted = false;
            audio.volume = 0.9;
            audio.play().then(() => {
                musicStartedAfterInvitation = true;
                updateAudioUI(true);
            }).catch(err => {
                console.log('Audio play failed:', err);
                if (audioStatus) audioStatus.textContent = 'Tap to Play';
            });
        } else {
            audio.pause();
            updateAudioUI(false);
        }
    };

    window.primeInvitationMusic = function() {
        if (!audio || musicStartedAfterInvitation) return;
        audio.muted = false;
        audio.volume = 0;
        audio.play().then(() => {
            musicStartedAfterInvitation = true;
            updateAudioUI(true);
            if (audioStatus) audioStatus.textContent = 'Opening...';
        }).catch(err => {
            console.log('Music prime blocked:', err);
            updateAudioUI(false);
            if (audioStatus) audioStatus.textContent = 'Tap to Play';
        });
    };

    window.startInvitationMusic = function() {
        if (!audio || musicStartedAfterInvitation) return;
        audio.muted = false;
        audio.volume = 0;
        audio.play().then(() => {
            musicStartedAfterInvitation = true;
            updateAudioUI(true);
            fadeAudioTo(0.9, 900);
        }).catch(err => {
            // This normally should not happen because it is called from OPEN INVITATION click.
            console.log('Main-page music blocked:', err);
            updateAudioUI(false);
            if (audioStatus) audioStatus.textContent = 'Tap to Play';
        });
    };

    window.fadeInInvitationMusic = function() {
        if (!audio) return;
        audio.muted = false;
        if (audio.paused) {
            window.startInvitationMusic();
        } else {
            updateAudioUI(true);
            fadeAudioTo(0.9, 900);
        }
    };

    if (audio) {
        audio.addEventListener('play', () => updateAudioUI(true));
        audio.addEventListener('pause', () => updateAudioUI(false));
        audio.addEventListener('ended', () => {
            if (!audio.loop) updateAudioUI(false);
        });

        // Initial idle state for floating control
        audioIcon.textContent = '▶';
        audioPulse.style.animation = 'none';
        audioPulse.style.opacity = '0.4';
        if (audioStatus) audioStatus.textContent = 'Click to Play';
        isPlaying = false;
    }


    // ═══════════ REAL RSVP SYSTEM ═══════════
const RSVP_EMAIL_WEBHOOK = window.RSVP_EMAIL_WEBHOOK || "";
function setRSVPStatus(message, type) { const el=document.getElementById('rsvp-status-message'); if(el){el.textContent=message||'';el.className='rsvp-status-message '+(type||'');} }
async function sendRSVPEmail(data){ if(!RSVP_EMAIL_WEBHOOK) return {skipped:true}; await fetch(RSVP_EMAIL_WEBHOOK,{method:'POST',mode:'no-cors',body:JSON.stringify(data)}); return {sent:true}; }
async function saveRSVP(data){ return window.firebaseFunctions.addDoc(window.firebaseFunctions.collection(window.firebaseDB,'rsvps'),{name:data.name,guests:data.guests,attendance:data.attendance,status:data.status,message:data.message,timestamp:window.firebaseFunctions.serverTimestamp()}); }
function showRSVPSuccess(){const c=document.getElementById('fireworks-container');if(c){c.style.display='flex';launchFireworks();}}
window.submitRSVP=async function(){
 const form=document.getElementById('rsvp-form'); if(!form)return;
 const name=document.getElementById('rsvp-name')?.value.trim(), guests=Number(document.getElementById('rsvp-guests')?.value||1), status=document.getElementById('rsvp-status')?.value||'attending', attendance=document.getElementById('rsvp-attendance')?.value||'Attending All Events', message=document.getElementById('rsvp-message')?.value.trim()||'', button=document.getElementById('rsvp-submit');
 const honeypot=document.getElementById('rsvp-website')?.value.trim(); const last=Number(localStorage.getItem('nizam_rsvp_last_submit')||0); if(honeypot)return; if(Date.now()-last<15000)return setRSVPStatus('Please wait a few seconds before submitting again.','error'); if(!navigator.onLine)return setRSVPStatus('You appear to be offline. Please reconnect and try again.','error');
 if(!name||name.length<2)return setRSVPStatus('Please enter your full name.','error'); if(!Number.isInteger(guests)||guests<1||guests>10)return setRSVPStatus('Please select a valid guest count.','error'); if(message.length>300)return setRSVPStatus('Your message is too long.','error');
 if(button){button.disabled=true;button.textContent='SENDING…';} setRSVPStatus('Saving your RSVP securely…','loading');
 const payload={name,guests,status,attendance,message};
 try{ await saveRSVP(payload); localStorage.setItem('nizam_rsvp_last_submit',String(Date.now())); let emailResult={skipped:true}; try{emailResult=await sendRSVPEmail(payload);}catch(e){console.warn('RSVP email notification failed:',e);} form.reset();document.getElementById('rsvp-guests').value='1';document.getElementById('rsvp-status').value='attending';document.getElementById('rsvp-attendance').value='Attending All Events';setRSVPStatus(emailResult.sent?'RSVP received. Notification sent.':'RSVP received successfully.','success');showRSVPSuccess(); }
 catch(e){console.error('RSVP submission failed:',e);setRSVPStatus('We could not save your RSVP. Please check your connection and try again.','error');}
 finally{if(button){button.disabled=false;button.textContent='ACCEPT WITH BLESSINGS';}}
};
(function(){const f=document.getElementById('rsvp-form');if(f)f.addEventListener('submit',e=>{e.preventDefault();window.submitRSVP();});})();
function closeFireworks(){document.getElementById('fireworks-container').style.display='none';if(window._fwInt)clearInterval(window._fwInt);} window.closeFireworks=closeFireworks;
    function launchFireworks() {
        const canvas=document.getElementById('fireworks-canvas');
        const container=document.getElementById('fireworks-container');
        if(!canvas || !container) return;
        const ctx=canvas.getContext('2d',{alpha:true});
        const cores=navigator.hardwareConcurrency||4;
        const memory=navigator.deviceMemory||4;
        const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const mobile=window.matchMedia('(max-width: 767px)').matches;
        const particlesPerBurst=reduced?20:(mobile||cores<=4||memory<=4?42:64);
        const colors=['#C9A84C','#E8C97A','#FAF3E0','#8B6914','#FFFFFF','#1A5C45'];
        let sparks=[];
        let raf=0;
        let stopped=false;

        function resize(){
            const dpr=Math.min(window.devicePixelRatio||1,1.5);
            canvas.width=Math.floor(window.innerWidth*dpr);
            canvas.height=Math.floor(window.innerHeight*dpr);
            canvas.style.width='100vw'; canvas.style.height='100vh';
            ctx.setTransform(dpr,0,0,dpr,0,0);
        }
        resize();
        window.addEventListener('resize',resize,{passive:true});

        function burst(x,y){
            for(let i=0;i<particlesPerBurst;i++){
                const angle=Math.random()*Math.PI*2, speed=Math.random()*5+1.2;
                sparks.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,life:Math.random()*48+38,color:colors[(Math.random()*colors.length)|0],size:Math.random()*2.3+1});
            }
        }
        for(let i=0;i<(reduced?2:4);i++) setTimeout(()=>burst(Math.random()*innerWidth*.7+innerWidth*.15,Math.random()*innerHeight*.5+60),i*180);
        window._fwInt=setInterval(()=>{
            if(!stopped && !document.hidden && container.style.display!=='none') burst(Math.random()*innerWidth,Math.random()*innerHeight*.6+40);
        }, reduced?1200:900);

        function animate(){
            if(stopped || container.style.display==='none'){ raf=0; return; }
            if(document.hidden){ raf=requestAnimationFrame(animate); return; }
            ctx.clearRect(0,0,innerWidth,innerHeight);
            ctx.globalCompositeOperation='lighter';
            for(let i=sparks.length-1;i>=0;i--){
                const p=sparks[i];
                p.x+=p.vx; p.y+=p.vy; p.vy+=.035; p.life--;
                ctx.globalAlpha=Math.max(0,p.life/70); ctx.fillStyle=p.color;
                ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fill();
                if(p.life<=0) sparks.splice(i,1);
            }
            ctx.globalAlpha=1; ctx.globalCompositeOperation='source-over';
            raf=requestAnimationFrame(animate);
        }
        animate();
        window._stopFireworks=()=>{
            stopped=true; clearInterval(window._fwInt); sparks.length=0;
            if(raf) cancelAnimationFrame(raf); raf=0;
            window.removeEventListener('resize',resize);
        };
    }

    // ═══════════ RESPONSIVE GRID FIX ═══════════
    (function(){
        function fixGrids() {
            // Only target inline-style grids, not CSS-class-based grids
            const inlineGrids = document.querySelectorAll('[style*="grid-template-columns: 1fr 1fr"]');
            if (window.innerWidth < 768) {
                inlineGrids.forEach(el => {
                    if (!el.classList.contains('gallery-grid')) {
                        el.style.gridTemplateColumns = '1fr';
                    }
                });
            } else {
                inlineGrids.forEach(el => {
                    if (!el.classList.contains('gallery-grid')) {
                        el.style.gridTemplateColumns = '1fr 1fr';
                    }
                });
            }
        }
        fixGrids();
        window.addEventListener('resize', fixGrids);
    })();

    // ═══════════ COUNTDOWN TIMER ═══════════
    (function(){
        const targetDate = new Date('2026-12-18T17:30:00').getTime();
        
        const dEl = document.getElementById('cd-days');
        const hEl = document.getElementById('cd-hours');
        const mEl = document.getElementById('cd-mins');
        const sEl = document.getElementById('cd-secs');
        
        if (!dEl) return;
        
        function pad(n){ return String(Math.max(0,n)).padStart(2,'0'); }
        
        function update(){
            const now = Date.now();
            const diff = targetDate - now;
            
            if (diff <= 0) {
                dEl.textContent = '00';
                hEl.textContent = '00';
                mEl.textContent = '00';
                sEl.textContent = '00';
                return;
            }
            
            const days  = Math.floor(diff / (1000*60*60*24));
            const hours = Math.floor((diff / (1000*60*60)) % 24);
            const mins  = Math.floor((diff / (1000*60)) % 60);
            const secs  = Math.floor((diff / 1000) % 60);
            
            dEl.textContent = pad(days);
            hEl.textContent = pad(hours);
            mEl.textContent = pad(mins);
            sEl.textContent = pad(secs);
        }
        
        update();
        setInterval(update, 1000);
    })();

    // ═══════════ SCRATCH CARD FUNCTIONALITY ═══════════
    (function(){
        const scratchCards = document.querySelectorAll('.scratch-card');
        
        window.setupScratchCanvases = () => {
            scratchCards.forEach(card => {
                const canvas = card.querySelector('canvas');
                if (canvas && canvas._setup) canvas._setup();
            });
        };

        scratchCards.forEach(card => {
            const result = card.querySelector('.scratch-result');
            const wrap = document.createElement('div');
            wrap.className = 'scratch-canvas-wrap';
            card.appendChild(wrap);
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            wrap.appendChild(canvas);
            
            let isDrawing = false;
            let scratchedPixels = 0;
            let isRevealed = false;
            const scratchState = { samplePending:false, sampleCanvas:document.createElement('canvas'), sampleCtx:null };
            scratchState.sampleCtx = scratchState.sampleCanvas.getContext('2d', { willReadFrequently:true });
            
            function setupCanvas() {
                const rect = card.getBoundingClientRect();
                canvas.width = rect.width;
                canvas.height = rect.height;
                const cx = canvas.width / 2;
                const cy = canvas.height / 2;
                const r  = Math.min(cx, cy);
                
                // Clip to circle shape
                ctx.save();
                ctx.globalCompositeOperation = 'source-over';
                ctx.beginPath();
                ctx.arc(cx, cy, r, 0, Math.PI * 2);
                ctx.clip();
                
                // Gold radial gradient fill
                const grad = ctx.createRadialGradient(cx * 0.7, cy * 0.6, r * 0.05, cx, cy, r);
                grad.addColorStop(0,   '#F0D875');
                grad.addColorStop(0.4, '#C9A84C');
                grad.addColorStop(0.8, '#8B6914');
                grad.addColorStop(1,   '#6B4F0E');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Diagonal lines
                ctx.strokeStyle = 'rgba(139, 105, 20, 0.35)';
                ctx.lineWidth = 1;
                for (let i = -canvas.height; i < canvas.width + canvas.height; i += 12) {
                    ctx.beginPath();
                    ctx.moveTo(i, 0);
                    ctx.lineTo(i + canvas.height, canvas.height);
                    ctx.stroke();
                }
                
                // Texture dots
                for (let i = 0; i < 400; i++) {
                    ctx.fillStyle = `rgba(255,220,100,${Math.random() * 0.25})`;
                    ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 2.5, Math.random() * 2.5);
                }
                
                // Shine arc at top
                ctx.strokeStyle = 'rgba(255,255,255,0.3)';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(cx, cy, r * 0.6, Math.PI * 1.2, Math.PI * 1.9);
                ctx.stroke();
                
                // Text
                ctx.fillStyle = 'rgba(250, 243, 224, 0.9)';
                const isGrand = card.classList.contains('grand');
                ctx.font = `bold ${isGrand ? 16 : 13}px "Cinzel Decorative", serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('✦ SCRATCH ✦', cx, cy - (isGrand ? 12 : 10));
                ctx.font = `${isGrand ? 13 : 11}px "Cormorant Garamond", serif`;
                ctx.fillStyle = 'rgba(250, 243, 224, 0.65)';
                ctx.fillText('to reveal', cx, cy + (isGrand ? 10 : 8));
                
                ctx.restore();
                // Now switch to erase mode
                ctx.globalCompositeOperation = 'destination-out';
                
                scratchedPixels = 0;
                isRevealed = false;
            }
            
            function getPos(e) {
                const rect = canvas.getBoundingClientRect();
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                const clientY = e.touches ? e.touches[0].clientY : e.clientY;
                return {
                    x: clientX - rect.left,
                    y: clientY - rect.top
                };
            }
            
            function scratch(e) {
                if (!isDrawing || isRevealed) return;
                e.preventDefault();
                const pos = getPos(e);
                const isGrand = card.classList.contains('grand');
                const brushSize = isGrand ? 38 : 28;
                
                ctx.globalCompositeOperation = 'destination-out';
                // Soft gradient eraser for smooth scratching feel
                const eraseGrad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, brushSize);
                eraseGrad.addColorStop(0, 'rgba(0,0,0,1)');
                eraseGrad.addColorStop(0.5, 'rgba(0,0,0,0.8)');
                eraseGrad.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = eraseGrad;
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, brushSize, 0, Math.PI * 2);
                ctx.fill();
                
                // Sample coverage at low resolution instead of scanning the full canvas on every pointer event.
                // This keeps scratching responsive on older phones and integrated GPUs.
                if (!scratchState.samplePending) {
                    scratchState.samplePending = true;
                    setTimeout(() => {
                        scratchState.samplePending = false;
                        const sampleSize = 32;
                        scratchState.sampleCanvas.width = sampleSize;
                        scratchState.sampleCanvas.height = sampleSize;
                        scratchState.sampleCtx.clearRect(0, 0, sampleSize, sampleSize);
                        scratchState.sampleCtx.drawImage(canvas, 0, 0, sampleSize, sampleSize);
                        const data = scratchState.sampleCtx.getImageData(0, 0, sampleSize, sampleSize).data;
                        let transparent = 0;
                        for (let i = 3; i < data.length; i += 4) {
                            if (data[i] < 24) transparent++;
                        }
                        scratchedPixels = transparent / (data.length / 4);
                        if (scratchedPixels > 0.45 && !isRevealed) revealCard();
                    }, 120);
                }
            }
            
            function revealCard() {
                if (isRevealed) return;
                isRevealed = true;
                isDrawing = false;
                
                // Clear entire canvas smoothly
                ctx.globalCompositeOperation = 'destination-out';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Mark as scratched and fade out
                wrap.classList.add('scratched');
                
                // Celebration effect
                card.style.transform = 'scale(1.03)';
                card.style.transition = 'transform 0.4s ease';
                setTimeout(() => {
                    card.style.transform = 'scale(1)';
                }, 400);
                
                // Play a subtle chime if audio context exists
                try {
                    if (window.audioCtx) {
                        const chime = window.audioCtx.createOscillator();
                        const chimeGain = window.audioCtx.createGain();
                        chime.type = 'sine';
                        chime.frequency.value = 880;
                        chimeGain.gain.setValueAtTime(0, window.audioCtx.currentTime);
                        chimeGain.gain.linearRampToValueAtTime(0.1, window.audioCtx.currentTime + 0.02);
                        chimeGain.gain.exponentialRampToValueAtTime(0.001, window.audioCtx.currentTime + 0.3);
                        chime.connect(chimeGain);
                        chimeGain.connect(window.audioCtx.destination);
                        chime.start();
                        chime.stop(window.audioCtx.currentTime + 0.3);
                    }
                } catch(e) {}
            }
            
            function startDraw(e) {
                if (isRevealed) return;
                isDrawing = true;
                scratch(e);
            }
            
            function endDraw() {
                isDrawing = false;
            }
            
            // Mouse events
            canvas.addEventListener('mousedown', startDraw);
            canvas.addEventListener('mousemove', scratch);
            canvas.addEventListener('mouseup', endDraw);
            canvas.addEventListener('mouseleave', endDraw);
            
            // Touch events
            canvas.addEventListener('touchstart', startDraw, { passive: false });
            canvas.addEventListener('touchmove', scratch, { passive: false });
            canvas.addEventListener('touchend', endDraw);
            canvas.addEventListener('touchcancel', endDraw);
            
            // Double-click to reveal (easier for some users)
            canvas.addEventListener('dblclick', revealCard);
            
            // Expose setup for later
            canvas._setup = setupCanvas;

            // Setup on load and resize
            setTimeout(setupCanvas, 300);
            window.addEventListener('resize', () => {
                if (!isRevealed) setupCanvas();
            });
        });
    })();

// ═══════════ FIREBASE GUEST MESSAGES ═══════════
(function () {

    const form = document.getElementById('guest-message-form');
    const nameInput = document.getElementById('guest-name');
    const msgInput = document.getElementById('guest-message');
    const charCount = document.getElementById('char-count');
    const listEl = document.getElementById('guest-messages-list');
    const noMsg = document.getElementById('no-messages');

    if (!form) return;

    // This UID is allowed to delete messages by the Firestore security rules.
    // It is an identifier, not a password or secret.
    const ADMIN_UID = "TyGIV4xQbESrne5q0FGWO7nqf022";

    let adminMode = false;
    let latestSnapshot = null;

    // Admin console handles authentication and controls.

    // Restore the admin session automatically when Firebase remembers the login.
    window.firebaseFunctions.onAuthStateChanged(window.firebaseAuth, (user) => {
        adminMode = !!user && user.uid === ADMIN_UID;
        renderMessages(latestSnapshot);
    });

    // Character Counter
    msgInput.addEventListener('input', () => {
        charCount.textContent =
            msgInput.value.length + ' / 300 characters';
    });

    // Submit Message
    form.addEventListener('submit', async (e) => {

        e.preventDefault();

        const name = nameInput.value.trim();
        const message = msgInput.value.trim();

        if (!name || !message) return;

        try {

            await window.firebaseFunctions.addDoc(
                window.firebaseFunctions.collection(
                    window.firebaseDB,
                    "messages"
                ),
                {
                    name,
                    message,
                    hidden: false,
                    approved: true,
                    timestamp: window.firebaseFunctions.serverTimestamp()
                }
            );

            form.reset();
            charCount.textContent =
                '0 / 300 characters';

        } catch (err) {

            console.error(err);

            const notice = document.createElement('p');
            notice.textContent = 'We could not send your message. Please check your connection and try again.';
            notice.style.cssText = 'margin-top:12px;color:#f2a2a2;font-size:13px;';
            form.appendChild(notice);
            setTimeout(() => notice.remove(), 3500);
        }
    });

    // Live Messages
    const q = window.firebaseFunctions.query(
        window.firebaseFunctions.collection(
            window.firebaseDB,
            "messages"
        ),
        window.firebaseFunctions.orderBy(
            "timestamp",
            "desc"
        )
    );

    function timeAgo(timestamp) {

        if (!timestamp) return "Just now";

        const date =
            timestamp.toDate
            ? timestamp.toDate()
            : new Date(timestamp);

        const diff =
            Date.now() - date.getTime();

        const mins =
            Math.floor(diff / 60000);

        const hours =
            Math.floor(diff / 3600000);

        const days =
            Math.floor(diff / 86400000);

        if (mins < 1) return "Just now";

        if (mins < 60)
            return mins + " min ago";

        if (hours < 24)
            return hours + " hour ago";

        if (days === 1)
            return "Yesterday";

        if (days < 30)
            return days + " days ago";

        return date.toLocaleDateString();
    }

    function renderMessages(snapshot) {
        if (!snapshot) return;

        listEl.innerHTML = '';

        if (snapshot.empty) {
            listEl.appendChild(noMsg);
            return;
        }

        snapshot.forEach((docSnap) => {

            const m = docSnap.data();
            const messageId = docSnap.id;
            if (!adminMode && m.hidden === true) return;

            const card =
                document.createElement('div');

            card.className =
                'guest-message-card';

            card.style.cssText = `
                background: linear-gradient(
                    145deg,
                    rgba(20,73,58,0.55),
                    rgba(8,8,8,0.75)
                );
                border: 1px solid rgba(201,168,76,0.3);
                border-radius: 20px;
                padding: 24px 20px;
                backdrop-filter: blur(10px);
                margin-bottom: 20px;
                text-align:center;
            `;

            card.innerHTML = `
                <div style="
                    width:40px;
                    height:40px;
                    margin:auto;
                    border-radius:50%;
                    background:linear-gradient(
                        145deg,
                        #E8C97A,
                        #C9A84C
                    );
                    color:#000;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    font-weight:bold;
                    margin-bottom:12px;
                ">
                    ${(m.name || '?')
                        .charAt(0)
                        .toUpperCase()}
                </div>

                <h4 style="
                    color:#E8C97A;
                    margin-bottom:10px;
                ">
                    ${m.name}
                </h4>

                <p style="
                    color:#FAF3E0;
                    line-height:1.6;
                ">
                    ${m.message}
                </p>

                <p style="
                    color:#FAF3E0;
                    line-height:1.6;
                ">
                    ${timeAgo(m.timestamp)}
                </p>
            `;

            if (adminMode) {
                const controls=document.createElement('div'); controls.className='message-admin-controls';
                const hideBtn=document.createElement('button'); hideBtn.className='admin-small-btn'; hideBtn.textContent=m.hidden?'Restore':'Hide';
                hideBtn.onclick=async()=>{try{await window.firebaseFunctions.updateDoc(window.firebaseFunctions.doc(window.firebaseDB,'messages',messageId),{hidden:!m.hidden});}catch(e){console.error(e);}};
                const delBtn=document.createElement('button'); delBtn.className='admin-danger-btn'; delBtn.textContent='Delete';
                delBtn.onclick=async()=>{if(!confirm('Permanently delete this message?'))return;try{await window.firebaseFunctions.deleteDoc(window.firebaseFunctions.doc(window.firebaseDB,'messages',messageId));}catch(e){console.error(e);}};
                controls.append(hideBtn,delBtn); card.appendChild(controls);
            }

            listEl.appendChild(card);
        });
    }

    window.firebaseFunctions.onSnapshot(
        q,
        (snapshot) => {
            latestSnapshot = snapshot;
            renderMessages(snapshot);
        },
        (error) => {
            console.error("Guest messages listener failed:", error);
            listEl.innerHTML = '';
            const errorEl = document.createElement('p');
            errorEl.textContent = 'Unable to load guest messages right now.';
            errorEl.style.cssText = 'color:#FAF3E0; text-align:center;';
            listEl.appendChild(errorEl);
        }
    );

})();


    // ═══════════ ADAPTIVE PREMIUM TOUCH / HOVER GLOW EFFECT ═══════════
    (function(){
        const selector='.gallery-item, .glass-panel, .wedding-card, .ceremony-deck, .countdown-box, .scratch-card, .photo-frame, .guest-message-card, .double-border, .map-btn';
        const finePointer=window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        const cores=navigator.hardwareConcurrency||4;
        const memory=navigator.deviceMemory||4;
        const lite=!finePointer || cores<=4 || memory<=4;
        if(lite) document.body.classList.add('perf-lite');

        let glowTarget=null, glowFrame=0, gx=50, gy=50;
        function applyGlow(){
            glowFrame=0;
            if(!glowTarget) return;
            glowTarget.style.setProperty('--mx',gx+'%');
            glowTarget.style.setProperty('--my',gy+'%');
        }
        if(finePointer && !lite){
            document.addEventListener('pointermove',e=>{
                const el=e.target.closest?.(selector);
                if(!el) return;
                const rect=el.getBoundingClientRect();
                glowTarget=el;
                gx=((e.clientX-rect.left)/rect.width)*100;
                gy=((e.clientY-rect.top)/rect.height)*100;
                if(!glowFrame) glowFrame=requestAnimationFrame(applyGlow);
            },{passive:true});
            document.addEventListener('pointerout',e=>{
                const el=e.target.closest?.(selector);
                if(el && !el.contains(e.relatedTarget)){
                    el.style.setProperty('--mx','50%'); el.style.setProperty('--my','50%');
                }
            },{passive:true});
        }

        function createRipple(el,x,y){
            const rect=el.getBoundingClientRect();
            const ripple=document.createElement('span');
            ripple.className='ripple-effect';
            ripple.style.left=(x-rect.left-40)+'px'; ripple.style.top=(y-rect.top-40)+'px';
            el.appendChild(ripple);
            setTimeout(()=>ripple.remove(),700);
        }
        document.addEventListener('pointerdown',e=>{
            const el=e.target.closest?.(selector);
            if(!el) return;
            el.classList.add('press-active');
            if(!lite) createRipple(el,e.clientX,e.clientY);
        },{passive:true});
        document.addEventListener('pointerup',e=>{
            const el=e.target.closest?.(selector);
            if(el){ el.classList.remove('press-active'); el.classList.add('touched'); setTimeout(()=>el.classList.remove('touched'),900); }
        },{passive:true});
        document.addEventListener('pointercancel',e=>{
            const el=e.target.closest?.(selector); if(el) el.classList.remove('press-active','touched');
        },{passive:true});
    })();

    // ═══════════ WELCOME GATE UNLOCK ═══════════
    window.unlockInvitation = function() {
        const gate = document.getElementById('welcome-gate');
        const wrapper = document.getElementById('main-content-wrapper');
        const body = document.body;
        if (!gate || !wrapper || gate.dataset.opening === 'true') return;
        gate.dataset.opening = 'true';

        // Prime the song silently from this user click. It fades in only when the main page appears.
        if (typeof window.primeInvitationMusic === 'function') {
            window.primeInvitationMusic();
        }

        // Build the portal zoom from the small Charminar gate.
        const anchor = document.getElementById('charminar-gate-anchor') || document.getElementById('charminar-logo-wrap');
        const rect = anchor.getBoundingClientRect();
        const portal = document.createElement('div');
        portal.id = 'gate-zoom-portal';
        portal.style.left = rect.left + 'px';
        portal.style.top = rect.top + 'px';
        portal.style.width = rect.width + 'px';
        portal.style.height = rect.height + 'px';
        portal.style.opacity = '1';
        document.body.appendChild(portal);

        gate.classList.add('gate-opening');
        gate.style.pointerEvents = 'none';

        // Prepare main content while the gate zooms.
        wrapper.style.visibility = 'visible';

        // Expand the portal until it becomes the whole screen.
        requestAnimationFrame(() => {
            portal.style.left = '50%';
            portal.style.top = '50%';
            portal.style.width = '145vmax';
            portal.style.height = '145vmax';
            portal.style.transform = 'translate(-50%, -50%)';
        });

        // Reveal main invitation after the zoom lands.
        setTimeout(() => {
            gate.style.opacity = '0';
            portal.style.opacity = '0';
            wrapper.style.opacity = '1';
            wrapper.style.transform = 'translateY(0)';
            body.classList.remove('overflow-hidden');
            body.classList.add('invitation-opened'); // Activate letter-by-letter
            body.style.overflowX = 'hidden';
            body.style.overflowY = 'auto';
            
            // Re-trigger reveal animations for visible elements
            if (window.refreshReveals) window.refreshReveals();
            
            // Re-setup scratch canvases (needed because they were hidden)
            if (window.setupScratchCanvases) window.setupScratchCanvases();

            // Main page is now visible: fade in Jhilmil Sitaron.
            if (typeof window.fadeInInvitationMusic === 'function') window.fadeInInvitationMusic();
        }, 1180);

        // Remove gate/portal after the transition completes.
        setTimeout(() => {
            gate.style.display = 'none';
            portal.remove();
            // IMPORTANT: clear the transform so position:fixed children (floating audio)
            // stay truly fixed to the viewport instead of scrolling with the page.
            wrapper.style.transition = 'none';
            wrapper.style.transform = 'none';
            wrapper.style.willChange = 'auto';
        }, 2100);
    };

    // ═══════════ MOON AND FALLING STARS ANIMATION ═══════════
    (function(){
        const container = document.getElementById('celestial-container');
        if (!container) return;
        
        function createFallingStar() {
            const star = document.createElement('div');
            star.className = 'falling-star';
            
            // Random horizontal position
            star.style.left = Math.random() * 100 + 'vw';
            
            // Random duration for "slow but continuous" feel (6-12 seconds)
            const duration = 6 + Math.random() * 6;
            star.style.animationDuration = duration + 's';
            
            // Random delay so they don't start all at once
            star.style.animationDelay = Math.random() * 5 + 's';
            
            container.appendChild(star);
            
            // Remove star after its animation ends to keep DOM clean
            setTimeout(() => {
                star.remove();
            }, (duration + 5) * 1000);
        }
        
        // Create initial batch
        for(let i = 0; i < 8; i++) {
            createFallingStar();
        }
        
        // Continuously create stars
        setInterval(createFallingStar, 1400);
    })();



// ═══════════ LIVE VISITOR COUNTER ═══════════
(function(){
    const display = document.getElementById('visitor-count');
    const adminCurrent = document.getElementById('admin-visitor-current');
    const adminActual = document.getElementById('admin-visitor-actual');
    const adminInput = document.getElementById('admin-visitor-count');
    const adminSet = document.getElementById('admin-visitor-set');
    const adminReset = document.getElementById('admin-visitor-reset');
    const adminStatus = document.getElementById('admin-visitor-status');
    if (!display || !window.firebaseDB || !window.firebaseFunctions) return;

    const counterRef = window.firebaseFunctions.doc(window.firebaseDB, 'siteStats', 'visitorCounter');
    const ADMIN_UID = 'TyGIV4xQbESrne5q0FGWO7nqf022';
    let currentValue = null;

    function cleanCount(value){
        const n = Number(value);
        return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
    }

    function renderCount(value, animate = true){
        const next = String(cleanCount(value));
        const previous = currentValue === null ? null : String(cleanCount(currentValue));
        if (previous === next && display.dataset.value === next) {
            if (adminCurrent) adminCurrent.textContent = next;
            return;
        }

        const maxLen = Math.max(previous?.length || 0, next.length, 1);
        const oldPadded = (previous ?? '').padStart(maxLen, ' ');
        const nextPadded = next.padStart(maxLen, ' ');

        display.innerHTML = '';
        display.dataset.value = next;
        display.setAttribute('aria-label', `${next} visitors`);

        [...nextPadded].forEach((digit, index) => {
            const oldDigit = oldPadded[index] || ' ';
            const slot = document.createElement('span');
            slot.className = 'visitor-digit-slot';

            if (!animate || previous === null || oldDigit === digit) {
                const staticDigit = document.createElement('span');
                staticDigit.className = 'visitor-digit-static';
                staticDigit.textContent = digit === ' ' ? '' : digit;
                slot.appendChild(staticDigit);
            } else {
                const oldEl = document.createElement('span');
                oldEl.className = 'visitor-digit-old';
                oldEl.textContent = oldDigit === ' ' ? '' : oldDigit;

                const newEl = document.createElement('span');
                newEl.className = 'visitor-digit-new';
                newEl.textContent = digit === ' ' ? '' : digit;

                slot.append(oldEl, newEl);
                requestAnimationFrame(() => slot.classList.add('is-rolling'));
            }

            display.appendChild(slot);
        });

        currentValue = cleanCount(value);
        if (adminCurrent) adminCurrent.textContent = String(currentValue);
    }

    function setAdminStatus(message, type){
        if (!adminStatus) return;
        adminStatus.textContent = message || '';
        adminStatus.className = 'admin-visitor-status' + (type ? ` ${type}` : '');
    }

    window.firebaseFunctions.onSnapshot(counterRef, (snap) => {
        const value = snap.exists() ? cleanCount(snap.data().count) : 0;
        const actual = snap.exists() ? cleanCount(snap.data().actualCount ?? value) : 0;
        renderCount(value, currentValue !== null);
        if (adminActual) adminActual.textContent = String(actual);
    }, (error) => {
        console.error('Visitor counter listener failed:', error);
    });

    async function incrementForVisitor(){
        try {
            if (sessionStorage.getItem('nizam_visitor_counted') === '1') return;
        } catch (_) {}

        try {
            await window.firebaseFunctions.runTransaction(window.firebaseDB, async (tx) => {
                const snap = await tx.get(counterRef);
                const current = snap.exists() ? cleanCount(snap.data().count) : 0;
                const actual = snap.exists() ? cleanCount(snap.data().actualCount ?? current) : 0;
                tx.set(counterRef, {
                    count: current + 1,
                    actualCount: actual + 1,
                    updatedAt: window.firebaseFunctions.serverTimestamp()
                }, { merge: true });
            });

            try { sessionStorage.setItem('nizam_visitor_counted', '1'); } catch (_) {}
        } catch (error) {
            console.error('Visitor counter update failed:', error);
        }
    }

    async function setAdminCount(value){
        const user = window.firebaseAuth?.currentUser;
        if (!user || user.uid !== ADMIN_UID) {
            setAdminStatus('Admin authentication required.', 'error');
            return;
        }

        const count = cleanCount(value);
        setAdminStatus('Updating…', 'loading');
        if (adminSet) adminSet.disabled = true;
        if (adminReset) adminReset.disabled = true;

        try {
            await window.firebaseFunctions.runTransaction(window.firebaseDB, async (tx) => {
                tx.set(counterRef, {
                    count,
                    updatedAt: window.firebaseFunctions.serverTimestamp()
                }, { merge: true });
            });
            setAdminStatus(`Live count set to ${count}.`, 'success');
        } catch (error) {
            console.error('Admin visitor count update failed:', error);
            setAdminStatus('Could not update the visitor count.', 'error');
        } finally {
            if (adminSet) adminSet.disabled = false;
            if (adminReset) adminReset.disabled = false;
        }
    }

    adminSet?.addEventListener('click', () => {
        if (!adminInput?.value.trim()) {
            setAdminStatus('Enter a count first.', 'error');
            return;
        }
        setAdminCount(adminInput.value);
    });

    adminInput?.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') adminSet?.click();
    });

    adminReset?.addEventListener('click', () => {
        if (confirm('Reset the live visitor count to 0?')) setAdminCount(0);
    });

    window.firebaseFunctions.onAuthStateChanged(window.firebaseAuth, (user) => {
        const isAdmin = user?.uid === ADMIN_UID;
        if (!isAdmin && adminStatus) setAdminStatus('');
    });

    incrementForVisitor();
})();

// ═══════════ PREMIUM ADMIN CONSOLE ═══════════
(function(){const el=document.getElementById('admin-console');if(!el)return;const login=document.getElementById('admin-login-view'),dash=document.getElementById('admin-dashboard-view'),email=document.getElementById('admin-email'),pass=document.getElementById('admin-password'),err=document.getElementById('admin-login-error'),stats=document.getElementById('admin-stats'),ml=document.getElementById('admin-messages-list'),rl=document.getElementById('admin-rsvps-list');const UID='TyGIV4xQbESrne5q0FGWO7nqf022';let messages=[],rsvps=[];function open(){el.classList.add('open');el.setAttribute('aria-hidden','false');setTimeout(()=>email?.focus(),50)}function close(){el.classList.remove('open');el.setAttribute('aria-hidden','true')}document.querySelectorAll('[data-admin-close]').forEach(x=>x.onclick=close);document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});function auth(user){const ok=user?.uid===UID;login.hidden=ok;dash.hidden=!ok;document.getElementById('admin-auth-state').textContent=ok?'Authenticated admin':'Signed out';if(ok)load()}document.getElementById('admin-login-btn')?.addEventListener('click',async()=>{err.textContent='';try{const c=await window.firebaseFunctions.signInWithEmailAndPassword(window.firebaseAuth,email.value.trim(),pass.value);if(c.user.uid!==UID){await window.firebaseFunctions.signOut(window.firebaseAuth);throw 0}pass.value=''}catch(e){err.textContent='Sign in failed. Check your admin account.'}});pass?.addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('admin-login-btn').click()});document.getElementById('admin-logout-btn')?.addEventListener('click',()=>window.firebaseFunctions.signOut(window.firebaseAuth));const t=document.getElementById('guest-messages-title');let n=0,tm;t?.addEventListener('click',()=>{n++;clearTimeout(tm);tm=setTimeout(()=>n=0,1500);if(n>=5){n=0;open()}});window.firebaseFunctions.onAuthStateChanged(window.firebaseAuth,auth);function dt(x){return x?.toDate?x.toDate():new Date(x||0)}function esc(x){const d=document.createElement('div');d.textContent=String(x??'');return d.innerHTML}function load(){const mq=window.firebaseFunctions.query(window.firebaseFunctions.collection(window.firebaseDB,'messages'),window.firebaseFunctions.orderBy('timestamp','desc'));window.firebaseFunctions.onSnapshot(mq,s=>{messages=s.docs.map(d=>({id:d.id,...d.data()}));renderM();renderS()});const rq=window.firebaseFunctions.query(window.firebaseFunctions.collection(window.firebaseDB,'rsvps'),window.firebaseFunctions.orderBy('timestamp','desc'));window.firebaseFunctions.onSnapshot(rq,s=>{rsvps=s.docs.map(d=>({id:d.id,...d.data()}));renderR();renderS()},()=>{rsvps=[];renderR()})}function renderS(){const d=new Date();d.setHours(0,0,0,0);const today=messages.filter(m=>dt(m.timestamp)>=d).length,confirmed=rsvps.filter(r=>r.status==='attending').length,declined=rsvps.filter(r=>r.status==='declined').length,guests=rsvps.filter(r=>r.status==='attending').reduce((a,r)=>a+(+r.guests||0),0);stats.innerHTML=`<div><b>${messages.length}</b><span>Total messages</span></div><div><b>${today}</b><span>Today's messages</span></div><div><b>${rsvps.length}</b><span>Total RSVPs</span></div><div><b>${confirmed}</b><span>Confirmed</span></div><div><b>${declined}</b><span>Declined</span></div><div><b>${guests}</b><span>Guests</span></div>`; let ctl=document.getElementById('admin-invited-control'); if(!ctl){ctl=document.createElement('div');ctl.id='admin-invited-control';ctl.className='admin-invited-control';stats.after(ctl)} const invited=Number(localStorage.getItem('nizam_total_invited')||0); const pending=invited?Math.max(0,invited-confirmed-declined):'—'; ctl.innerHTML=`<label>Total invited <input id=admin-total-invited type=number min=0 value="${invited||''}" placeholder="Enter total invited"></label><span>Pending: <b>${pending}</b></span>`;document.getElementById('admin-total-invited')?.addEventListener('change',e=>{localStorage.setItem('nizam_total_invited',String(Math.max(0,Number(e.target.value)||0)));renderS()})}function renderM(){let q=(document.getElementById('admin-message-search')?.value||'').toLowerCase();let a=messages.filter(m=>(`${m.name||''} ${m.message||''}`).toLowerCase().includes(q));if(document.getElementById('admin-message-sort')?.value==='oldest')a.reverse();ml.innerHTML=a.map(m=>`<article class="admin-record ${m.hidden?'is-hidden':''}"><div><strong>${esc(m.name||'Guest')}</strong><small>${dt(m.timestamp).toLocaleString()}</small><p>${esc(m.message||'')}</p></div><div class="admin-record-actions"><button class="admin-small-btn" data-h="${m.id}">${m.hidden?'Restore':'Hide'}</button><button class="admin-danger-btn" data-d="${m.id}">Delete</button></div></article>`).join('')||'<p class="admin-muted">No messages found.</p>';ml.querySelectorAll('[data-h]').forEach(b=>b.onclick=async()=>{const m=messages.find(x=>x.id===b.dataset.h);if(m)await window.firebaseFunctions.updateDoc(window.firebaseFunctions.doc(window.firebaseDB,'messages',m.id),{hidden:!m.hidden})});ml.querySelectorAll('[data-d]').forEach(b=>b.onclick=async()=>{if(confirm('Permanently delete this message?'))await window.firebaseFunctions.deleteDoc(window.firebaseFunctions.doc(window.firebaseDB,'messages',b.dataset.d))})}function renderR(){let q=(document.getElementById('admin-rsvp-search')?.value||'').toLowerCase(),f=document.getElementById('admin-rsvp-filter')?.value||'all';let a=rsvps.filter(r=>(f==='all'||r.status===f)&&(`${r.name||''} ${r.attendance||''}`).toLowerCase().includes(q));rl.innerHTML=a.map(r=>`<article class="admin-record"><div><strong>${esc(r.name||'Guest')}</strong><small>${dt(r.timestamp).toLocaleString()}</small><p>${esc(r.status||'pending')} • ${+r.guests||0} guest(s) • ${esc(r.attendance||'')}</p>${r.message?`<p>“${esc(r.message)}”</p>`:''}</div><button class="admin-danger-btn" data-rd="${r.id}">Delete</button></article>`).join('')||'<p class="admin-muted">No RSVPs found.</p>';rl.querySelectorAll('[data-rd]').forEach(b=>b.onclick=async()=>{if(confirm('Delete this RSVP?'))await window.firebaseFunctions.deleteDoc(window.firebaseFunctions.doc(window.firebaseDB,'rsvps',b.dataset.rd))})}document.getElementById('admin-message-search')?.addEventListener('input',renderM);document.getElementById('admin-message-sort')?.addEventListener('change',renderM);document.getElementById('admin-rsvp-search')?.addEventListener('input',renderR);document.getElementById('admin-rsvp-filter')?.addEventListener('change',renderR);document.querySelectorAll('[data-admin-tab]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-admin-tab]').forEach(x=>x.classList.remove('active'));b.classList.add('active');const r=b.dataset.adminTab==='rsvps';document.getElementById('admin-messages-view').hidden=r;document.getElementById('admin-rsvps-view').hidden=!r});document.getElementById('admin-export-rsvps')?.addEventListener('click',()=>{const cols=['name','guests','status','attendance','message','timestamp'],csv=[cols.join(','),...rsvps.map(r=>cols.map(c=>`"${String(c==='timestamp'?dt(r[c]).toISOString():r[c]??'').replace(/"/g,'""')}"`).join(','))].join('\n'),blob=new Blob([csv],{type:'text/csv'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='nizams-rsvps.csv';a.click();URL.revokeObjectURL(u)});})();



// ═══════════ GALLERY LIGHTBOX ═══════════
(function(){const box=document.getElementById('gallery-lightbox'),im=document.getElementById('gallery-lightbox-image'),cap=document.getElementById('gallery-lightbox-caption');if(!box)return;const items=[...document.querySelectorAll('.gallery-item img')];let i=0,x=0;function show(n){i=(n+items.length)%items.length;const e=items[i];im.src=e.currentSrc||e.src;im.alt=e.alt||'';cap.textContent=e.alt||'';box.classList.add('open');box.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}function close(){box.classList.remove('open');box.setAttribute('aria-hidden','true');document.body.style.overflow=''}items.forEach((e,n)=>e.parentElement.addEventListener('click',()=>show(n)));document.getElementById('gallery-close')?.addEventListener('click',close);document.getElementById('gallery-prev')?.addEventListener('click',()=>show(i-1));document.getElementById('gallery-next')?.addEventListener('click',()=>show(i+1));document.addEventListener('keydown',e=>{if(!box.classList.contains('open'))return;if(e.key==='Escape')close();if(e.key==='ArrowLeft')show(i-1);if(e.key==='ArrowRight')show(i+1)});box.addEventListener('click',e=>{if(e.target===box)close()});im.addEventListener('touchstart',e=>x=e.changedTouches[0].clientX,{passive:true});im.addEventListener('touchend',e=>{const d=e.changedTouches[0].clientX-x;if(Math.abs(d)>45)show(i+(d<0?1:-1))},{passive:true})})();



// ═══════════ EVENT INTERACTIONS / PERFORMANCE ═══════════
(function(){document.querySelectorAll('.ceremony-deck').forEach(c=>{c.tabIndex=0;c.classList.add('event-interactive');c.addEventListener('click',e=>{if(!e.target.closest('a,button'))c.classList.toggle('expanded')});c.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();c.classList.toggle('expanded')}})});document.querySelectorAll('img:not([loading])').forEach(i=>i.loading='lazy')})();

// ═══════════ OFFLINE / ONLINE STATUS ═══════════
(function(){
 const b=document.getElementById('network-status-banner'); if(!b)return;
 function set(){if(navigator.onLine){b.textContent='Back online';b.classList.add('show');setTimeout(()=>b.classList.remove('show'),2200)}else{b.textContent='You are offline — submissions will not be sent until connection returns.';b.classList.add('show')}}
 window.addEventListener('offline',set);window.addEventListener('online',set);
})();

// ═══════════ ADD-TO-CALENDAR BUTTONS ═══════════
(function(){
 const events=[
  {title:'Nikah Ceremony — Lakshma Reddy Gardens',start:'20251218T173000',end:'20251218T203000',location:'Lakshma Reddy Gardens, Hyderabad'},
  {title:'Nikah Ceremony — Minarva Gardens',start:'20251221T180000',end:'20251221T210000',location:'Minarva Gardens, Hyderabad'},
  {title:'Valima Reception — MNR Gardens',start:'20251223T193000',end:'20251223T230000',location:'MNR Gardens, Champapet, Hyderabad'}
 ];
 document.querySelectorAll('.ceremony-deck').forEach((card,i)=>{const ev=events[i];if(!ev||card.querySelector('.calendar-btn'))return;const b=document.createElement('button');b.type='button';b.className='calendar-btn';b.textContent='ADD TO CALENDAR';b.addEventListener('click',()=>{const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Nizams Wedding//EN','BEGIN:VEVENT',`DTSTART:${ev.start}`,`DTEND:${ev.end}`,`SUMMARY:${ev.title}`,`LOCATION:${ev.location}`,'END:VEVENT','END:VCALENDAR'].join('\r\n');const blob=new Blob([ics],{type:'text/calendar;charset=utf-8'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=ev.title.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'.ics';a.click();URL.revokeObjectURL(u)});const footer=card.querySelector('.ceremony-footer')||card.querySelector('div:last-child');footer?.appendChild(b)});
})();
