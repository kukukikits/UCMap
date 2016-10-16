var dojoConfig = {
    locale: 'en',
    isDebug: true,
    async: true,
    packages: [{
        "name": "UCMapWebGIS",
        "location": location.pathname.replace(/\/[^/]+$/, "") + "UCMap/UCMapWebGIS"
    }, {
        "name": "heatmap",
        "location": location.pathname.replace(/\/[^/]+$/, "") + "UCMap/UCMapWebGIS/heatmap"
    }, {
        name: "config",
        location: location.pathname.replace(/\/[^/]+$/, "") + "UCMap/config"
    }]
};
console.log(dojoConfig.packages);
