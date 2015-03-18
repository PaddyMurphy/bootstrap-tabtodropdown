/* =========================================================
 * bootstrap-tabdrop.js
 * http://www.eyecon.ro/bootstrap-tabdrop
 * =========================================================
 * Copyright 2012 Stefan Petre
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * TODO: - check if el has position relative and add if not
 *         plugin will not work otherwise (so there is no need for css)
 *       - contain plugin to instantiated .nav-tabs only
 * ========================================================= */

!function( $ ) {

    var WinResizer = (function(){
        var registered = [];
        var inited = false;
        var timer;
        var resize = function(ev) {
            clearTimeout(timer);
            timer = setTimeout(notify, 100);
        };
        var notify = function() {
            for(var i=0, cnt=registered.length; i<cnt; i++) {
                registered[i].apply();
            }
        };
        return {
            register: function(fn) {
                registered.push(fn);
                if (inited === false) {
                    $(window).bind('resize', resize);
                    inited = true;
                }
            },
            unregister: function(fn) {
                for(var i=0, cnt=registered.length; i<cnt; i++) {
                    if (registered[i] == fn) {
                        delete registered[i];
                        break;
                    }
                }
            }
        };
    }());

    var TabToDropdown = function(element, options) {

        var that = this;

        this.element = $(element);

        this.dropdown = $('<li class="dropdown hide tabdrop"><button class="btn btn-default dropdown-toggle" data-toggle="dropdown"><span>'+options.text+' </span><i class="icon-chevron-down" aria-hidden="true"></i></button><ul class="dropdown-menu"></ul></li>')
                            .prependTo(this.element);

        if (this.element.parent().is('.tabs-below')) {
            this.dropdown.addClass('dropup');
        }

        //console.log(this.element);
        // on change set the currently selected
        // TODO: account for multiple nav-tabs on a page
        $(this.element).on('blur', 'li:not(.tabdrop)', function() {
            // pass element and name
            $.fn.tabtodropdown.setTabname(that.element, this);
        });

        WinResizer.register($.proxy(this.layout, this));
        this.layout();
    };

    TabToDropdown.prototype = {

        constructor: TabToDropdown,

        layout: function() {
            // this is an all or nothing approach to tabs
            // if all tabs can fit without stacking then show tabs
            // if any breaks to the next line then show a dropdown
            var collection = [];
            //var tabs = document.querySelectorAll('.nav-tabs li:not(.tabdrop)');
            var tabs = $(this.element).find('li:not(.tabdrop)');

            this.dropdown.removeClass('hide');
            this.element
                .append(this.dropdown.find('li'))
                .find('>li')
                .not('.tabdrop')
                .each(function(){
                    if(this.offsetTop > 0) {
                        // append all if any have offsetTop > 0
                        collection = tabs;
                        return false; // break out of each
                    }
                });

            if (collection.length > 0) {
                collection = $(collection);
                this.dropdown
                    .find('ul')
                    .empty()
                    .append(collection);
                if (this.dropdown.find('.active').length == 1) {
                    this.dropdown.addClass('active');
                } else {
                    this.dropdown.removeClass('active');
                }
            } else {
                this.dropdown.addClass('hide');
            }
        }

    };

    $.fn.tabtodropdown = function ( option ) {
        return this.each(function () {
            var $this = $(this),
                text = $this.find('li.active:not(.tabdrop)').text().trim(),
                data = $this.data('tabdrop'),
                options = typeof option === 'object' && option;

            // if there were no options create it
            if(!options) {
                options = {};
            }

            if(typeof(options.text) === 'undefined') {
                // set the selected text
                options.text = text;
            }

            if (!data)  {
                $this.data('tabdrop', (data = new TabToDropdown(this, $.extend({}, $.fn.tabtodropdown.defaults, options))));
            }

            if (typeof option == 'string') {
                data[option]();
            }
        });
    };

    $.fn.tabtodropdown.setTabname = function(element, active) {
        // @requires element in dom to update
        // @requires active
        var el = $(element);
        var name = $(active).text().trim();
        // support for multiple menus
        el.find('.tabdrop .dropdown-toggle span').text(name);
    };
    //console.log($('.nav-tabs .active:not(.tabdrop)'));
    $.fn.tabtodropdown.defaults = {
        //text: $('.nav-tabs:first .active:not(.tabdrop)').text().trim(),
        offsetTop: 0
    };

    $.fn.tabtodropdown.Constructor = TabToDropdown;

}( window.jQuery );