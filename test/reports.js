var testReports = {
    startTest: {
        name: "report1",
        agg: [{ $group: {_id: '$ua', count: { $sum: 1 }}}],
        cron: "*/5 * * * * *",
        timezone: "EST"
    },
    insertMasterTest: {
        name: "report2",
        agg: [{ $group: {_id: '$ua', count: { $sum: 1 }}}],
        cron: "*/5 * * * * *",
        timezone: "EST"
    },
    insertSpeedTest: {
        name: "report3",
        agg: [{ $group: {_id: '$ua', count: { $sum: 1 }}}],
        cron: "*/5 * * * * *",
        timezone: "EST"
    },
    startNoCronTest: {
        name: "report4",
        agg: [{ $group: {_id: '$ua', count: { $sum: 1 }}}],
        cron: "* * * * * *",
        timezone: "EST",
        startCron: false
    },
    ttlTest: {
        name: "report5",
        agg: [{ $group: {_id: '$ua', count: { $sum: 1 }}}],
        cron: "*/10 * * * * *",
        timezone: "EST"
    },
    totalTest: {
        name: "report6",
        agg: [{ $group: {_id: '$ua', count: { $sum: 1 }}}],
        cron: "*/4 * * * * *",
        timezone: "EST"
    },
};

module.exports = testReports;
