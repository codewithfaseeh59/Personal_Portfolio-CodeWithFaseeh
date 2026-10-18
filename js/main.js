// "#wrapper" when Locomotive smooth scroll is active (desktop), window otherwise.
let scroller = window;

// After a nav-link jump the header stays visible until the visitor scrolls
// themselves; lockUntil also delays layout refreshes while the jump runs.
const navState = { pinned: false, lockUntil: 0 };

const initLoader = () => {
    return new Promise((resolve) => {
        const loader = document.querySelector("#loader");
        const progress = document.querySelector(".loader-progress");
        const percent = document.querySelector(".loader-percent");
        const state = { value: 0 };

        const render = () => {
            const count = Math.round(state.value);
            progress.style.width = count + "%";
            percent.textContent = count + "%";
        };

        const pageLoaded = new Promise((done) => {
            if (document.readyState === "complete") done();
            else window.addEventListener("load", done, { once: true });
        });
        const maxWait = new Promise((done) => setTimeout(done, 2000));

        const creep = gsap.to(state, {
            value: 90,
            duration: 1.2,
            ease: "power1.out",
            onUpdate: render
        });

        Promise.race([pageLoaded, maxWait]).then(() => {
            creep.kill();
            gsap.to(state, {
                value: 100,
                duration: 0.3,
                ease: "none",
                onUpdate: render,
                onComplete: () => {
                    gsap.to(loader, {
                        yPercent: -100,
                        duration: 0.6,
                        ease: "power3.inOut",
                        onComplete: () => {
                            loader.style.display = "none";
                            resolve();
                        }
                    });
                }
            });
        });
    });
};


const initNavAnimation = () => {
    gsap.fromTo("#header",
        { y: -100, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
        }
    );
};


const initLocomotiveScroll = () => {
    // Smooth scroll on desktop only; phones and tablets use native scrolling.
    const scroll = new LocomotiveScroll({
        el: document.querySelector("#wrapper"),
        smooth: true,
        multiplier: 0.8,
        lerp: 0.08,
        smartphone: { smooth: false },
        tablet: { smooth: false, breakpoint: 1024 }
    });

    if (document.documentElement.classList.contains("has-scroll-smooth")) {
        scroller = "#wrapper";
    }
    return scroll;
};



const initScrollTrigger = (scroll) => {
    gsap.registerPlugin(ScrollTrigger);

    if (scroller === "#wrapper") {
        scroll.on("scroll", ScrollTrigger.update);

        ScrollTrigger.scrollerProxy("#wrapper", {
            scrollTop(value) {
                return arguments.length
                    ? scroll.scrollTo(value, { duration: 0, disableLerp: true })
                    : scroll.scroll.instance.scroll.y;
            },
            getBoundingClientRect() {
                return {
                    top: 0,
                    left: 0,
                    width: window.innerWidth,
                    height: window.innerHeight
                };
            },
            pinType: document.querySelector("#wrapper").style.transform
                ? "transform"
                : "fixed"
        });

        ScrollTrigger.addEventListener("refresh", () => scroll.update());
    }

    ScrollTrigger.refresh();
};


// Webfonts and resizes change the page height after init, so re-measure.
// Images have fixed dimensions, so they don't need to trigger this.
const initLayoutRefresh = (scroll) => {
    let timer;
    const refresh = () => {
        clearTimeout(timer);
        // ScrollTrigger.refresh() resets the scroll position, which would
        // cancel an in-flight anchor scroll, so wait for it to finish.
        const wait = Math.max(100, navState.lockUntil - performance.now() + 50);
        timer = setTimeout(() => {
            scroll.update();
            ScrollTrigger.refresh();
        }, wait);
    };

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
    if ("ResizeObserver" in window) {
        new ResizeObserver(refresh).observe(document.querySelector("#main"));
    }
};


const initAnchorLinks = (scroll) => {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        const hash = link.getAttribute("href");
        if (hash.length < 2) return;

        link.addEventListener("click", (e) => {
            const target = document.querySelector(hash);
            if (!target) return;

            e.preventDefault();
            navState.pinned = true;
            navState.lockUntil = performance.now() + 2200;
            scroll.scrollTo(target, { duration: 1200, disableLerp: false });
            history.replaceState(null, "", hash);
        });
    });

    // Locomotive jumps to the hash before the page height is known and lands
    // short, so redo it once layout has settled.
    const initial = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (initial) {
        navState.pinned = true;
        setTimeout(() => scroll.scrollTo(initial, { duration: 800 }), 500);
    }
};



const initCursor = () => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    Shery.mouseFollower({
        skew: true,
        ease: "cubic-bezier(0.23, 1, 0.320, 1)",
        duration: 1,
    });

    Shery.makeMagnet(".btn-primary");
    Shery.makeMagnet(".social-link");
    Shery.makeMagnet(".footer-social");
    Shery.makeMagnet(".card-link");
    Shery.makeMagnet(".nav-links a");
    Shery.makeMagnet(".mobile-link");
    Shery.makeMagnet(".hamburger");
};



const initHeader = (scroll) => {
    let lastScroll = 0;
    let hidden = false;
    const header = document.querySelector("#header");
    const mobileMenu = document.querySelector("#mobileMenu");

    const setHidden = (value) => {
        if (hidden === value) return;
        hidden = value;
        gsap.to(header, {
            y: value ? -100 : 0,
            duration: 0.4,
            ease: value ? "power2.in" : "power2.out"
        });
    };

    ["wheel", "touchstart", "keydown"].forEach((type) => {
        window.addEventListener(type, () => { navState.pinned = false; }, { passive: true });
    });

    scroll.on("scroll", ({ scroll }) => {
        const currentScroll = scroll.y;

        if (mobileMenu.classList.contains("active") || navState.pinned) {
            setHidden(false);
        } else if (currentScroll > lastScroll && currentScroll > 100) {
            setHidden(true);
        } else {
            setHidden(false);
        }

        lastScroll = currentScroll;
    });
};



const initHamburger = () => {
    const hamburger = document.querySelector("#hamburger");
    const mobileMenu = document.querySelector("#mobileMenu");
    const mobileLinks = document.querySelectorAll(".mobile-link, #mobileMenu .btn-primary");
    const header = document.querySelector("#header");

    const setMenu = (open) => {
        hamburger.classList.toggle("active", open);
        mobileMenu.classList.toggle("active", open);
        hamburger.setAttribute("aria-expanded", String(open));
    };

    hamburger.addEventListener("click", () => {
        setMenu(!mobileMenu.classList.contains("active"));

        gsap.to(header, {
            y: 0,
            duration: 0.4,
            ease: "power2.out"
        });
    });

    mobileLinks.forEach(link => {
        link.addEventListener("click", () => {
            setTimeout(() => setMenu(false), 300);
        });
    });
};

const initHeroAnimation = () => {
    const heroTl = gsap.timeline({ delay: 0.3 });

    heroTl
        .fromTo(".hero-label",
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
        )
        .fromTo(".hero-line",
            { y: 80, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, ease: "power3.out", stagger: 0.15 },
            "-=0.4"
        )
        .fromTo(".hero-subtext",
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
            "-=0.4"
        )
        .fromTo(".hero-cta",
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
            "-=0.4"
        )
        .fromTo(".scroll-indicator",
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
            "-=0.3"
        );
};

const initAboutAnimation = () => {
    gsap.fromTo(".about-visual",
        { scale: 0.8, opacity: 0 },
        {
            scale: 1,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: "#about",
                scroller,
                start: "top 75%",
            }
        }
    );

    gsap.fromTo(".about-right > *",
        { y: 50, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.15,
            scrollTrigger: {
                trigger: "#about",
                scroller,
                start: "top 70%",
            }
        }
    );
};

const initProjectsAnimation = () => {
    gsap.fromTo(".projects-header > *",
        { y: 40, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.15,
            scrollTrigger: {
                trigger: "#projects",
                scroller,
                start: "top 75%",
            }
        }
    );
};

const initServicesAnimation = () => {
    gsap.fromTo(".service-card",
        { y: 60, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.1,
            scrollTrigger: {
                trigger: "#services",
                scroller,
                start: "top 70%",
            }
        }
    );
};


const initContactAnimation = () => {
    gsap.fromTo(".contact-header > *",
        { y: 40, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.15,
            scrollTrigger: {
                trigger: "#contact",
                scroller,
                start: "top 75%",
            }
        }
    );

    gsap.fromTo(".contact-left > *",
        { x: -40, opacity: 0 },
        {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.15,
            scrollTrigger: {
                trigger: ".contact-content",
                scroller,
                start: "top 75%",
            }
        }
    );

    gsap.fromTo(".contact-right",
        { x: 40, opacity: 0 },
        {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
                trigger: ".contact-content",
                scroller,
                start: "top 75%",
            }
        }
    );
};


const initHorizontalDrag = () => {
    const tracks = document.querySelectorAll(".projects-track");
    const DRAG_THRESHOLD = 5;

    tracks.forEach(track => {
        let isDown = false;
        let moved = false;
        let startX;
        let scrollLeft;

        const stop = () => {
            isDown = false;
            track.classList.remove("active");
        };

        track.addEventListener("mousedown", (e) => {
            isDown = true;
            moved = false;
            startX = e.pageX - track.offsetLeft;
            scrollLeft = track.scrollLeft;
        });

        track.addEventListener("mouseleave", stop);
        track.addEventListener("mouseup", stop);

        track.addEventListener("mousemove", (e) => {
            if (!isDown) return;
            const x = e.pageX - track.offsetLeft;
            const walk = (x - startX) * 2;
            if (Math.abs(walk) > DRAG_THRESHOLD) {
                moved = true;
                track.classList.add("active");
            }
            e.preventDefault();
            track.scrollLeft = scrollLeft - walk;
        });

        // A drag that ends over "View Live" must not open the link.
        track.addEventListener("click", (e) => {
            if (moved) {
                e.preventDefault();
                e.stopPropagation();
                moved = false;
            }
        }, true);

        track.addEventListener("dragstart", (e) => e.preventDefault());
    });
};


const initContactForm = () => {
    const form = document.querySelector("#contactForm");
    const status = document.querySelector("#formStatus");
    const button = form.querySelector(".btn-submit");
    const label = button.querySelector(".btn-label");
    const idleText = label.textContent;

    const show = (message, kind) => {
        status.textContent = message;
        status.className = "form-status " + kind;
    };

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (form.action.includes("YOUR_FORM_ID")) {
            show("The form isn't connected yet. Please email me directly.", "error");
            return;
        }

        button.disabled = true;
        label.textContent = "Sending...";
        show("", "");

        try {
            const response = await fetch(form.action, {
                method: "POST",
                body: new FormData(form),
                headers: { Accept: "application/json" }
            });

            if (!response.ok) throw new Error("Request failed");

            form.reset();
            show("Thanks! Your message was sent. I'll get back to you soon.", "success");
        } catch (err) {
            show("Something went wrong. Please try again or email me directly.", "error");
        } finally {
            button.disabled = false;
            label.textContent = idleText;
        }
    });
};


document.addEventListener("DOMContentLoaded", async () => {
    document.querySelector("#year").textContent = new Date().getFullYear();

    await initLoader();

    const scroll = initLocomotiveScroll();
    initScrollTrigger(scroll);
    initLayoutRefresh(scroll);
    initAnchorLinks(scroll);
    initCursor();
    initHeader(scroll);
    initHamburger();
    initNavAnimation();
    initHeroAnimation();
    initAboutAnimation();
    initProjectsAnimation();
    initServicesAnimation();
    initContactAnimation();
    initHorizontalDrag();
    initContactForm();
});
