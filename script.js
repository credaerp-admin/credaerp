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
});
