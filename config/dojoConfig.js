var dojoConfig = {
    locale: 'en',
    isDebug: true,
    async: true,
    packages: [{
        "name": "UCMapWebGIS",
        "location": location.pathname.replace(/\/[^/]+$/, "") + "/UCMapWebGIS"
    }, {
        "name": "heatmap",
        "location": location.pathname.replace(/\/[^/]+$/, "") + "/UCMapWebGIS/heatmap"
    }, {
        name: "config",
        location: location.pathname.replace(/\/[^/]+$/, "") + "/config"
    }]
};
//alert(dojoConfig.packages[1].location);
