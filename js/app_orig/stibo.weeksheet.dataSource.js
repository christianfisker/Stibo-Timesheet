var STIBO = window.STIBO || {};

STIBO.dataSource = ( function () {

    var query = {
        startWeek: '201410',
        endWeek: '201430',
        weekCount: 21
    };

    var result = [
        {
            employee: {
                id: 'CFI',
                name: 'Christian Fisker',
                machine: 'ROT'
            },
            timesheets: [
                {
                    week: '201410',
                    status: 'CLOSED'
                },
                {
                    week: '201411',
                    status: 'OPEN'
                }
            ]
        },
        {
            employee: {
                id: 'MCL',
                name: 'Michael Clausen',
                machine: 'ARK'
            },
            timesheets: [
                {
                    week: '201410',
                    status: 'CLOSED'
                },
                {
                    week: '201411',
                    status: 'CLOSED'
                }
            ]
        }
    ];



    var employeeData = [
        { id: 'CFI', name: 'Christian Fisker', category: 'ROT' },
        { id: 'MCL', name: 'Michael Clausen', category: 'ROT' },
        { id: 'MDV', name: 'Michael Dvinge', category: 'ARK' }
    ];

    var sheetData = [
        { id: '201417CFI', userId: 'CFI', weekId: '2014-17', machine: '', shift: '', version: '', status: '' },
        { id: '201418CFI', userId: 'CFI', weekId: '2014-18', machine: '', shift: '', version: '', status: '' },
        { id: '201419CFI', userId: 'CFI', weekId: '2014-19', machine: '', shift: '', version: '', status: '' },
        { id: '201417MDV', userId: 'MDV', weekId: '2014-17', machine: '', shift: '', version: '', status: '' },
        { id: '201418MDV', userId: 'MDV', weekId: '2014-18', machine: '', shift: '', version: '', status: '' },
        { id: '201419MDV', userId: 'MDV', weekId: '2014-19', machine: '', shift: '', version: '', status: '' },
        { id: '201417MCL', userId: 'MCL', weekId: '2014-17', machine: '', shift: '', version: '', status: '' }
    ];

    var sheetLineData = [
        { id: '1', sheetId: '201417CFI', userId: 'CFI', type: 'normal', sunday: 0, monday: 0 },
        { id: '2', sheetId: '201417CFI', userId: 'CFI', type: 'overtime', sunday: 0, monday: 0 },
    ];

    var employees = {},
        sheets = {},
        sheetLines = {};

    employees = new kendo.data.DataSource( { data: employeeData } );
    employees.read();

    sheets = new kendo.data.DataSource( { data: sheetData } );
    sheets.read();

    sheetLines = new kendo.data.DataSource( { data: sheetLineData } );
    sheetLines.read();

    return {
        employees: employees,
        sheets: sheets,
        sheetLines: sheetLines
    };
} )();