var app = angular.module('OData', []);

app.controller('ODataCtrl', function ($scope, $http) {
    $scope.activeTable = "";
    $scope.tables = [];
    $http.get('/services/tables').then(function(response){
        $scope.tables = response.data;
    });

    $scope.$watch('activeTable', function(activeTable, oldValue) {
        $http.get('/services/tables/' + activeTable).then(function(response) {
            $scope.columns = response.data.columns;
            $scope.rows = response.data.rows;
        });
    });

    $scope.test = [
        { one: "1", two: "two" },
        { one: "one", two: "2" }
    ];
});
