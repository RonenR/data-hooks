(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
window.wsGlobals = window.wsGlobals || {};
window.wsGlobals.DataHooks = require("./index").DataHooks;

},{"./index":2}],2:[function(require,module,exports){
const DATA_ATTRIBUTE_NAMES = {
    onClick: "data-ws-onclick",
    tabData: "data-ws-tab",
    toggleHiddenButton: "data-ws-toggle-hidden-button",
    toggleHiddenData: "data-ws-toggle-hidden-data",
}

class GenericDomHooks {

    // TODO: Add all hooks to here - this will be the only one called:
    static initAll() {
        GenericDomHooks.setDataOnClickHooks();
        GenericDomHooks.setTabSelectorsHooks();
        GenericDomHooks.setToggleHiddenHooks();
    }

    static setDataOnClickHooks() {
        let attributeName = DATA_ATTRIBUTE_NAMES.onClick;
        let wsGlobals = window.wsGlobals || {};
        //debugger;
        document.querySelectorAll( "[" + attributeName + "]" ).forEach((el)=>{
            el.addEventListener('click',(ev)=> {
                if (ev.currentTarget instanceof Element) {
                    let value = ev.currentTarget.getAttribute(attributeName);
                    console.log('clicked el with data-ws-onclick="' + value + '"');
                    if (value.includes(":")) {
                        let parts = value.split(":");
                        let action = parts[0];
                        let name = parts[1];

                        if (action=="hideClass" && name) {
                            GenericDomHooks.hideClass(name);
                        }
                    } else {
                        let action = wsGlobals[value] || window[value];
                        if (action && action instanceof Function) {
                            action(ev.currentTarget);
                        }
                    }
                }
            });
        });
    };

    static hideClass(className) {
        document.querySelectorAll( "." + className ).forEach((el)=>{
            if (el instanceof Element) {
                let style = (el.getAttribute("style") || "") + ";display:none";
                el.setAttribute("style", style);
            }
        });
    }

    static setTabSelectorsHooks() {
        // Per tab selector click:
        function onTabSelected(tabName) {
            let tabSelectors = document.getElementsByClassName("tab-selector");
            for (const tabSelector of tabSelectors) {
                if (tabSelector.getAttribute(DATA_ATTRIBUTE_NAMES.tabData) == tabName) {
                    tabSelector.className = "tab-selector selected";
                } else {
                    tabSelector.className = "tab-selector";
                }
            }

            let tabSections = document.getElementsByClassName("tab-section");
            for (const tab of tabSections) {
                if (tab.getAttribute(DATA_ATTRIBUTE_NAMES.tabData) == tabName) {
                    tab.className = "tab-section";
                } else {
                    tab.className = "tab-section hidden";
                }
            }
        }


        let tabSelectors = document.getElementsByClassName("tab-selector");
        for (const tabSelector of tabSelectors) {
            tabSelector.addEventListener('click', function (e) {
                onTabSelected(tabSelector.getAttribute(DATA_ATTRIBUTE_NAMES.tabData));
            })
        }
    }

    static setToggleHiddenHooks() {
        let buttonAttributeName = DATA_ATTRIBUTE_NAMES.toggleHiddenButton;
        let dataAttributeName = DATA_ATTRIBUTE_NAMES.toggleHiddenData;
        document.querySelectorAll( "[" + buttonAttributeName + "]" ).forEach((el)=>{
            el.addEventListener('click',(ev)=> {
                if (ev.currentTarget instanceof Element) {
                    let value = ev.currentTarget.getAttribute(buttonAttributeName);

                    document.querySelectorAll( "[" + dataAttributeName + "='" + value + "']" ).forEach((elData)=>{
                        if (elData instanceof Element) {
                            if (elData.classList.contains('hidden')) {
                                elData.classList.remove('hidden');
                            } else {
                                elData.classList.add('hidden');
                            }
                        }
                    });
                }
            });
        });
    }

}

GenericDomHooks.initAll();
exports.DataHooks = GenericDomHooks;

},{}]},{},[1]);
