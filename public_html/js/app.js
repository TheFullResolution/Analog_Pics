/* global Vue */


var url = "js/lazysizes.min.js";

var allPics = Vue.extend({
    data: function () {
        return {
            pics: {},
            folders: {
                full: "img/gallery/full_size/",
                mid: "img/gallery/mid/",
                small: "img/gallery/small/",
                zoom: "img/gallery/zoom/"
            },
            sorted: false,
            piczoom: false,
            windowWidth: ''
        };
    },
    computed: {
        length: function () {
            if (this.pics.gallery) {
                return this.pics.gallery.length;
            } else {
                return 0;
            }
        },
        gallery: function () {
            return this.pics.gallery;
        },
        sortStatus: function () {
            if (this.sorted) {
                return "Sorted oldest to newest";
            } else {
                return "Sorted newest to oldest";
            }
        },
        sortLink: function () {
            if (this.sorted) {
                return "/sortedbynew";
            } else {
                return "/sortedbyold";
            }
        },
        folderGallery: function () {
            if ($(window).width() < 740) {
                return this.folders.small;
            } else {
                return this.folders.mid;
            }
        },
        zoomGallery: function () {
            if ($(window).width() < 740) {
                return this.folders.mid;
            } else {
                return this.folders.zoom;
            }
        }
    },
    compiled: function () {
        this.fetchData();
    },
    ready: function () {
        this.downloadlazyload();
    },
    methods: {
        fetchData: function () {
            var self = this;
            $.getJSON("js/gallery.json", function (json) {
                self.pics = json;
            });
        },
        sort: function () {
            $('#sort_arrows').addClass('moved');
            $('#sort_text').addClass('text_showed');

            setTimeout(function () {
                $('#sort_text').removeClass('text_showed');
                $('#sort_arrows').removeClass('moved');
            }, 500);
        },
        downloadlazyload: function () {
            $.ajax({
                url: url,
                dataType: 'script',
                success: function () {
                    window.lazySizesConfig = {
                        addClasses: true
                    };

                }});
        }
    }
});



var sortedbynew = Vue.extend({
    template: "#gallery_template",
    ready: function () {
        this.$parent.sorted = false;
    },
    data: function () {
        return {
            zoomLink: "/sortedbynew"
        };
    },
    computed: {
        gallery: function () {
            if (this.$parent.gallery) {
                var pics = this.$parent.gallery.slice();
                pics.reverse();
                return pics;
            } else {
                return '';
            }
        },
        folders: function () {
            return this.$parent.folderGallery;
        },
        zoomGallery: function () {
            return this.$parent.zoomGallery;
        }, 
        folderFull: function () {
            return this.$parent.folders.full;
        },
        length: function () {
            return this.$parent.length;
        }

    }
});

var sortedbyold = Vue.extend({
    template: "#gallery_template",
    ready: function () {
        this.$parent.sorted = true;
    },
    data: function () {
        return {
            zoomLink: "/sortedbyold"
        };
    },
    computed: {
        gallery: function () {
            if (this.$parent.gallery) {
                var pics_notsorted = this.$parent.gallery;
                return pics_notsorted;
            } else {
                return '';
            }
        },
        folders: function () {
            return this.$parent.folderGallery;
        },
        folderFull: function () {
            return this.$parent.folders.full;
        },
        zoomGallery: function () {
            return this.$parent.zoomGallery;
        },
        length: function () {
            return this.$parent.length;
        }
    }
});

var zoom = Vue.extend({
    template: "#popup",
    ready: function () {
        $('body').css('overflow', 'hidden');
        this.swipe();
    },
    computed: {
        index: function () {
            if (this.$route.params.picId) {
                return parseInt(this.$route.params.picId) - 1;
            } else {
                return 0;
            }
        },
        currentPic: function () {
            var self = this;
            if (self.$parent.gallery) {
                var pic = self.$parent.gallery[self.index];
                return pic;
            } else {
                return '';
            }
        },
        fullSizeSrc: function () {
            var self = this;
            if (self.$parent.gallery) {
                var pic = self.$parent.gallery[self.index];
                return this.$parent.folderFull+ pic.name;
            } else {
                return '';
            }
        },
        currentPicSrc: function () {
            var self = this;
            if (self.$parent.gallery) {
                var pic = self.$parent.gallery[self.index];
                return this.$parent.zoomGallery + pic.name;
            } else {
                return 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
            }
        },
        link: function () {
            return this.$parent.zoomLink;
        },
        nextpic: function () {
            var check = this.$parent.length;
            if ((this.index + 1) === check) {
                return 1;
            } else {
                return this.index + 2;
            }
        },
        prevpic: function () {
            var check = this.$parent.length;
            if (this.index === 0) {
                return check;
            } else {
                return this.index;
            }
        },
        imgClass: function () {
            if (this.currentPic.ratio === "portrait") {
                return 'img_link_port';
            } else {
                return '.img_link_land';
            }
        },
        popClass: function () {
            if (this.currentPic.ratio === "portrait") {
                return 'popup_container_h';
            } else {
                return '';
            }
        }
    },
    methods: {
        imgChange: function () {
            $(".img_link_img").attr("src", "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==");
            $('.img_link_img').removeClass('lazyloaded').addClass('lazyload');
        },
        details: function () {
            if ($(".popup_details").hasClass("details_no")) {
                $('.popup_details').removeClass('details_no').addClass('details_show');
                $('.popup_details_top').removeClass('details_no_up').addClass('details_show_up');
            } else {
                $('.popup_details').removeClass('details_show').addClass('details_no');
                $('.popup_details_top').removeClass('details_show_up').addClass('details_no_up');
            }
        },
        swipe: function () {
            var self = this;
            var myElement = document.getElementById('swipe_div');
            var mc = new Hammer(myElement);
            mc.on('swipeleft', function () {
                var path = {path: self.link + '/' + self.nextpic};
                router.go(path);
                self.imgChange();
            });
            mc.on('swiperight', function () {
                var path = {path: self.link + '/' + self.prevpic};
                router.go(path);
                self.imgChange();
            });
        }
    }


});



var router = new VueRouter({
});


router.redirect({
    '/': '/sortedbynew'
});

router.map({
    '/sortedbynew': {
        component: sortedbynew,
        subRoutes: {
            '/': {
                component: {
                    template: '',
                    ready: function () {
                        $('body').css('overflow', 'auto');
                    }
                }
            },
            '/:picId': {
                component: zoom
            }
        }

    },
    '/sortedbyold': {
        component: sortedbyold,
        subRoutes: {
            '/': {
                component: {
                    template: '',
                    ready: function () {
                        $('body').css('overflow', 'auto');
                    }
                }
            },
            '/:picId': {
                component: zoom
            }
        }
    }



});


router.start(allPics, 'body', function () {

});

