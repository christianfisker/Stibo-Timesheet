<!DOCTYPE html>
<html lang="da">
<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>STIBO Ugeseddel</title>

    <link rel="stylesheet" href="css/bootstrap.min.css" />
    <link rel="stylesheet" href="css/bootstrap-theme.min.css" />
    <link rel="stylesheet" href="css/stibo.weeksheet.css" />

    <!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
            <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
            <script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
        <![endif]-->
</head>
<body>

    <!-- Navigation -->
    <nav class="navbar navbar-default" role="navigation">
        <div class="container-fluid">
            <!-- Brand and toggle get grouped for better mobile display -->
            <div class="navbar-header">
                <a class="navbar-brand" href="#">Stibo Ugeseddel</a>
            </div>
            <!-- Collect the nav links, forms, and other content for toggling -->
            <div>
                <ul class="nav navbar-nav hidden">
                    <li class="active"><a href="#">Link</a></li>
                    <li><a href="#">Link</a></li>
                </ul>

                <!-- LOGIN COMPONENT -->
                <div id="LoginComponent">
                    <!-- Logged out -->
                    <form class="navbar-form navbar-right" data-bind="visible: !user.isLoggedIn">
                        <div class="form-group">
                            <input type="text" placeholder="Brugernavn" data-bind="value: username, valueUpdate: 'input'" />
                        </div>
                        <div class="form-group">
                            <input type="password" autocomplete="off" placeholder="Adgangskode" data-bind="value: password, valueUpdate: 'input'" />
                        </div>
                        <button type="submit" class="btn btn-primary" data-bind="click: btnLogin, enable: canSubmit">Log ind</button>
                    </form>
                    <!-- Logged in -->
                    <button type="button" class="btn btn-default navbar-btn navbar-right" data-bind="click: btnLogout, visible: user.isLoggedIn">Log ud</button>
                    <p class="navbar-text navbar-right" data-bind="visible: user.isLoggedIn">
                        Velkommen, <b data-bind="text: user.name"></b>&nbsp;&nbsp;
                    </p>

                </div>

            </div>
            <!-- /.navbar-collapse -->
        </div>
        <!-- /.container-fluid -->
    </nav>

    <!-- Timesheet Overview Component -->
    <div id="TimesheetOverviewComponent" class="container-fluid" data-bind="visible: isVisible">
        <div class="well well-sm">
        <!--button class="btn btn-default" data-bind="click: onBtnRefresh">Refresh</button-->
        <table class="table table-condensed">
            <thead>
                <tr>
                    <th colspan="3">Medarbejder</th>
                    <th colspan="99">Ugenummer</th>
                </tr>
                <tr>
                    <th>Name</th>
                    <th>Number</th>
                    <th>Lokation</th>
                    <!-- ko foreach: weekRange -->
                    <th data-bind="text: $data, css: $root.styleHeaderColumnCSS( $data )"></th>
                    <!-- /ko -->
                </tr>
            </thead>
            <tbody data-bind="foreach: employees">
                <!-- ko if($root.currentEmployeeId === null || employee.id === $root.currentEmployeeId) -->
                <tr data-bind="attr: { 'data-userid': employee.id }">
                    <td data-bind="text: employee.name"></td>
                    <td data-bind="text: employee.id"></td>
                    <td data-bind="text: employee.location"></td>
                    <!-- ko foreach: weeks -->
                    <td data-bind="css: $root.styleBodyColumnCSS( $data ), click: $root.onSelectWeek, attr: { 'title': status }"></td>
                    <!-- /ko -->
                </tr>
                <!-- /ko -->
            </tbody>
        </table>
        </div>
    </div>


    <!-- Timesheet Detail Component -->
    <div id="TimesheetDetailComponent" class="container-fluid" data-bind="visible: isVisible">

        <!-- ko if( !isEmpty() ) -->

        <div class="row">
            <div class="col-md-8">
                <h3>Valgt ugeseddel
                    <small><span data-bind="text: header.employeeId"></span>&nbsp;<span data-bind="text: header.week"></span></small>
                </h3>
            </div>
            <div class="col-md-4 text-right">
                <button type="submit" class="btn btn-info" data-bind="click: onBtnSave">Gem</button>
                <!-- ko if( user.role === 1 ) -->
                <button type="submit" class="btn btn-primary" data-bind="click: onBtnSubmit">Gem &amp; Aflever</button>
                <!-- /ko -->
                <!-- ko if( user.role === 2 ) -->
                <button type="submit" class="btn btn-primary" data-bind="click: onBtnSubmit">Gem &amp; godkend</button>
                <!-- /ko -->
                <!-- ko if( user.role === 3 ) -->
                <button type="submit" class="btn btn-primary" data-bind="click: onBtnSubmit">Gem &amp; luk</button>
                <!-- /ko -->
                <button type="submit" class="btn btn-default" data-bind="click: onBtnCancel">Cancel</button>
            </div>
        </div>
        <div class="row">
            <div class="col-md-8">
                <table class="table table-condensed stibo-timesheet-lines">
                    <thead>
                        <tr>
                            <th></th>
                            <th>S&oslash;ndag</th>
                            <th>Mandag</th>
                            <th>Tirsdag</th>
                            <th>Onsdag</th>
                            <th>Torsdag</th>
                            <th>Fredag</th>
                            <th>L&oslash;rdag</th>
                            <th>I alt</th>
                        </tr>
                    </thead>
                    <tfoot>
                        <tr>
                            <td></td>
                            <td data-bind="text: header.getColumnTotal( 'sunday' )"></td>
                            <td data-bind="text: header.getColumnTotal( 'monday' )"></td>
                            <td data-bind="text: header.getColumnTotal( 'tuesday' )"></td>
                            <td data-bind="text: header.getColumnTotal( 'wednesday' )"></td>
                            <td data-bind="text: header.getColumnTotal( 'thursday' )"></td>
                            <td data-bind="text: header.getColumnTotal( 'friday' )"></td>
                            <td data-bind="text: header.getColumnTotal( 'saturday' )"></td>
                            <td style="text-align: right;" data-bind="text: header.getTotal(), style: { backgroundColor: header.getTotalBackgroundColor() }"></td>
                        </tr>
                    </tfoot>
                    <tbody data-bind="foreach: lines">
                        <tr data-bind="css: { 'bg-danger': hasError() }">
                            <td data-bind="text: description"></td>
                            <td>
                                <input type="text" data-bind="simpleValue: sunday" /></td>
                            <td>
                                <input type="text" data-bind="value: monday" /></td>
                            <td>
                                <input type="text" data-bind="value: tuesday" /></td>
                            <td>
                                <input type="text" data-bind="value: wednesday" /></td>
                            <td>
                                <input type="text" data-bind="value: thursday" /></td>
                            <td>
                                <input type="text" data-bind="value: friday" /></td>
                            <td>
                                <input type="text" data-bind="value: saturday" /></td>
                            <td style="text-align: right;" data-bind="text: getTotal()"></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="col-md-4">

                <!-- Valg af maskine -->

                <table class="table table-condensed table-bordered">
                    <thead></thead>
                    <tfoot></tfoot>
                    <tbody>
                        <tr class="header">
                            <!-- ko foreach: machines -->
                            <td data-bind="text: name"></td>
                            <!-- /ko -->
                        </tr>
                        <tr>
                            <!-- ko foreach: machines -->
                            <td>
                                <input type="radio" name="machineGroup" data-bind="value: id, checked: $root.header.machine" /></td>
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
                            <!-- ko foreach: shifts -->
                            <td data-bind="text: title"></td>
                            <!-- /ko -->
                        </tr>
                        <tr class="subheader">
                            <!-- ko foreach: shifts -->
                            <td data-bind="text: hours"></td>
                            <!-- /ko -->
                        </tr>
                        <tr>
                            <!-- ko foreach: shifts -->
                            <td>
                                <input type="radio" name="shiftGroup" data-bind="value: id, checked: $root.header.shift" /></td>
                            <!-- /ko -->
                        </tr>
                    </tbody>
                </table>

                <form role="form">
                    <div class="form-group">
                        <p>Ferie <span data-bind="text: $root.employee.saldoFerie"></span>&nbsp;(<span data-bind="text: header.restFerie()"></span>)</p>
                        <p>FerieFri <span data-bind="text: $root.employee.saldoFerieFri"></span>&nbsp;(<span data-bind="text: header.restFerieFri()"></span>)</p>
                        <p>Afspadsering <span data-bind="text: $root.employee.saldoAfspadsering"></span></p>
                        <p>Gene <span data-bind="text: $root.employee.saldoGene"></span></p>
                    </div>
                    <div class="checkbox">
                        <label>
                            <input type="checkbox" data-bind="checked: header.hasLeadPressSupplement">
                            Førertrykkertillæg
                        </label>
                    </div>
                    <div class="form-group">
                        <label for="exampleInputEmail1">Kommentarer og meddelelser</label>
                        <textarea id="exampleInputEmail1" class="form-control" rows="3" data-bind="value: header.comment"></textarea>
                    </div>

                    <button data-bind="click: showModal">Modal!</button>
                </form>

            </div>
            <!-- end column -->

        </div>
        <!-- end row -->

        <div class="modal xfade" id="modalTest">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Luk</span></button>
                        <h4 class="modal-title">Ændringer ikke gemt</h4>
                    </div>
                    <div class="modal-body">
                        <p>Der er ændringer til ugesedlen som ikke er blevet gemt. Vælg en af mulighederne herunder&hellip;</p>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn btn-info" data-bind="click: onBtnSave">Gem</button>
                        <!-- ko if( user.role === 1 ) -->
                        <button type="submit" class="btn btn-primary" data-bind="click: onBtnSubmit">Gem &amp; Aflever</button>
                        <!-- /ko -->
                        <!-- ko if( user.role === 2 ) -->
                        <button type="submit" class="btn btn-primary" data-bind="click: onBtnSubmit">Gem &amp; godkend</button>
                        <!-- /ko -->
                        <!-- ko if( user.role === 3 ) -->
                        <button type="submit" class="btn btn-primary" data-bind="click: onBtnSubmit">Gem &amp; luk</button>
                        <!-- /ko -->
                        <button type="submit" class="btn btn-default" data-bind="click: onBtnCancel">Cancel</button>
                    </div>
                </div>
                <!-- /.modal-content -->
            </div>
            <!-- /.modal-dialog -->
        </div>
        <!-- /.modal -->

        <!-- /ko -->

    </div>
    <!-- end component -->

    <!-- jQuery (Required by Bootstrap & Kendo) -->
    <script src="js/libs/jquery.min.js"></script>

    <!-- Bootstrap plugins -->
    <script src="js/libs/bootstrap.min.js"></script>

    <!-- KnockoutJS -->
    <script src="js/libs/knockout-3.2.0.js"></script>
    <script src="js/libs/knockout-es5.min.js"></script>

    <!-- UnderscoreJS -->
    <script src="js/libs/underscore-min.js"></script>

    <!-- Kendo UI Web -->
    <!--script src="js/libs/kendo.web.min.js"></script-->

    <!-- References to custom JavaScript -->
    <script src="js/utils/columbus.jquery.pubsub.js"></script>
    <!--script src="js/modules/stibo.weeksheet.dataSource.js"></script-->
    <script src="js/app_orig/stibo.weeksheet.dataService.js"></script>
    <script src="js/app_orig/stibo.weeksheet.models.js"></script>

    <script src="js/app_orig/Configuration.js"></script>
    <script src="js/app_orig/User.js"></script>
    <script src="js/app_orig/Login.js"></script>
    <script src="js/app_orig/Overview.js"></script>
    
    <script src="js/app_orig/TimesheetHeader.js"></script>
    <script src="js/app_orig/TimesheetLine.js"></script>
    <script src="js/app_orig/Details.js"></script>

    <script src="js/app_orig/stibo.weeksheet.main.js"></script>
    <script src="js/app_orig/weeksheet.js"></script>

</body>
</html>
