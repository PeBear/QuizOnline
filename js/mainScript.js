var app = angular.module("myapp", ["ngRoute"]);

app.config(function($routeProvider) {
    $routeProvider
        .when("/subjects", {
            templateUrl: "subjects.html",
            controller: "subjectCtrl"
        })
        .when("/subjects/:id", {
            templateUrl: "quizDetail.html",
            controller: "quizDetailCtrl"
        })
        .when("/about", {
            templateUrl: "about.html"
        })

    .otherwise({
        templateUrl: "subjects.html",
        controller: "subjectCtrl"
    });
});

app.filter('range', function() {
    return function(input, total) {
        total = parseInt(total);

        for (var i = 0; i < total; i++) {
            input.push(i);
        }

        return input;
    };
});

app.controller("homeCtrl", function($scope, $rootScope) {
    $scope.change = {};
    $scope.change.inValid = false;
    $scope.signOut = function() {
        $rootScope.rootStudent = null;
        Swal.fire({
            title: 'INFO',
            html: "Bạn đã đăng xuất",
            icon: 'info',
            confirmButtonText: 'OK'
        });
    }

    $scope.update = function(isValid) {
        if (isValid) {
            angular.forEach($rootScope.students, student => {
                if (student.username == $rootScope.username) {
                    let index = $rootScope.students.indexOf(student);
                    $rootScope.students.splice(index);
                    $rootScope.students.push($rootScope.student);
                    Swal.fire({
                        title: 'Success!',
                        html: "Cập nhật thông tin thành công",
                        icon: 'success',
                        confirmButtonText: 'Cool'
                    });
                    $('#updateModal').modal('hide');
                }
            });
        }
    }

    $scope.changePassword = function(isValid) {
        if (isValid) {
            if ($scope.change.password == $rootScope.rootStudent.password) {
                if ($scope.change.newPassword == $scope.change.confirmPassword) {
                    $rootScope.rootStudent.password = $scope.change.newPassword;
                    Swal.fire({
                        title: 'Success!',
                        html: "Đổi mật khẩu thành công",
                        icon: 'success',
                        confirmButtonText: 'Cool'
                    });
                    $('#updatePasswordModal').modal('hide');
                }
            } else {
                Swal.fire({
                    title: 'Failed!',
                    html: "Mật khẩu hiện tại không đúng",
                    icon: 'error',
                    confirmButtonText: 'Cool'
                });
            }
        }
        $scope.change = {};
    }
});

app.controller("subjectCtrl", function($scope, $http) {
    //get data subjects
    $scope.subjects = [];
    $http
        .get("db/Subjects.js")
        .then(function(result) {
            $scope.subjects = result.data;
            $scope.pageCount = Math.ceil($scope.subjects.length / $scope.pageSize);
        });

    $scope.startQuiz = function(quizId, quizName) {
            console.log("startQuiz");
            Swal.fire({
                title: "Bạn có chắc?",
                html: "Bạn có chắc chắn muốn làm bài quiz môn <b>" + quizName + "</b>",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Làm bài!',
                cancelButtonText: 'Hủy'
            }).then((result) => {
                if (result.value) {
                    window.location = "#!subjects/" + quizId;
                }
            });
        }
        //pagination
    $scope.begin = 0;
    $scope.pageSize = 4;

    $scope.first = function() {
        $scope.begin = 0;
    }

    $scope.prev = function() {
        if ($scope.begin > 0) {
            $scope.begin -= $scope.pageSize;
        }
    }

    $scope.next = function() {
        if ($scope.begin < ($scope.pageCount - 1) * $scope.pageSize) {
            $scope.begin += $scope.pageSize;
        }
    }

    $scope.last = function() {
        $scope.begin = ($scope.pageCount - 1) * $scope.pageSize;
    }

});

app.controller("quizDetailCtrl", function($scope, $http, $routeParams, $interval) {
    $scope.quizs = [];
    $scope.tenRandomNumbers = [];
    $scope.index = 0;
    $scope.answerIdSelected;
    $scope.answers = [];
    $scope.lockQuiz = false;
    $http
        .get("db/Quizs/" + $routeParams.id + ".js")
        .then(function(result) {
            $scope.quizs = result.data;
            $scope.quizs = $scope.getTenRandomQuestions(result.data);
        });

    $scope.prev = function() {
        if ($scope.index < 0) {
            $scope.index = 0;
        } else {
            $scope.index -= 1;
        }
    }

    $scope.next = function() {
        if ($scope.index > 9) {
            $scope.index = 0;
        } else {
            $scope.index += 1;
        }
    }

    $scope.getMark = function() {
        $scope.mark = 0;
        $scope.lockQuiz = true;
        $interval.cancel(stop);
        for (let i = 0; i < $scope.answers.length; i++) {
            if ($scope.quizs[i].AnswerId == $scope.answers[i]) {
                $scope.mark++;
            }
        }
        if ($scope.mark >= 5) {
            Swal.fire({
                title: 'Success!',
                html: "Your mark is: <b>" + $scope.mark + "/10 </b>" + "<br/>You pass the exam!",
                icon: 'success',
                confirmButtonText: 'Cool'
            });
        } else {
            Swal.fire({
                title: 'Failed!',
                html: "Your mark is: <b>" + $scope.mark + "/10 </b>" +
                    "<br/>You aren't pass the exam!" +
                    "<br/> Just do it again!",
                icon: 'error',
                confirmButtonText: 'Sad'
            });
        }
    }

    $scope.getRandomNumber = function() {
        return Math.floor(Math.random() * $scope.quizs.length);
    }

    $scope.getTenRandomQuestions = function(questions) {
        let randomQuestions = [];
        tenRandomNumbers = $scope.getTenRandomNumber();
        for (let i = 0; i < 10; i++) {
            let index = $scope.tenRandomNumbers[i];
            randomQuestions.push(questions[index]);
        }
        return randomQuestions;
    }

    $scope.checkExistNumberInArray = function(number) {
        for (let i = 0; i < $scope.tenRandomNumbers.length; i++) {
            if ($scope.tenRandomNumbers[i] == number) {
                return true;
            }
        }
        return false;
    }

    $scope.getTenRandomNumber = function() {
        for (let i = 0; i < 10; i++) {
            let randomNumber = $scope.getRandomNumber();
            if ($scope.checkExistNumberInArray(randomNumber)) {
                i--;
            } else {
                $scope.tenRandomNumbers.push(randomNumber);
            }
        }
    }

    // Get date and time
    var now = new Date("Jan 5, 2021 10:15:00").getTime();
    // Set the date we're counting down to 15m
    var countDownDate = new Date(now + 15 * 60000);
    var width = 100;
    var stop;
    $scope.countDown = function() {
        if (angular.isDefined(stop)) return;

        stop = $interval(function() {
            now = new Date(now + 1000).getTime();
            // Find the distance between now and the count down date
            var distance = countDownDate - now;

            // Time calculations for days, hours, minutes and seconds
            // var days = Math.floor(distance / (1000 * 60 * 60 * 24));
            // var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // Output the result in an element with id="demo"
            $('#progressTimer').html(minutes + "m " + seconds + "s ");
            if ((distance / 1000) % 9 == 0) {
                width--;
                $('#progressTimer').width(width + '%');
            }
            // If the count down is over, write some text 
            if (distance < 0) {
                $interval.cancel(stop);
                Swal.fire({
                    title: 'Hết thời gian!',
                    text: 'Đã hết thời gian làm bài!',
                    icon: 'warning',
                    confirmButtonText: 'Sad'
                });
            }
        }, 1000);
    }
});

app.controller("loginCtrl", function($scope, $http, $rootScope, $filter) {
    $rootScope.students = [];
    $rootScope.rootStudent = null;
    $scope.invalid = false;
    $http
        .get("db/Students.js")
        .then(function(result) {
            $rootScope.students = result.data;
        });
    $scope.checkLogin = function() {
        var ok = false;
        angular.forEach($rootScope.students, student => {
            if (student.username == $scope.username) {
                if (student.password == $scope.password) {
                    ok = true;
                    Swal.fire({
                        title: 'Login Success!',
                        html: '<h1>Chào mừng tới <span style="color:red">Chill Hub</span> buddy !!!</h1>',
                        icon: 'success',
                        confirmButtonText: 'Cool',
                        width: 600,
                        padding: '3em',
                        background: '#fff url(/images/trees.png)',
                        backdrop: `
                                    rgba(0,0,123,0.4)
                                    url("images/nyan-cat.gif")
                                    left top
                                    no-repeat
                                `
                    });
                    $rootScope.rootStudent = student;
                    $rootScope.rootStudent.birthday = new Date(Date.parse(student.birthday));
                    $('#loginModal').modal('hide');
                }
            }
        });
        if (ok == false) {
            $scope.invalid = true;
        }
    }

});

app.controller("registerCtrl", function($scope, $rootScope) {
    $scope.student = {
        username: "",
        password: "",
        fullname: "",
        email: "",
        birthday: "",
        gender: true,
    }

    $scope.register = function(isValid) {
        if (isValid) {
            $rootScope.students.push($scope.student);
            Swal.fire({
                title: 'Success!',
                html: "Đăng ký thành công",
                icon: 'success',
                confirmButtonText: 'Cool'
            });
            $('#registerModal').modal('hide');
            $rootScope.rootStudent = $scope.student;
        }
    }
});