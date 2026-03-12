const initLoader = () => {
    return new Promise((resolve) => {
        const loader = document.querySelector("#loader");
        const progress = document.querySelector(".loader-progress");
        const percent = document.querySelector(".loader-percent");

        let count = 0;

        const interval = setInterval(() => {
            count += Math.floor(Math.random() * 10) + 3;

            if (count >= 100) {
                count = 100;
                clearInterval(interval);

                setTimeout(() => {
                    gsap.to(loader, {
                        yPercent: -100,
                        duration: 1,
                        ease: "power3.inOut",
                        onComplete: () => {
                            loader.style.display = "none";
                            resolve();
                        }
                    });
                }, 500);
            }

            progress.style.width = count + "%";
            percent.textContent = count + "%";

        }, 80);
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
    const scroll = new LocomotiveScroll({
        el: document.querySelector("#wrapper"),
        smooth: true,
        multiplier: 0.8,
        lerp: 0.08,
        smartphone: { smooth: true },
        tablet: { smooth: true }
    });
    return scroll;
};



const initScrollTrigger = (scroll) => {
    gsap.registerPlugin(ScrollTrigger);

    scroll.on("scroll", ScrollTrigger.update);

    ScrollTrigger.scrollerProxy("#wrapper", {
        scrollTop(value) {
            return arguments.length
                ? scroll.scrollTo(value, 0, 0)
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
    ScrollTrigger.refresh();
};



const initCursor = () => {
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



const resetHamburger = (hamburger) => {
    const spans = hamburger.querySelectorAll("span");
    spans.forEach(span => {
        span.style.transform = "";
        span.style.opacity = "";
    });
};



const initHeader = (scroll) => {
    let lastScroll = 0;
    const header = document.querySelector("#header");
    const mobileMenu = document.querySelector("#mobileMenu");
    const hamburger = document.querySelector("#hamburger");

    scroll.on("scroll", ({ scroll }) => {
        const currentScroll = scroll.y;


        if (mobileMenu.classList.contains("active")) {
            gsap.to(header, {
                y: 0,
                duration: 0.4,
                ease: "power2.out"
            });
            lastScroll = currentScroll;
            return;
        }

        if (currentScroll > lastScroll && currentScroll > 100) {

            gsap.to(header, {
                y: -100,
                duration: 0.4,
                ease: "power2.in"
            });
        } else {

            gsap.to(header, {
                y: 0,
                duration: 0.4,
                ease: "power2.out",
                onComplete: () => {
                    if (hamburger && !hamburger.classList.contains("active")) {
                        resetHamburger(hamburger);
                    }
                }
            });
        }

        lastScroll = currentScroll;
    });
};



const initHamburger = () => {
    const hamburger = document.querySelector("#hamburger");
    const mobileMenu = document.querySelector("#mobileMenu");
    const mobileLinks = document.querySelectorAll(".mobile-link");
    const header = document.querySelector("#header");

    hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        mobileMenu.classList.toggle("active");


        gsap.to(header, {
            y: 0,
            duration: 0.4,
            ease: "power2.out"
        });

        if (!hamburger.classList.contains("active")) {
            resetHamburger(hamburger);
        }
    });

    mobileLinks.forEach(link => {
        link.addEventListener("click", () => {
            setTimeout(() => {
                hamburger.classList.remove("active");
                mobileMenu.classList.remove("active");
                resetHamburger(hamburger);

                gsap.to(header, {
                    y: 0,
                    duration: 0.4,
                    ease: "power2.out"
                });
            }, 300);
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
                scroller: "#wrapper",
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
                scroller: "#wrapper",
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
                scroller: "#wrapper",
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
                scroller: "#wrapper",
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
                scroller: "#wrapper",
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
                scroller: "#wrapper",
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
                scroller: "#wrapper",
                start: "top 75%",
            }
        }
    );
};


const initHorizontalDrag = () => {
    const tracks = document.querySelectorAll(".projects-track");

    tracks.forEach(track => {
        let isDown = false;
        let startX;
        let scrollLeft;

        track.addEventListener("mousedown", (e) => {
            isDown = true;
            startX = e.pageX - track.offsetLeft;
            scrollLeft = track.scrollLeft;
        });

        track.addEventListener("mouseleave", () => {
            isDown = false;
        });

        track.addEventListener("mouseup", () => {
            isDown = false;
        });

        track.addEventListener("mousemove", (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - track.offsetLeft;
            const walk = (x - startX) * 2;
            track.scrollLeft = scrollLeft - walk;
        });
    });
};


document.addEventListener("DOMContentLoaded", async () => {
    await initLoader();

    const scroll = initLocomotiveScroll();
    initScrollTrigger(scroll);
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
});