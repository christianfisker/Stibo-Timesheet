<!DOCTYPE html>
<html lang="da">
<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Ugeseddel - ColorPrint</title>

    <link rel="stylesheet" href="css/bootstrap.min.css" />
    <link rel="stylesheet" href="css/bootstrap-theme.min.css" />
    <link rel="stylesheet" href="css/stibo.weeksheet.css" />

    <link rel="stylesheet" href="css/toastr.min.css" />

    <!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
            <script src="js/libs/html5shiv.js"></script>
            <script src="js/libs/respond.min.js"></script>
        <![endif]-->
</head>
<body>

    <!-- NAVIGATION -->

    <nav class="navbar navbar-default" role="navigation">
        <div class="container-fluid">
            <!-- Brand and toggle get grouped for better mobile display -->
            <div class="navbar-header">
                <a class="navbar-brand" href="#">ColorPrint Ugeseddel</a>
            </div>
            <!-- Collect the nav links, forms, and other content for toggling -->
            <div>
                <ul class="nav navbar-nav">
                    <li><a href="default.aspx">Gå til Stibo ugeseddel</a></li>
                </ul>

                <button type="button" class="btn btn-default navbar-btn" data-toggle="modal" data-target="#modal-timesheet-help">Vejledning</button>

                <!-- LOGIN VIEW - When logged out -->
                <form id="LoginView" class="navbar-form navbar-right" data-bind="visible: visible">
                    <div class="form-group">
                        <input type="text" placeholder="Medarbejdernummer" data-bind="textInput: username, hasFocus: hasFocus" />
                    </div>
                    <div class="form-group">
                        <input type="password" placeholder="Adgangskode" data-bind="textInput: password" />
                    </div>
                    <button type="submit" class="btn btn-primary" data-bind="click: onLogin, enable: canSubmit"><span class="glyphicon glyphicon-log-in"></span> Log ind</button>
                </form>

                <!-- USER VIEW - When logged in -->
                <form id="UserView" class="navbar-form navbar-right" style="display: none;" data-bind="visible: visible">
                    <span>
                        Velkommen, <b data-bind="text: name"></b>&nbsp;&nbsp;
                    </span>
                    <button type="button" class="btn btn-default" data-bind="click: onLogout"><span class="glyphicon glyphicon-log-out"></span> Log ud</button>
                </form>

            </div>
            <!-- /.navbar-collapse -->
        </div>
        <!-- /.container-fluid -->
    </nav>

    <!-- TIMESHEET OVERVIEW -->

    <div id="TimesheetOverviewView" class="container-fluid" style="display: none;" data-bind="visible: isVisible">
        <div class="well well-sm">

            <table class="table table-condensed">
                <thead>
                    <tr>
                        <th colspan="3">Medarbejder</th>
                        <th colspan="10">Ugenummer</th>
                        <th colspan="99" class="text-right">
                            <span style="padding: 3px; background-color: red;">Åben</span>&nbsp;
                            <span style="padding: 3px; background-color: yellow;">Afleveret</span>&nbsp;
                            <span style="padding: 3px; background-color: #00ff00;">Godkendt</span>&nbsp;
                            <span style="padding: 3px; background-color: #567ff2;">Godkendt (fejl)</span>&nbsp;
                            <span style="padding: 3px; background-color: #888888;">Lukket</span>
                        </th>
                    </tr>
                    <tr>
                        <th>Name</th>
                        <th>Nummer</th>
                        <th>Lokation</th>
                        <!-- ko foreach: weekRange -->
                        <th style="text-align: center;" data-bind="text: $data, css: $root.styleHeaderColumnCSS( $data )"></th>
                        <!-- /ko -->
                    </tr>
                </thead>
                <tbody data-bind="foreach: employees">
                    <!-- ko if( $root.isEmployeeVisible( employee ) ) -->
                    <tr>
                        <td data-bind="text: employee.name"></td>
                        <td data-bind="text: employee.username"></td>
                        <td data-bind="text: employee.location"></td>
                        <!-- ko foreach: weeks -->
                        <td data-bind="css: $root.styleBodyColumnCSS( $data ), click: $root.onWeekSelected, attr: { 'title': status }"></td>
                        <!-- /ko -->
                    </tr>
                    <!-- /ko -->
                </tbody>
            </table>
        </div>
    </div>

    <!-- TIMESHEET DETAILS -->

    <div id="TimesheetView" class="container-fluid" style="display: none;" data-bind="visible: isVisible">

        <!-- HEADER -->        
        <div class="row">
            <div class="col-md-7">
                <h3>Ugeseddel for uge <span data-bind="text: weekNumber()"></span>&nbsp;
                    <small><span data-bind="text: employeeName"></span>&nbsp;<span class="hide" data-bind="text: employeeId"></span></small>
                </h3>
                <p class="hide" data-bind="text: statusName()"></p>
            </div>
            <div class="col-md-5 text-right" data-bind="visible: isOpen">
                <p style="font-size: 0.2em;">&nbsp;</p>
                <button type="submit" class="btn btn-info" data-bind="click: onBtnSave" title="">Gem</button>
                <!-- ko if( userRole() === 1 ) -->
                <button type="button" class="btn btn-primary" data-bind="click: onBtnSubmit">Gem &amp; Aflevér</button>
                <!-- /ko -->
                <!-- ko if( userRole() === 2 ) -->
                <button type="button" class="btn btn-primary" data-bind="click: onBtnSubmit">Gem &amp; godkend</button>
                <!-- /ko -->
                <!-- ko if( userRole() === 3 ) -->
                <button type="submit" class="btn btn-primary" data-bind="click: onBtnSubmit">Gem &amp; luk</button>
                <!-- /ko -->
                <button type="submit" class="btn btn-default" data-bind="click: onBtnCancel">Annullér</button>
            </div>
            <div class="col-md-2" data-bind="visible: isClosed">
                <p style="margin-top: 12px;">Godkendt af: <span data-bind="text: modifiedByName"></span></p>
            </div>
            <div class="col-md-3 text-right" data-bind="visible: isClosed">
                <p style="font-size: 0.2em;">&nbsp;</p>
                <div class="btn-group" data-toggle="buttons">
                    <label class="btn btn-primary" data-bind="click: onBtnLoadEmployeeVersion" >
                        <input type="radio" name="TimesheetVersion" /> Medarbejder
                    </label>
                    <label class="btn btn-primary" data-bind="click: onBtnLoadApproverVersion" >
                        <input type="radio" name="TimesheetVersion" /> Godkender
                    </label>
                    <label class="btn btn-primary active" data-bind="click: onBtnLoadPayrollVersion">
                        <input type="radio" name="TimesheetVersion" checked /> Løn
                    </label>
                </div>
                <button type="button" class="btn btn-default" data-bind="click: onBtnCancel">Cancel</button>
            </div>
        </div>

        <div class="row">

            <!-- LEFT COLUMN -->

            <div class="col-md-8">

                <!-- Ugeseddel linjer - FORKEL MELLEM SGT OG CPV - PLACERING AF SØNDAG -->
                <table class="table table-condensed stibo-timesheet-lines">
                    <thead>
                        <tr class="right">
                            <th></th>
                            <th>Mandag</th>
                            <th>Tirsdag</th>
                            <th>Onsdag</th>
                            <th>Torsdag</th>
                            <th>Fredag</th>
                            <th>L&oslash;rdag</th>
                            <th>S&oslash;ndag</th>
                            <th>I alt</th>
                        </tr>
                    </thead>
                    <script type="text/html">
                    <tfoot>
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td style="text-align: right; font-weight: bold" data-bind="text: total, style: { backgroundColor: getTotalBackgroundColor }"></td>
                        </tr>
                    </tfoot>
                    </script>
                    <tbody id="_navigationkeys" data-bind="foreach: lines, visible: isOpen">
                        <!-- ko if ( getLineView() === 'hours' ) -->
                        <tr class="right">
                            <td style="text-align: left;" data-bind="text: description"></td>
                            <td>
                                <input type="text" data-bind="hourValue: monday, attr: { 'data-row': $index(), 'data-column': 0 }" /></td>
                            <td>
                                <input type="text" data-bind="hourValue: tuesday, attr: { 'data-row': $index(), 'data-column': 1 }" /></td>
                            <td>
                                <input type="text" data-bind="hourValue: wednesday, attr: { 'data-row': $index(), 'data-column': 2 }" /></td>
                            <td>
                                <input type="text" data-bind="hourValue: thursday, attr: { 'data-row': $index(), 'data-column': 3 }" /></td>
                            <td>
                                <input type="text" data-bind="hourValue: friday, attr: { 'data-row': $index(), 'data-column': 4 }" /></td>
                            <td>
                                <input type="text" data-bind="hourValue: saturday, attr: { 'data-row': $index(), 'data-column': 5 }" /></td>
                            <td>
                                <input type="text" data-bind="hourValue: sunday, attr: { 'data-row': $index(), 'data-column': 6 }" /></td>
                            <td style="text-align: right;" data-bind="text: totalForLine"></td>
                        </tr>
                        <!-- /ko -->
                        <!-- ko if (type === 'SUM-HOURS' ) -->
                        <tr>
                            <td colspan="8"></td>
                            <td style="text-align: right; font-weight: bold" data-bind="text: $root.totalHours, style: { backgroundColor: $root.getTotalBackgroundColor }"></td>
                        </tr>
                        <!-- /ko -->
                        <!-- ko if (type.lastIndexOf('HEADER', 0) === 0) -->
                        <tr>
                            <td colspan="9" data-bind="text: description" style="font-weight: bold;"></td>
                        </tr>
                        <!-- /ko -->
                        <!-- ko if (type === 'SUM-MARKUP1' ) -->
                        <tr>
                            <td colspan="8"></td>
                            <td style="text-align: right; font-weight: bold" data-bind="text: $root.totalSupplement1Hours">Markup1</td>
                        </tr>
                        <!-- /ko -->
                        <!-- ko if (type === 'SUM-MARKUP2' ) -->
                        <tr>
                            <td colspan="8"></td>
                            <td style="text-align: right; font-weight: bold" data-bind="text: $root.totalSupplement2Hours">Markup2</td>
                        </tr>
                        <!-- /ko -->
                    </tbody>
                    <tbody data-bind="foreach: lines, visible: isClosed">
                        <!-- ko if ( getLineView() === 'hours' ) -->
                        <tr class="right">
                            <td style="text-align: left;" data-bind="text: description"></td>
                            <td class="display" data-bind="text: monday"></td>
                            <td class="display" data-bind="text: tuesday"></td>
                            <td class="display" data-bind="text: wednesday"></td>
                            <td class="display" data-bind="text: thursday"></td>
                            <td class="display" data-bind="text: friday"></td>
                            <td class="display" data-bind="text: saturday"></td>
                            <td class="display" data-bind="text: sunday"></td>
                            <td style="text-align: right;" data-bind="text: totalForLine"></td>
                        </tr>
                        <!-- /ko -->
                        <!-- ko if (type === 'SUM-HOURS' ) -->
                        <tr>
                            <td colspan="8"></td>
                            <td style="text-align: right; font-weight: bold" data-bind="text: $root.totalHours, style: { backgroundColor: $root.getTotalBackgroundColor }"></td>
                        </tr>
                        <!-- /ko -->
                        <!-- ko if (type.lastIndexOf('HEADER', 0) === 0) -->
                        <tr>
                            <td colspan="9" data-bind="text: description" style="font-weight: bold;"></td>
                        </tr>
                        <!-- /ko -->
                        <!-- ko if (type === 'SUM-MARKUP1' ) -->
                        <tr>
                            <td colspan="8"></td>
                            <td style="text-align: right; font-weight: bold" data-bind="text: $root.totalSupplement1Hours">Markup1</td>
                        </tr>
                        <!-- /ko -->
                        <!-- ko if (type === 'SUM-MARKUP2' ) -->
                        <tr>
                            <td colspan="8"></td>
                            <td style="text-align: right; font-weight: bold" data-bind="text: $root.totalSupplement2Hours">Markup2</td>
                        </tr>
                        <!-- /ko -->
                    </tbody>
                </table>

            </div>

            <!-- RIGHT COLUMN -->
            <div class="col-md-4">


                <!-- Valg af maskine -->
                <table class="table table-condensed table-bordered">
                    <thead></thead>
                    <tfoot></tfoot>
                    <tbody>
                        <tr class="header">
                            <!-- ko foreach: machines -->
                            <td style="text-align: center" data-bind="text: name, click: $root.selectMachine"></td>
                            <!-- /ko -->
                        </tr>
                        <tr>
                            <!-- ko foreach: machines -->
                            <td style="text-align: center">
                                <input type="radio" name="machineGroup" data-bind="value: id, checked: $root.machine, checkedValue: $data, enable: $root.isOpen" /></td>
                            <!-- /ko -->
                        </tr>
                    </tbody>
                </table>

                <!-- Valg af skift -->
                <table class="table table-condensed table-bordered">
                    <thead></thead>
                    <tfoot></tfoot>
                    <tbody>
                        <tr class="header">
                            <!-- ko foreach: teamShifts -->
                            <td style="text-align: center" data-bind="text: title, click: $root.selectShift"></td>
                            <!-- /ko -->
                        </tr>
                        <tr class="subheader">
                            <!-- ko foreach: teamShifts -->
                            <td style="text-align: center" data-bind="text: hours, click: $root.selectShift"></td>
                            <!-- /ko -->
                        </tr>
                        <tr>
                            <!-- ko foreach: teamShifts -->
                            <td style="text-align: center">
                                <input type="radio" name="shiftGroup" data-bind="value: id, checked: $root.shift, enable: $root.isOpen" /></td>
                            <!-- /ko -->
                        </tr>
                    </tbody>
                </table>


                <!-- Ekstra information -->
                <table class="table table-condensed" style="text-align: right;" data-bind="visible: isOpen">
                    <thead>
                        <tr><th>Timer</th><th style="text-align: right;">Opsparet</th></tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="text-align: left;">Ferie</td><td data-bind="text: employeeSaldoFerie().toFixed(2)"></td>
                        </tr>
                        <tr>
                            <td style="text-align: left;">FerieFri</td><td data-bind="text: employeeSaldoFerieFri().toFixed(2)"></td>
                        </tr>
                        <tr>
                            <td style="text-align: left;">Afspadsering</td><td data-bind="text: employeeSaldoAfspadsering().toFixed(2)"></td>
                        </tr>
                        <tr>
                            <td style="text-align: left;">Genetime</td><td data-bind="text: employeeSaldoGene().toFixed(2)"></td>
                        </tr>
                    </tbody>
                    <script type="text/html">
                    <!-- Udkommenteret - funktionalitet kan blive implementeret senere efter behov. Er afhængig af AX og lidt tilretninger.
                    <thead>
                        <tr><th>Timer</th><th style="text-align: right;">Opsparet</th><th style="text-align: right;">Brugt</th><th style="text-align: right;">Rest</th></tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="text-align: left;">Ferie</td><td data-bind="text: employee.saldoFerie.toFixed( 2 )"></td><td data-bind="    text: brugtFerie"></td><td data-bind="    text: restFerie"></td>
                        </tr>
                        <tr>
                            <td style="text-align: left;">FerieFri</td><td data-bind="text: employee.saldoFerieFri.toFixed( 2 )"></td><td data-bind="    text: brugtFerieFri"></td><td data-bind="    text: restFerieFri"></td>
                        </tr>
                        <tr>
                            <td style="text-align: left;">Afspadsering</td><td data-bind="text: employee.saldoAfspadsering.toFixed( 2 )"></td><td data-bind="    text: brugtAfspadsering"></td><td data-bind="    text: restAfspadsering"></td>
                        </tr>
                        <tr>
                            <td style="text-align: left;">Genetime</td><td data-bind="text: employee.saldoGene.toFixed( 2 )"></td><td data-bind="    text: brugtGene"></td><td data-bind="    text: restGene"></td>
                        </tr>
                    </tbody>
                    -->
                    </script>
                </table>
                <form role="form">
                    <!-- ko if ( location() !== 'Bogbind' ) -->
                    <div class="checkbox">
                        <label>
                            <input type="checkbox" data-bind="checked: treForlaegning, enable: isOpen">
                            3 forlægning
                        </label>
                    </div>
                    <div class="checkbox">
                        <label>
                            <input type="checkbox" data-bind="checked: fireForlaegning, enable: isOpen">
                            4 forlægning
                        </label>
                    </div>
                    <div class="checkbox">
                        <label>
                            <input type="checkbox" data-bind="checked: femForlaegning, enable: isOpen">
                            5 forlægning
                        </label>
                    </div>
                    <div class="checkbox">
                        <label>
                            <input type="checkbox" data-bind="checked: raadighedsvagt, enable: isOpen">
                            Rådighedsvagt
                        </label>
                    </div>
                    <!-- /ko -->
                    <div class="form-group">
                        <label for="exampleInputEmail1">Kommentarer og meddelelser</label>
                        <textarea id="Textarea1" class="form-control" rows="8" data-bind="value: comment, enable: isOpen"></textarea>
                    </div>
                </form>

            </div>

        </div>

    </div>


    <!-- MODAL WINDOW FOR HELP -->
    <div id="modal-timesheet-help" class="modal" tabindex="-1" role="dialog" data-remote="vejledning/vejledning.html">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <!-- Indhold indlæses fra ekstern fil - vejledning.html -->
            </div>
        </div>
    </div>


    <!-- jQuery -->
    <script src="js/libs/jquery.min.js"></script>
    <!-- Bootstrap plugins -->
    <script src="js/libs/bootstrap.min.js"></script>
    <!-- KnockoutJS -->
    <script src="js/libs/knockout-3.2.0.js"></script>
    <!-- UnderscoreJS -->
    <script src="js/libs/underscore-min.js"></script>
    <!-- Toastr for popup notifications -->
    <script src="js/libs/toastr.min.js"></script>

    <!-- References to custom JavaScript -->
    <script src="js/utils/columbus.jquery.pubsub.js?v=20140926"></script>
    <script src="js/app/utils.js"></script>
    <script src="js/app/configuration-cpv.js"></script>
    <script src="js/app/dataservice.js?v=20150212"></script>
    <script src="js/app/models.js?v=20150212"></script>
    <script src="js/app/userviewmodel.js?v=20150212"></script>
    <script src="js/app/loginviewmodel.js?v=20150212"></script>
    <script src="js/app/overviewviewmodel.js?v=20150212"></script>
    <script src="js/app/timesheetviewmodel.js?v=20150212"></script>
    <script src="js/app/timesheetlineviewmodel.js?v=20150212"></script>
    <script src="js/app/main.dispatcher.js?v=20150212"></script>
    <script src="js/app/main.timesheetfactory.js?v=20150212"></script>
    <script src="js/app/main.js?v=20150212"></script>

    <script>
        $( function () {

            $( '#_navigationkeys' ).on( 'keyup', function ( event ) {
                var keyCode = event.keyCode,
                    container = $('#_navigationkeys');

                function moveVertical( direction ) {

                    var sourceField = $( event.target ),
                        row = sourceField.data( 'row' ),
                        column = sourceField.data( 'column' ),
                        newRow = row + direction;
                    // hvilket indeks har dette felt på rækken??

                    var target = container.find( 'input[data-row=' + newRow + ']' );
                    target = target.filter('input[data-column='+column+']');
                    target.focus();
                    target.select();
                }

                if ( keyCode == 40 ) {
                    // down
                    moveVertical( 1 );
                }
                else if ( keyCode == 38 ) {
                    // up
                    moveVertical( -1 );
                }

            } );


            $( 'body' ).on( 'keypress', function ( event ) {
                // F1 - open help modal
                // Escape - close open timesheet
                // Ctrl + Q - Log out
                // Ctrl + S - Save active timesheet

                //console.log( 'kc = '+event.keyCode+ ', k = '+ event.key+', cc = '+event.charCode+', ctrl = ' + event.ctrlKey );

                var keyCode = event.keyCode,
                    key = event.key,
                    isCtrl = event.ctrlKey;

                if ( isCtrl ) {
                    if ( key === 'v' ) {
                        // Ctrl + v - shop help
                        //$.Topic( 'shortcut.help' ).publish();
                        // No, this binding does not make sense...
                    }
                    else if ( key === 'q' ) {
                        // Ctrl + Q - logout user.
                        $.Topic( 'shortcut.logout' ).publish();
                    }
                    else if ( key === 's' ) {
                        // Ctrl + S - Save current timesheet.
                        $.Topic( 'shortcut.savetimesheet' ).publish();
                    }
                }
                else {
                    //if ( keyCode === 112 ) {
                    //    // F1 key - open help modal if not already open.
                    //    event.stopPropagation();
                    //    event.preventDefault();
                    //}
                    if ( keyCode === 27 ) {
                        // Escape - cancel and close current timesheet - not if help modal i open!
                        $.Topic( 'shortcut.canceltimesheet' ).publish();
                    }

                }

            } );
        } );
    </script>

</body>
</html>
