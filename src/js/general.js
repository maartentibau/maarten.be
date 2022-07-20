// @prepros-prepend "vendors/tiny-slider.js"

//var mobile = $('.mobileIndicator').is(':visible');
let touch = ("ontouchstart" in window || window.DocumentTouch && document instanceof DocumentTouch);
if (touch == undefined) { touch = false; }


/*
.########.##.....##.########.##.....##.########
....##....##.....##.##.......###...###.##......
....##....##.....##.##.......####.####.##......
....##....#########.######...##.###.##.######..
....##....##.....##.##.......##.....##.##......
....##....##.....##.##.......##.....##.##......
....##....##.....##.########.##.....##.########
*/
const themeToggle = document.querySelectorAll(".js-theme-toggle");
const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
let currentTheme = prefersDarkScheme.matches ? "dark" : "light";

switch(localStorage.getItem("theme")) {
    case "dark":
        currentTheme = "dark";
        break;
    case "light":
        currentTheme = "light";
        break;
  }

if (currentTheme == "dark") {
    document.body.classList.add("theme-dark");
} else {
    document.body.classList.add("theme-light");
}

themeToggle.forEach(function(el, index) {
    el.addEventListener("click", function () {
        if (currentTheme == "dark") {
            document.body.classList.remove("theme-dark");
            document.body.classList.add("theme-light");
            currentTheme = "light";
        } else {
            document.body.classList.remove("theme-light");
            document.body.classList.add("theme-dark");
            currentTheme = "dark";
        }
    
        localStorage.setItem("theme", currentTheme);
    });
})

/*
..######..##.......####.########..########.########.
.##....##.##........##..##.....##.##.......##.....##
.##.......##........##..##.....##.##.......##.....##
..######..##........##..##.....##.######...########.
.......##.##........##..##.....##.##.......##...##..
.##....##.##........##..##.....##.##.......##....##.
..######..########.####.########..########.##.....##
*/
const slider = document.querySelector(".js-slider");

if (slider) {
    tns({
        container: slider,
        controlsContainer: '.js-slider-nav',
        slideBy: 'page',
        items: 3,
        navPosition: 'bottom',
        gutter: 15,
        mouseDrag: true,
        loop: false,
        responsive: {
            512: {
                items: 4
            },
            768: {
                items: 5
            },
            960: {
                items: 6,
                gutter: 30
            },
            1200: {
                items: 8,
                gutter: 30
            }
        }
    });
}

/*
..######...######..########...#######..##.......##......
.##....##.##....##.##.....##.##.....##.##.......##......
.##.......##.......##.....##.##.....##.##.......##......
..######..##.......########..##.....##.##.......##......
.......##.##.......##...##...##.....##.##.......##......
.##....##.##....##.##....##..##.....##.##.......##......
..######...######..##.....##..#######..########.########
*/
// We select the element we want to target
const target = document.querySelector("footer");

const scrollTop = document.querySelector(".js-scrollTop")
const rootElement = document.documentElement

function callback(entries, observer) {
    entries.forEach(function(entry) {
        if (entry.isIntersecting) {
            scrollTop.classList.add("is-visible")
        } else {
            scrollTop.classList.remove("is-visible")
        }
    });
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    })
}
scrollTop.addEventListener("click", scrollToTop);

let observer = new IntersectionObserver(callback);
observer.observe(target);

/*
.##....##....###....##.....##
.###...##...##.##...##.....##
.####..##..##...##..##.....##
.##.##.##.##.....##.##.....##
.##..####.#########..##...##.
.##...###.##.....##...##.##..
.##....##.##.....##....###...
*/
const navToggle = document.querySelector('.js-nav-toggle');
const navList = document.querySelector('.js-nav-list');

navToggle.addEventListener('click', function() {
    if (this.classList.contains('open')) {
        document.body.style.overflow = '';
        fadeOut(navList);
        this.classList.remove('open');
    } else {
        document.body.style.overflow = 'hidden';
        fadeIn(navList);
        this.classList.add('open');
    }    
});

function fadeOut(el) {
    el.style.opacity = 1;
    (function fade() {
        if ((el.style.opacity -= .1) < 0) {
            el.style.display = "none";
        } else {
            requestAnimationFrame(fade);
        }
    })();
};

function fadeIn(el, display) {
    el.style.opacity = 0;
    el.style.display = display || "flex";
    (function fade() {
        var val = parseFloat(el.style.opacity);
        if (!((val += .1) > 1)) {
            el.style.opacity = val;
            requestAnimationFrame(fade);
        }
    })();
};