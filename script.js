document.addEventListener('DOMContentLoaded', () => {
    // Screenshot Mapping
    const screenshots = [
        { file: 'dashboard-analytics.png', alt: 'CredaERP Dashboard Charts & Analytics' },
        { file: 'dashboard-overview.png', alt: 'CredaERP Dashboard Overview Cards' },
        { file: 'inventory.png', alt: 'CredaERP Smart Inventory Management' },
        { file: 'billing-items.png', alt: 'CredaERP POS Terminal Billing Grid' },
        { file: 'billing-checkout.png', alt: 'CredaERP POS Terminal Checkout & Payment' },
        { file: 'reports.png', alt: 'CredaERP Business Reports & GST Compliance' },
        { file: 'gst-filing.png', alt: 'CredaERP GST Filing Dashboard' },
        { file: 'ca-dashboard.png', alt: 'CredaERP CA Dashboard & Reports' }
    ];

    // DOM Elements for Screenshots tab switcher
    const tabButtons = document.querySelectorAll('#screenshot-tabs .tab-btn');
    const screenshotImg = document.getElementById('screenshot-img');
    const screenshotFallback = document.getElementById('screenshot-fallback');
    const fallbackFilename = document.getElementById('fallback-filename');

    if (tabButtons && screenshotImg) {
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Deactivate all tabs
                tabButtons.forEach(b => b.classList.remove('active'));
                
                // Activate clicked tab
                btn.classList.add('active');
                
                const index = parseInt(btn.dataset.screenshot) || 0;
                const screenshot = screenshots[index];
                
                // Fade out current screenshot
                screenshotImg.style.opacity = '0';
                screenshotFallback.classList.remove('hidden'); // Show loading spinner
                
                if (fallbackFilename) {
                    fallbackFilename.textContent = screenshot.file;
                }
                
                // Preload new image
                const tempImg = new Image();
                tempImg.src = 'images/' + screenshot.file;
                
                tempImg.onload = () => {
                    screenshotImg.src = 'images/' + screenshot.file;
                    screenshotImg.alt = screenshot.alt;
                    screenshotImg.style.opacity = '1';
                    screenshotFallback.classList.add('hidden'); // Hide spinner on success
                };
                
                tempImg.onerror = () => {
                    // Image doesn't exist yet, show fallback state
                    screenshotImg.style.opacity = '0';
                    screenshotFallback.classList.remove('hidden'); // Keep spinner/message visible
                };
            });
        });

        // Initialize first screenshot load
        const initialIndex = 0;
        const initialScreenshot = screenshots[initialIndex];
        
        // Handle onload/onerror for initial load
        screenshotImg.onload = () => {
            screenshotImg.style.opacity = '1';
            screenshotFallback.classList.add('hidden');
        };
        
        screenshotImg.onerror = () => {
            screenshotImg.style.opacity = '0';
            screenshotFallback.classList.remove('hidden');
            if (fallbackFilename) {
                fallbackFilename.textContent = initialScreenshot.file;
            }
        };

        // Trigger load
        screenshotImg.src = 'images/' + initialScreenshot.file;
    }

    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all items
            faqItems.forEach(i => {
                i.classList.remove('active');
                i.querySelector('.faq-answer').style.maxHeight = null;
            });
            
            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });

    // Modal Interaction
    const modal = document.getElementById('demo-modal');
    const modalTitle = document.getElementById('modal-plan-title');
    const openModalBtns = document.querySelectorAll('.open-modal-btn');
    const closeModalBtn = document.querySelector('.modal-close');
    const demoForm = document.getElementById('demo-form');

    openModalBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const planName = btn.dataset.plan || 'Early Adopter Trial';
            if (modalTitle) {
                modalTitle.textContent = `Request Free Demo Key (${planName})`;
            }
            if (modal) {
                modal.classList.add('active');
            }
        });
    });

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            if (modal) modal.classList.remove('active');
        });
    }

    // Close modal on clicking overlay
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }

    // Product-aware downloads. Each product release uses a product-prefixed tag
    // (for example credarx-v1.0.0), so "latest" cannot accidentally point to
    // another vertical's installer.
    const productCatalog = {
        crederp: { name: 'CredaERP', tagPrefix: 'v', assetPrefix: 'CredaERP' },
        credarx: { name: 'CredaRx', tagPrefix: 'credarx-v', assetPrefix: 'CredaRx' },
        credaretail: { name: 'CredaRetail', tagPrefix: 'credaretail-v', assetPrefix: 'CredaRetail' }
    };
    const requestedProduct = new URLSearchParams(window.location.search).get('product');
    const productKey = (requestedProduct || document.body.dataset.product || 'crederp').toLowerCase();
    const activeProduct = productCatalog[productKey] || productCatalog.crederp;
    document.querySelectorAll('[data-product-name]').forEach((node) => {
        node.textContent = activeProduct.name;
    });

    const releaseApi = 'https://api.github.com/repos/credaerp-admin/medicines-catalog/releases?per_page=100';
    const downloadLinks = {
        windows: `${activeProduct.assetPrefix}-Windows.exe`,
        'mac-silicon': `${activeProduct.assetPrefix}-macOS-AppleSilicon.dmg`,
        'mac-intel': `${activeProduct.assetPrefix}-macOS-Intel.dmg`
    };
    const setDownloadLinks = (release) => {
        document.querySelectorAll('[data-download]').forEach((link) => {
            const asset = downloadLinks[link.dataset.download];
            const base = release && release.tag_name
                ? `https://github.com/credaerp-admin/medicines-catalog/releases/download/${encodeURIComponent(release.tag_name)}/`
                : '';
            link.href = base ? base + encodeURIComponent(asset) : '#';
            link.classList.toggle('download-unavailable', !base);
            link.setAttribute('aria-disabled', String(!base));
            link.setAttribute('aria-label', `${activeProduct.name} ${link.textContent.trim()}`);
        });
    };
    fetch(releaseApi)
        .then((response) => response.ok ? response.json() : Promise.reject(new Error('release lookup failed')))
        .then((releases) => {
            const prefix = activeProduct.tagPrefix.toLowerCase();
            const release = releases.find((candidate) => !candidate.draft && !candidate.prerelease
                && candidate.tag_name.toLowerCase().startsWith(prefix));
            setDownloadLinks(release);
        })
        .catch(() => setDownloadLinks(null));

    // Form submission handler (Netlify Forms via AJAX)
    if (demoForm) {
        demoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = demoForm.querySelector('.form-submit-btn');
            
            submitBtn.textContent = 'Registering Demo Request...';
            submitBtn.disabled = true;
            
            // Post form data to Netlify via AJAX
            const formData = new FormData(demoForm);
            fetch("/", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams(formData).toString()
            })
             .then(() => {
                 const modalContent = modal.querySelector('.modal-content');
                 modalContent.innerHTML = `
                     <button class="modal-close" style="position: absolute; top: 1.25rem; right: 1.25rem; background: transparent; border: none; cursor: pointer; color: var(--text-muted); font-size: 1.5rem;">&times;</button>
                     <div style="text-align: center; padding: 1.5rem 0 0.5rem 0;">
                         <div style="font-size: 3.5rem; color: var(--color-success); margin-bottom: 0.75rem;">✓</div>
                         <h3 style="font-size: 1.75rem; font-weight: 700; margin-bottom: 0.75rem; color: #fff;">Request Received!</h3>
                         <p style="color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.95rem; line-height: 1.5;">Thank you! We will reach out to you on WhatsApp within 2 hours with your trial license key. You can download ${activeProduct.name} now:</p>
                         
                         <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.75rem; text-align: left;">
                             <a data-modal-download="windows" href="#" class="cta-btn cta-btn-primary" style="text-align: center; padding: 0.75rem 1rem; font-size: 0.9rem;">🖥️ Download ${activeProduct.name} for Windows (.exe)</a>
                             <a data-modal-download="mac-silicon" href="#" class="cta-btn cta-btn-secondary" style="text-align: center; padding: 0.75rem 1rem; font-size: 0.9rem;">🍏 Download ${activeProduct.name} for macOS (Apple Silicon)</a>
                             <a data-modal-download="mac-intel" href="#" class="cta-btn cta-btn-secondary" style="text-align: center; padding: 0.75rem 1rem; font-size: 0.9rem;">💻 Download ${activeProduct.name} for macOS (Intel)</a>
                         </div>
                         
                         <button class="form-submit-btn close-success-btn" style="max-width: 200px; margin: 0 auto;">Close</button>
                     </div>
                 `;
                
                document.querySelectorAll('[data-download]').forEach((source) => {
                    const target = modalContent.querySelector(`[data-modal-download="${source.dataset.download}"]`);
                    if (target) target.href = source.href;
                });
                const successCloseHandler = () => {
                    modal.classList.remove('active');
                    setTimeout(() => {
                        window.location.reload();
                    }, 300);
                };
                
                modalContent.querySelector('.modal-close').addEventListener('click', successCloseHandler);
                modalContent.querySelector('.close-success-btn').addEventListener('click', successCloseHandler);
            })
            .catch((error) => {
                console.error('Netlify Form submission error:', error);
                submitBtn.textContent = 'Send My Free Trial Request';
                submitBtn.disabled = false;
                alert('Something went wrong. Please try again or contact support.');
            });
        });
    }

    // ── Pricing Toggle Logic (INR only — for Indian businesses) ──────────
    const PRICES = {
        quarterly: { starter: 1699, growth: 2999, premium: 3499 },
        yearly:    { starter: 4999, growth: 8999, premium: 9999 }
    };

    // Strikethrough shown on yearly tab = what 4 quarters would cost
    const ORIGINALS_YEARLY = { starter: 6796, growth: 11996, premium: 13996 };

    const PERIOD_LABELS = { quarterly: '/ quarter', yearly: '/ year' };
    const PLANS = ['starter', 'growth', 'premium'];

    let activePeriod = 'yearly';

    function updatePrices() {
        const prices   = PRICES[activePeriod];
        const period   = PERIOD_LABELS[activePeriod];
        const isYearly = activePeriod === 'yearly';

        PLANS.forEach(plan => {
            const amountEl   = document.getElementById(`${plan}-amount`);
            const periodEl   = document.getElementById(`${plan}-period`);
            const originalEl = document.getElementById(`${plan}-original`);
            const trialEl    = document.getElementById(`${plan}-trial-info`);
            const equivalentEl = document.getElementById(`${plan}-equivalent`);
            const upgradeNoteEl = document.getElementById('premium-upgrade-note');

            if (!amountEl) return;

            // Animate price flip
            amountEl.style.transform = 'translateY(-8px)';
            amountEl.style.opacity   = '0';
            setTimeout(() => {
                amountEl.textContent = prices[plan].toLocaleString('en-IN');
                periodEl.textContent = period;

                if (isYearly) {
                    originalEl.textContent      = `₹${ORIGINALS_YEARLY[plan].toLocaleString('en-IN')} if billed quarterly`;
                    originalEl.style.visibility = 'visible';
                    const savingsPercent = Math.round((1 - prices[plan] / ORIGINALS_YEARLY[plan]) * 100);
                    trialEl.textContent         = `🎉 Annual plan — save ${savingsPercent}% vs quarterly billing`;
                    equivalentEl.textContent    = `₹${Math.round(prices[plan] / 12).toLocaleString('en-IN')}/month equivalent on annual billing`;
                    equivalentEl.style.visibility = 'visible';
                } else {
                    originalEl.textContent      = '';
                    originalEl.style.visibility = 'hidden';
                    trialEl.textContent         = '✨ 3 months free trial, then billed quarterly';
                    equivalentEl.textContent    = '';
                    equivalentEl.style.visibility = 'hidden';
                }

                if (upgradeNoteEl) {
                    const premiumGap = Math.round((prices.premium - prices.growth) / (isYearly ? 12 : 3));
                    upgradeNoteEl.textContent = `Only ₹${premiumGap.toLocaleString('en-IN')}/month more than Growth`;
                }

                amountEl.style.transform = 'translateY(0)';
                amountEl.style.opacity   = '1';
            }, 180);
        });
    }

    // Billing Cycle Toggle
    const billingToggle = document.getElementById('billing-toggle');
    if (billingToggle) {
        billingToggle.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                billingToggle.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activePeriod = btn.dataset.period;
                billingToggle.classList.toggle('annually', activePeriod === 'yearly');
                updatePrices();
            });
        });
    }

    // Initialize prices on load
    updatePrices();

    // ── Reviews Carousel ─────────────────────────────────────────────────
    const track     = document.getElementById('reviews-track');
    const prevBtn   = document.getElementById('reviews-prev');
    const nextBtn   = document.getElementById('reviews-next');
    const dotsWrap  = document.getElementById('reviews-dots');

    if (track && prevBtn && nextBtn && dotsWrap) {
        const cards = Array.from(track.querySelectorAll('.review-card'));
        let currentIndex = 0;
        let autoTimer    = null;

        // How many cards are visible at this viewport width
        function getPerView() {
            if (window.innerWidth <= 768)  return 1;
            if (window.innerWidth <= 1024) return 2;
            return 3;
        }

        // Total number of "pages" (steps)
        function totalSteps() {
            return Math.max(1, cards.length - getPerView() + 1);
        }

        // Build dot buttons
        function buildDots() {
            dotsWrap.innerHTML = '';
            const n = totalSteps();
            for (let i = 0; i < n; i++) {
                const dot = document.createElement('button');
                dot.className = 'carousel-dot' + (i === currentIndex ? ' active' : '');
                dot.setAttribute('aria-label', `Go to review ${i + 1}`);
                dot.addEventListener('click', () => goTo(i));
                dotsWrap.appendChild(dot);
            }
        }

        // Sync active dot highlight
        function syncDots() {
            dotsWrap.querySelectorAll('.carousel-dot').forEach((d, i) => {
                d.classList.toggle('active', i === currentIndex);
            });
        }

        // Calculate pixel offset and slide the track
        function applyTransform() {
            // Card width + gap (gap is 1.5 rem = 24 px)
            const cardWidth = cards[0].getBoundingClientRect().width;
            const gap       = 24; // matches CSS 1.5rem gap
            const offset    = currentIndex * (cardWidth + gap);
            track.style.transform = `translateX(-${offset}px)`;
        }

        // Go to a specific step
        function goTo(index) {
            const steps = totalSteps();
            currentIndex = Math.max(0, Math.min(index, steps - 1));
            applyTransform();
            syncDots();
            prevBtn.disabled = currentIndex === 0;
            nextBtn.disabled = currentIndex >= steps - 1;
        }

        // Auto-advance
        function startAuto() {
            stopAuto();
            autoTimer = setInterval(() => {
                const next = currentIndex + 1 >= totalSteps() ? 0 : currentIndex + 1;
                goTo(next);
            }, 5000);
        }

        function stopAuto() {
            if (autoTimer) clearInterval(autoTimer);
        }

        // Prev / Next buttons
        prevBtn.addEventListener('click', () => { goTo(currentIndex - 1); stopAuto(); startAuto(); });
        nextBtn.addEventListener('click', () => { goTo(currentIndex + 1); stopAuto(); startAuto(); });

        // Keyboard arrow navigation when focus is within the section
        document.addEventListener('keydown', e => {
            if (!document.getElementById('reviews').contains(document.activeElement)) return;
            if (e.key === 'ArrowLeft')  { goTo(currentIndex - 1); stopAuto(); startAuto(); }
            if (e.key === 'ArrowRight') { goTo(currentIndex + 1); stopAuto(); startAuto(); }
        });

        // Touch / swipe support
        let touchStartX = 0;
        track.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
        track.addEventListener('touchend',   e => {
            const delta = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(delta) > 50) {
                delta > 0 ? goTo(currentIndex + 1) : goTo(currentIndex - 1);
                stopAuto(); startAuto();
            }
        });

        // Recalculate on resize (debounced)
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                // Clamp index to new step count
                currentIndex = Math.min(currentIndex, totalSteps() - 1);
                buildDots();
                applyTransform();
                prevBtn.disabled = currentIndex === 0;
                nextBtn.disabled = currentIndex >= totalSteps() - 1;
            }, 120);
        });

        // Pause auto on hover
        const section = document.getElementById('reviews');
        section.addEventListener('mouseenter', stopAuto);
        section.addEventListener('mouseleave', startAuto);

        // Init
        buildDots();
        goTo(0);
        startAuto();
    }

    // ================= CredaERP Video Tutorials Carousel (Real YouTube Lessons) =================
    const videoTrack = document.getElementById('video-carousel-track');
    const videoPrevBtn = document.getElementById('video-carousel-prev');
    const videoNextBtn = document.getElementById('video-carousel-next');
    const videoDotsWrap = document.getElementById('video-carousel-dots');
    const mainYtFrame = document.getElementById('main-yt-frame');
    const featuredPlayer = document.getElementById('featured-video-player');

    if (videoTrack && mainYtFrame) {
        // Real videos from CredaERP playlist (PLNe_ICSHlhmI)
        const REAL_VIDEOS = [
            {
                videoId: '3Tk0SBdrxf4',
                title: 'Out-of-Stock दवा आने पर ऐसे करें Billing (बिना दोबारा Entry किए)',
                categoryLabel: 'Fast Billing & POS',
                duration: '4:15 min',
                language: 'Hindi',
                thumb: 'https://img.youtube.com/vi/3Tk0SBdrxf4/mqdefault.jpg'
            },
            {
                videoId: 'uS6Q4ElFaX8',
                title: 'Stock में दवा नहीं है? 🛑 फिर भी Sale कंफर्म करें! | CredaRx Advance Order',
                categoryLabel: 'Advance Orders',
                duration: '3:50 min',
                language: 'Hindi',
                thumb: 'https://img.youtube.com/vi/uS6Q4ElFaX8/mqdefault.jpg'
            },
            {
                videoId: 'Xl0pC73kuw0',
                title: 'Medical Store में AI का कमाल! 🤖 CredaRx AI Chat Assistant Live Demo',
                categoryLabel: 'AI Business Chat',
                duration: '5:10 min',
                language: 'Hindi',
                thumb: 'https://img.youtube.com/vi/Xl0pC73kuw0/mqdefault.jpg'
            },
            {
                videoId: 'CNvAMWg0Tnc',
                title: 'Medical Store का Profit & Loss ऐसे Track करें 📊 CredaRx Gross Margin',
                categoryLabel: 'GST & Profit Reports',
                duration: '4:45 min',
                language: 'Hindi',
                thumb: 'https://img.youtube.com/vi/CNvAMWg0Tnc/mqdefault.jpg'
            },
            {
                videoId: 'capC6oDGJ_Y',
                title: 'Medical Store पर इतनी तेज़ Billing कभी देखी है? ⚡ CredaRx 3-Sec Checkout',
                categoryLabel: 'Rapid POS Checkout',
                duration: '3:30 min',
                language: 'Hindi',
                thumb: 'https://img.youtube.com/vi/capC6oDGJ_Y/mqdefault.jpg'
            }
        ];

        let activePlayingId = REAL_VIDEOS[0].videoId;
        let videoCurrentIndex = 0;

        function getVisibleCards() {
            if (window.innerWidth <= 768) return 1;
            if (window.innerWidth <= 1024) return 2;
            return 3;
        }

        function maxVideoIndex() {
            return Math.max(0, REAL_VIDEOS.length - getVisibleCards());
        }

        function buildVideoDots() {
            if (!videoDotsWrap) return;
            videoDotsWrap.innerHTML = '';
            const totalDots = maxVideoIndex() + 1;
            for (let i = 0; i < totalDots; i++) {
                const dot = document.createElement('button');
                dot.className = 'carousel-dot' + (i === videoCurrentIndex ? ' active' : '');
                dot.setAttribute('aria-label', `Go to video slide ${i + 1}`);
                dot.addEventListener('click', () => goToVideoSlide(i));
                videoDotsWrap.appendChild(dot);
            }
        }

        function updateVideoDots() {
            if (!videoDotsWrap) return;
            videoDotsWrap.querySelectorAll('.carousel-dot').forEach((d, i) => {
                d.classList.toggle('active', i === videoCurrentIndex);
            });
        }

        function moveVideoTrack() {
            const card = videoTrack.querySelector('.video-card');
            if (!card) return;
            const gap = 24; // 1.5rem in px
            const cardWidth = card.offsetWidth;
            const offset = videoCurrentIndex * (cardWidth + gap);
            videoTrack.style.transform = `translateX(-${offset}px)`;

            if (videoPrevBtn) videoPrevBtn.disabled = videoCurrentIndex === 0;
            if (videoNextBtn) videoNextBtn.disabled = videoCurrentIndex >= maxVideoIndex();
            updateVideoDots();
        }

        function goToVideoSlide(idx) {
            videoCurrentIndex = Math.max(0, Math.min(idx, maxVideoIndex()));
            moveVideoTrack();
        }

        // Render video cards
        videoTrack.innerHTML = '';
        REAL_VIDEOS.forEach((video, idx) => {
            const card = document.createElement('article');
            card.className = 'video-card' + (video.videoId === activePlayingId ? ' active-playing' : '');
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            card.setAttribute('aria-label', `Play video: ${video.title}`);

            card.innerHTML = `
                <div class="video-card-thumb">
                    <img src="${video.thumb}" alt="${video.title}" loading="lazy" />
                    <div class="video-play-badge">
                        <span class="play-triangle">▶</span>
                    </div>
                    <span class="video-duration-pill">${video.duration}</span>
                </div>
                <div class="video-card-body">
                    <span class="video-tag-pill">${video.categoryLabel}</span>
                    <h4 class="video-card-title">${video.title}</h4>
                    <div class="video-card-meta">
                        <span>📺 CredaRx Guide</span>
                        <span>• ${video.language}</span>
                    </div>
                </div>
            `;

            const playVideo = () => {
                activePlayingId = video.videoId;
                mainYtFrame.src = `https://www.youtube-nocookie.com/embed/${video.videoId}?autoplay=1`;
                document.querySelectorAll('.video-card').forEach(c => c.classList.remove('active-playing'));
                card.classList.add('active-playing');
                if (featuredPlayer) {
                    featuredPlayer.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            };

            card.addEventListener('click', playVideo);
            card.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    playVideo();
                }
            });

            videoTrack.appendChild(card);
        });

        if (videoPrevBtn) {
            videoPrevBtn.addEventListener('click', () => {
                goToVideoSlide(videoCurrentIndex - 1);
            });
        }

        if (videoNextBtn) {
            videoNextBtn.addEventListener('click', () => {
                goToVideoSlide(videoCurrentIndex + 1);
            });
        }

        window.addEventListener('resize', () => {
            if (videoCurrentIndex > maxVideoIndex()) {
                videoCurrentIndex = maxVideoIndex();
            }
            buildVideoDots();
            moveVideoTrack();
        });

        buildVideoDots();
        moveVideoTrack();
    }

    // ================= Interactive Medicine Margin & GST Calculator =================
    const calcMrp = document.getElementById('calc-mrp');
    const calcPtr = document.getElementById('calc-ptr');
    const calcDiscount = document.getElementById('calc-discount');
    const gstTabs = document.getElementById('calc-gst-tabs');
    const resMargin = document.getElementById('res-margin');
    const resNetProfit = document.getElementById('res-net-profit');
    const resStatusBadge = document.getElementById('res-status-badge');
    const resSellingPrice = document.getElementById('res-selling-price');
    const resDiscountAmt = document.getElementById('res-discount-amt');
    const resPurchaseTotal = document.getElementById('res-purchase-total');
    const resItc = document.getElementById('res-itc');
    const resOutputGst = document.getElementById('res-output-gst');
    const calcWhatsappBtn = document.getElementById('calc-whatsapp-btn');

    if (calcMrp && calcPtr && resMargin) {
        let currentGstRate = 12;

        if (gstTabs) {
            gstTabs.querySelectorAll('.gst-pill').forEach(btn => {
                btn.addEventListener('click', () => {
                    gstTabs.querySelectorAll('.gst-pill').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    currentGstRate = parseFloat(btn.dataset.rate) || 0;
                    calculateMargin();
                });
            });
        }

        function calculateMargin() {
            const mrp = parseFloat(calcMrp.value) || 0;
            const ptr = parseFloat(calcPtr.value) || 0;
            const discountPct = parseFloat(calcDiscount.value) || 0;

            if (mrp <= 0) {
                resMargin.textContent = '0.0%';
                resNetProfit.textContent = '₹ 0.00';
                return;
            }

            // Customer selling price after discount
            const discountAmt = mrp * (discountPct / 100);
            const sellingPrice = Math.max(0, mrp - discountAmt);

            // GST calculations (Pharma PTR is cost before tax)
            const itcAmount = ptr * (currentGstRate / 100);
            const purchaseTotal = ptr + itcAmount;

            // Output GST on the selling price (inclusive tax model for retail)
            const taxableSale = currentGstRate > 0 ? (sellingPrice / (1 + (currentGstRate / 100))) : sellingPrice;
            const outputGst = sellingPrice - taxableSale;

            // Net Chemist Profit = (Taxable Selling Price - PTR)
            const netProfit = taxableSale - ptr;
            
            // Chemist Margin % on Selling Price
            const marginPct = taxableSale > 0 ? ((netProfit / taxableSale) * 100) : 0;

            // Update DOM
            resMargin.textContent = `${marginPct.toFixed(1)}%`;
            resNetProfit.textContent = `₹ ${netProfit.toFixed(2)}`;
            resSellingPrice.textContent = `₹ ${sellingPrice.toFixed(2)}`;
            resDiscountAmt.textContent = `₹ ${discountAmt.toFixed(2)}`;
            resPurchaseTotal.textContent = `₹ ${purchaseTotal.toFixed(2)}`;
            resItc.textContent = `₹ ${itcAmount.toFixed(2)}`;
            resOutputGst.textContent = `₹ ${outputGst.toFixed(2)}`;

            // Status Badge
            if (resStatusBadge) {
                if (marginPct >= 18) {
                    resStatusBadge.textContent = 'Healthy Margin (≥18%)';
                    resStatusBadge.className = 'metric-sub status-good';
                    resMargin.style.color = '#6ee7b7';
                } else if (marginPct >= 10) {
                    resStatusBadge.textContent = 'Standard Retail Margin';
                    resStatusBadge.className = 'metric-sub';
                    resMargin.style.color = '#93c5fd';
                } else if (marginPct > 0) {
                    resStatusBadge.textContent = 'Thin Margin (<10%)';
                    resStatusBadge.className = 'metric-sub';
                    resMargin.style.color = '#fbbf24';
                } else {
                    resStatusBadge.textContent = 'Loss Warning!';
                    resStatusBadge.className = 'metric-sub';
                    resMargin.style.color = '#f87171';
                }
            }

            // Update WhatsApp Share Link
            if (calcWhatsappBtn) {
                const shareText = encodeURIComponent(
                    `📊 *Medicine Margin & GST Calculation*\n` +
                    `• MRP: ₹${mrp.toFixed(2)}\n` +
                    `• PTR (Cost): ₹${ptr.toFixed(2)} (GST ${currentGstRate}%)\n` +
                    `• Discount: ${discountPct}%\n` +
                    `• Net Profit / Pack: ₹${netProfit.toFixed(2)}\n` +
                    `• Chemist Margin: ${marginPct.toFixed(1)}%\n\n` +
                    `Calculate your pharmacy margins for free with CredaERP: https://credaerp.netlify.app/#calculator`
                );
                calcWhatsappBtn.onclick = () => {
                    window.open(`https://wa.me/?text=${shareText}`, '_blank');
                };
            }
        }

        calcMrp.addEventListener('input', calculateMargin);
        calcPtr.addEventListener('input', calculateMargin);
        calcDiscount.addEventListener('input', calculateMargin);

        calculateMargin();
    }

    // ================= Free Chemist & Retailer Templates Downloader =================
    const templateButtons = document.querySelectorAll('.template-dl-btn');
    if (templateButtons.length > 0) {
        const TEMPLATES_DATA = {
            'schedule-h1': {
                filename: 'Schedule_H1_Drug_Register_CredaRx.csv',
                content:
`# SCHEDULE H1 DRUG REGISTER FORMAT (Compliant with Drugs & Cosmetics Rules 1945 India)
# Maintain records for 46 notified antibiotics & habit-forming drugs for 3 years
# Tip: CredaRx automatically logs Schedule H1 sales during billing. Free Trial: https://credaerp.netlify.app
Date of Supply,Patient Name,Patient Address,Prescribing Doctor Name,Doctor Address/Reg No,Drug Name (Generic & Brand),Batch No,Mfg Name,Quantity Supplied,Sign of Chemist
2026-11-12,Rahul Sharma,"12/A Park Street, Kolkata",Dr. S. K. Roy,"WBMC-45129, Apollo Clinic",Alprazolam 0.5mg (Restyl),BCH9821,Cipla Ltd,10 Tablets,Verified
2026-11-12,Anita Sen,"45 Gariahat Road, Kolkata",Dr. M. K. Banerjee,"WBMC-78901, Salt Lake",Azithromycin 500mg (Azithral),AZ4021,Alembic Pharma,3 Tablets,Verified
2026-11-12,Deepak Verma,"88 Lake Gardens, Kolkata",Dr. P. Sen,"WBMC-12345, AMRI Hospital",Zolpidem 10mg (Zolfresh),ZP1109,Sun Pharma,10 Tablets,Verified`
            },
            'expiry-tracker': {
                filename: 'Medicine_Expiry_Tracker_CredaRx.csv',
                content:
`# MEDICINE BATCH EXPIRY & RETURN TRACKER
# Track near-expiry stock 30/60/90 days in advance to claim distributor credit notes
# Tip: CredaRx automatically prioritizes FEFO batches and alerts you 90 days before expiry. Free Trial: https://credaerp.netlify.app
Item Name,Brand / Company,Batch No,Expiry Date (MM/YYYY),Purchase Rate (₹),MRP (₹),Current Stock (Units),Days Remaining,Action Required,Distributor Name,Claim Status
JANUVIA 100MG TABLET,MSD Pharmaceuticals,JNV204,12/2026,30.00,30.40,7,45,Return to Distributor,Bengal Drugs Agency,Pending Return
PAN 40 TABLET,Alkem Laboratories,PN8871,01/2027,9.50,15.50,50,75,Promote FEFO Dispense,Kolkata Medico,In Stock
AUGMENTIN 625 DUO,GSK India,AG4091,02/2027,14.20,22.00,20,105,Normal Monitoring,Apollo Distributors,In Stock
DOLO 650 TABLET,Micro Labs,DL9901,03/2027,1.80,3.40,150,135,Fast Moving - Normal,National Pharma,In Stock`
            },
            'day-closure': {
                filename: 'Daily_Day_Closure_Cash_Book_CredaERP.csv',
                content:
`# DAILY STORE CLOSURE & CASH RECONCILIATION BOOK
# Reconcile expected counter sales vs physical cash counted to eliminate shortage
# Tip: CredaERP locks daily totals with structured 1-click EOD audit. Free Trial: https://credaerp.netlify.app
Date,Opening Cash Drawer (₹),Total Cash Sales (₹),Total UPI/Digital Sales (₹),Total Customer Credit Given (₹),Customer Credit Collected (₹),Supplier Cash Paid Out (₹),Expected Cash in Drawer (₹),Physical Cash Counted (₹),Variance / Shortage-Excess (₹),Audited By
2026-11-12,2000.00,18500.00,14200.00,3100.00,2500.00,1200.00,21800.00,21800.00,0.00 (Balanced),Store Manager
2026-11-11,2000.00,16400.00,12100.00,2200.00,1800.00,500.00,19700.00,19680.00,-20.00 (Shortage),Store Manager
2026-11-10,2000.00,19200.00,15300.00,4000.00,3100.00,2000.00,22300.00,22350.00,+50.00 (Excess),Store Manager`
            },
            'item-catalog': {
                filename: 'CredaERP_Medicine_Master_Catalog_Template.csv',
                content:
`# CREDARX / CREDAERP ITEM MASTER CATALOG IMPORT TEMPLATE
# Direct 1-click import compatible format for setup in 5 minutes
# Tip: Upload via Inventory -> Inventory List -> Import CSV. Free Trial: https://credaerp.netlify.app
Item Name,Generic Salt / Composition,HSN Code,GST Slab (%),Pack Size,Purchase Rate (PTR ₹),MRP (₹),Rack / Shelf Location,Reorder Level (Units)
DOLO 650 TABLET,Paracetamol 650mg,30049060,12,15,27.00,34.00,Rack A-1,100
CALPOL 500 TABLET,Paracetamol 500mg,30049060,12,15,18.00,23.50,Rack A-1,50
PAN 40 TABLET,Pantoprazole 40mg,30049099,12,15,115.00,155.00,Rack B-3,30
AUGMENTIN 625 DUO,Amoxicillin 500mg + Clavulanic Acid 125mg,30041000,12,10,145.00,223.00,Rack C-2,20
AZITHRAL 500 TABLET,Azithromycin 500mg,30042010,12,3,68.00,119.50,Rack C-4,15
TELMA 40 TABLET,Telmisartan 40mg,30049099,12,15,130.00,215.00,Rack D-1,25`
            }
        };

        templateButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const key = btn.dataset.template;
                const tmpl = TEMPLATES_DATA[key];
                if (!tmpl) return;

                const blob = new Blob([tmpl.content], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = tmpl.filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            });
        });
    }
});
